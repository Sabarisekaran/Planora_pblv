import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Plus,
  Trash2,
  Upload,
  Download,
  Bold,
  Italic,
  Copy,
  Settings2,
  Palette,
  Type,
  Loader,
  X,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { attendanceApi } from '../services/attendanceApi';
import { programApi } from '../services/programApi';

// ==========================================
// CANVAS SIZING CONSTANTS
// ==========================================
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 550;

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Replace placeholder tags with actual data
 * Dynamically supports any field from participant data
 * Example: <Name>, <Branch>, <Email> etc.
 */
function replaceFieldPlaceholders(text: string, data: Record<string, any>): string {
  if (!text || !data) return text;
  
  let updated = text;
  
  // Dynamically replace all field placeholders
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`<${key}>`, 'gi');
    updated = updated.replace(regex, data[key] || '');
  });
  
  // Also support lowercase variants for common fields
  updated = updated
    .replace(/<name>/gi, data.name || '')
    .replace(/<branch>/gi, data.branch || '')
    .replace(/<college>/gi, data.college || '')
    .replace(/<email>/gi, data.email || '')
    .replace(/<event>/gi, data.event || '');
  
  return updated;
}

// ==========================================
// DEFAULT CERTIFICATE TEMPLATES
// ==========================================

interface CertificateTemplate {
  id: string;
  name: string;
  thumbnail: string;
  generateBg: () => string;
}

const DEFAULT_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'gold-elegant',
    name: 'Gold Elegant',
    thumbnail: '#d4af37',
    generateBg: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1400;
      canvas.height = 900;
      const ctx = canvas.getContext('2d')!;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 1400, 900);
      gradient.addColorStop(0, '#f5f1e8');
      gradient.addColorStop(1, '#efe8dd');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1400, 900);

      // Gold border
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 8;
      ctx.strokeRect(40, 40, 1320, 820);

      // Decorative line
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, 1280, 780);

      // Ornamental corners
      ctx.fillStyle = '#d4af37';
      for (let i = 0; i < 4; i++) {
        const x = i % 2 === 0 ? 70 : 1330;
        const y = i < 2 ? 70 : 830;
        ctx.fillRect(x - 10, y - 10, 20, 20);
      }

      return canvas.toDataURL();
    },
  },
  {
    id: 'blue-corporate',
    name: 'Blue Corporate',
    thumbnail: '#0066cc',
    generateBg: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1400;
      canvas.height = 900;
      const ctx = canvas.getContext('2d')!;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1400, 900);

      // Blue header bar
      ctx.fillStyle = '#0066cc';
      ctx.fillRect(0, 0, 1400, 120);

      // Accent stripe
      ctx.fillStyle = '#004399';
      ctx.fillRect(0, 110, 1400, 10);

      // Subtle watermark
      ctx.fillStyle = 'rgba(0, 102, 204, 0.1)';
      ctx.font = 'bold 120px Arial';
      ctx.textAlign = 'right';
      ctx.fillText('CERTIFICATE', 1350, 500);

      return canvas.toDataURL();
    },
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    thumbnail: '#f0f0f0',
    generateBg: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1400;
      canvas.height = 900;
      const ctx = canvas.getContext('2d')!;

      // Clean white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1400, 900);

      // Thin top line
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.lineTo(1300, 100);
      ctx.stroke();

      // Thin bottom line
      ctx.beginPath();
      ctx.moveTo(100, 800);
      ctx.lineTo(1300, 800);
      ctx.stroke();

      return canvas.toDataURL();
    },
  },
  {
    id: 'dark-modern',
    name: 'Dark Modern',
    thumbnail: '#1a1a1a',
    generateBg: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1400;
      canvas.height = 900;
      const ctx = canvas.getContext('2d')!;

      // Dark background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, 1400, 900);

      // Neon accent
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(0, 0, 1400, 15);
      ctx.fillRect(0, 885, 1400, 15);

      // Text color will be white on dark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('MODERN CERTIFICATE', 700, 450);

      return canvas.toDataURL();
    },
  },
  {
    id: 'gradient-creative',
    name: 'Gradient Creative',
    thumbnail: '#ff6b9d',
    generateBg: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1400;
      canvas.height = 900;
      const ctx = canvas.getContext('2d')!;

      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, 1400, 900);
      gradient.addColorStop(0, '#ff6b9d');
      gradient.addColorStop(0.5, '#c44569');
      gradient.addColorStop(1, '#ffa502');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1400, 900);

      // Semi-transparent overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(50, 50, 1300, 800);

      return canvas.toDataURL();
    },
  },
  {
    id: 'classic-academic',
    name: 'Classic Academic',
    thumbnail: '#8b4513',
    generateBg: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1400;
      canvas.height = 900;
      const ctx = canvas.getContext('2d')!;

      // Parchment color
      ctx.fillStyle = '#f4e8d0';
      ctx.fillRect(0, 0, 1400, 900);

      // Border frame
      ctx.strokeStyle = '#8b4513';
      ctx.lineWidth = 12;
      ctx.strokeRect(60, 60, 1280, 780);

      // Inner frame
      ctx.strokeStyle = '#8b4513';
      ctx.lineWidth = 4;
      ctx.strokeRect(100, 100, 1200, 700);

      // Decorative elements
      ctx.fillStyle = '#8b4513';
      ctx.beginPath();
      ctx.arc(150, 150, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(1250, 150, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(150, 750, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(1250, 750, 8, 0, Math.PI * 2);
      ctx.fill();

      return canvas.toDataURL();
    },
  },
];

// ==========================================
// TYPES
// ==========================================

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
}

interface ImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasElement {
  type: 'text' | 'image';
  id: string;
  data: TextElement | ImageElement;
}

interface Participant {
  name: string;
  branch?: string;
  college?: string;
  email?: string;
  event?: string;
  [key: string]: any;
}

// ==========================================
// CERTIFICATE EDITOR COMPONENT
// ==========================================

const CertificateEditor: React.FC = () => {
  const { programId } = useParams<{ programId?: string }>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Template & Canvas State
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate>(DEFAULT_TEMPLATES[0]);
  const [templateBg, setTemplateBg] = useState<string>(DEFAULT_TEMPLATES[0].generateBg());
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [uploadedTemplate, setUploadedTemplate] = useState<string | null>(null);

  // Toolbox State
  const [newTextContent, setNewTextContent] = useState('');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  // Data Source & Participants State
  const [dataSource, setDataSource] = useState<'sample' | 'excel' | 'attended'>('sample');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
  const [eventName, setEventName] = useState('Event Certificates');
  const [fields, setFields] = useState<string[]>([]); // TASK 2: Auto-extracted fields
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(null); // TASK 5: Template image object

  // Generation Modal State
  const [showModal, setShowModal] = useState(false);
  const [generateMode, setGenerateMode] = useState<'separate' | 'combined'>('separate');
  const [generateFormat, setGenerateFormat] = useState<'png' | 'jpg' | 'pdf'>('png');
  const [isGenerating, setIsGenerating] = useState(false);

  // ==========================================
  // TEMPLATE MANAGEMENT
  // ==========================================

  const switchTemplate = (template: CertificateTemplate) => {
    setSelectedTemplate(template);
    setTemplateBg(template.generateBg());
    setUploadedTemplate(null);
  };

  const handleUploadTemplate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TASK 5: Create Image object for proper rendering
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.src = url;
    img.onload = () => {
      setTemplateImage(img);
      console.log('✅ Template image loaded:', { width: img.width, height: img.height });
    };
    img.onerror = () => {
      console.error('❌ Failed to load template image');
    };

    // Also load as data URL for backup
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setUploadedTemplate(src);
      setTemplateBg(src);
    };
    reader.readAsDataURL(file);
  }, []);

  // ==========================================
  // TEXT ELEMENT MANAGEMENT
  // ==========================================

  // ==========================================
  // TEXT ELEMENT MANAGEMENT (OPTIMIZED)
  // ==========================================

  const addTextElement = useCallback(() => {
    if (!newTextContent.trim()) return;

    const newText: TextElement = {
      id: `text-${Date.now()}`,
      text: newTextContent,
      x: 100 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      fontSize,
      fontFamily,
      color: textColor,
      bold: isBold,
      italic: isItalic,
    };

    setElements((prev) => [...prev, { type: 'text', id: newText.id, data: newText }]);
    setSelectedElement(newText.id);
    setNewTextContent('');
  }, [newTextContent, fontSize, fontFamily, textColor, isBold, isItalic]);

  const updateTextElement = useCallback(
    (id: string, updates: Partial<TextElement>) => {
      setElements((prev) =>
        prev.map((el) =>
          el.id === id && el.type === 'text'
            ? { ...el, data: { ...el.data as TextElement, ...updates } }
            : el
        )
      );
    },
    []
  );

  const updateSelectedElementStyle = useCallback(
    (updates: Partial<TextElement>) => {
      if (!selectedElement) return;
      updateTextElement(selectedElement, updates);
    },
    [selectedElement, updateTextElement]
  );

  // ==========================================
  // TASK 1 & 2 — FIELD CLICK HANDLER (NEW SEPARATE ELEMENTS ONLY)
  // ==========================================

  const handleFieldClick = useCallback(
    (field: string) => {
      const placeholder = `<${field}>`;

      // TASK 1: ALWAYS create a NEW independent text element
      // TASK 2: NO append logic - each field is separate
      const newText: TextElement = {
        id: `text-${Date.now()}`,
        text: placeholder,
        x: 250 + Math.random() * 100, // Avoid overlap with random offset
        y: 200 + Math.random() * 50,
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#000000',
        bold: false,
        italic: false,
      };

      setElements((prev) => [...prev, { type: 'text', id: newText.id, data: newText }]);
      setSelectedElement(newText.id);
      console.log(`✅ Created independent text element: <${field}>`);
    },
    []
  );

  // ==========================================
  // TASK 4 — POSITION UPDATE FUNCTION
  // ==========================================

  const updateElementPosition = useCallback(
    (id: string, x: number, y: number) => {
      setElements((prev) =>
        prev.map((el) =>
          el.id === id && el.type === 'text'
            ? { ...el, data: { ...el.data as TextElement, x, y } }
            : el
        )
      );
    },
    []
  );

  // ==========================================
  // IMAGE ELEMENT MANAGEMENT (OPTIMIZED)
  // ==========================================

  const addImageElement = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const newImage: ImageElement = {
          id: `image-${Date.now()}`,
          src,
          x: 100,
          y: 400,
          width: 200,
          height: 150,
        };
        setElements((prev) => [...prev, { type: 'image', id: newImage.id, data: newImage }]);
        setSelectedElement(newImage.id);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  const updateImageElement = useCallback(
    (id: string, updates: Partial<ImageElement>) => {
      setElements((prev) =>
        prev.map((el) =>
          el.id === id && el.type === 'image'
            ? { ...el, data: { ...el.data as ImageElement, ...updates } }
            : el
        )
      );
    },
    []
  );

  // ==========================================
  // ELEMENT DELETION (OPTIMIZED)
  // ==========================================

  const deleteElement = useCallback(
    (id: string) => {
      setElements((prev) => prev.filter((el) => el.id !== id));
      if (selectedElement === id) setSelectedElement(null);
    },
    [selectedElement]
  );

  // ==========================================
  // CANVAS RENDERING (OPTIMIZED & FIXED)
  // ==========================================

  // Get current participant for data binding
  const currentParticipant: Participant = participants[currentParticipantIndex] || {
    name: '',
    branch: '',
    college: '',
    email: '',
    event: '',
  };

  const renderCanvas = useCallback(() => {
    return (
      <div
        ref={canvasRef}
        style={{
          backgroundImage: `url(${templateBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          border: '2px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={() => setSelectedElement(null)}
      >
        {/* Text Elements - WITH DATA BINDING */}
        {elements.map((el) =>
          el.type === 'text' ? (
            <TextElementRenderer
              key={el.id}
              element={el.data as TextElement}
              isSelected={selectedElement === el.id}
              // TASK 3: Allow text element selection
              onSelect={() => {
                setSelectedElement(el.id);
                console.log(`📍 Selected text element: ${el.id}`);
              }}
              // TASK 4: Use position update function for dragging
              onUpdatePosition={(x, y) => updateElementPosition(el.id, x, y)}
              onDoubleClick={() => setSelectedElement(el.id)}
              // TASK 5: PREVIEW REPLACEMENT - Replace placeholders with participant data
              displayText={replaceFieldPlaceholders((el.data as TextElement).text, currentParticipant)}
            />
          ) : null
        )}

        {/* Image Elements */}
        {elements.map((el) =>
          el.type === 'image' ? (
            <ImageElementRenderer
              key={el.id}
              element={el.data as ImageElement}
              isSelected={selectedElement === el.id}
              onSelect={() => setSelectedElement(el.id)}
              onUpdatePosition={(x, y) => updateImageElement(el.id, { x, y })}
              onResize={(width, height) => updateImageElement(el.id, { width, height })}
            />
          ) : null
        )}
      </div>
    );
  }, [templateBg, elements, selectedElement, currentParticipant, updateElementPosition]);

  // ==========================================
  // DOWNLOAD CERTIFICATE
  // ==========================================

  const downloadCertificate = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        backgroundColor: null,
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `certificate-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // ==========================================
  // DATA SOURCE MANAGEMENT (OPTIMIZED)
  // ==========================================

  const loadSampleParticipants = useCallback(() => {
    const samples: Participant[] = [
      { name: 'John Smith', branch: 'Computer Science', college: 'Tech University', email: 'john@example.com', event: 'Annual Conference 2024' },
      { name: 'Sarah Johnson', branch: 'Business', college: 'Tech University', email: 'sarah@example.com', event: 'Annual Conference 2024' },
      { name: 'Michael Brown', branch: 'Engineering', college: 'Tech University', email: 'michael@example.com', event: 'Annual Conference 2024' },
      { name: 'Emily Davis', branch: 'Design', college: 'Tech University', email: 'emily@example.com', event: 'Annual Conference 2024' },
      { name: 'Robert Wilson', branch: 'Marketing', college: 'Tech University', email: 'robert@example.com', event: 'Annual Conference 2024' },
    ];
    setParticipants(samples);
    setCurrentParticipantIndex(0);
    
    // TASK 2: Extract and set available fields
    const availableFields = Object.keys(samples[0] || {});
    setFields(availableFields);
    console.log('📋 Sample fields available:', availableFields);
  }, []);

  /**
   * Load attended users from API for a specific program
   * Fetches data from /api/attendance/:programId
   */
  const loadAttendedUsersFromAPI = useCallback(async (programId: string) => {
    try {
      console.log('📥 Loading attended users for program:', programId);
      
      const response = await attendanceApi.getAttendedUsers(programId);
      
      if (response.success && response.data?.attendees) {
        const attendees = response.data.attendees.map((attendee: any) => ({
          name: attendee.name || 'N/A',
          branch: attendee.branch || 'N/A',
          college: attendee.college || 'N/A',
          email: attendee.email || '',
          event: eventName || 'Event',
          attendedAt: attendee.attendedAt,
        }));
        
        setParticipants(attendees);
        setCurrentParticipantIndex(0);
        
        // Extract available fields from first attendee
        const availableFields = Object.keys(attendees[0] || {});
        setFields(availableFields);
        
        console.log(`✅ Loaded ${attendees.length} attended users`, {
          fields: availableFields,
          sample: attendees[0],
        });
      } else {
        console.error('❌ Failed to load attended users:', response.message);
        alert('No attended users found for this program');
      }
    } catch (error: any) {
      console.error('❌ Error loading attended users:', error);
      alert(`Failed to load attended users: ${error.message}`);
    }
  }, [eventName]);

  const handleExcelUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];
        
        if (jsonData.length === 0) {
          alert('Excel file is empty');
          return;
        }

        // TASK 1: Extract headers automatically
        const extractedHeaders = Object.keys(jsonData[0] || {});
        setFields(extractedHeaders);
        console.log('📋 Extracted fields from Excel:', extractedHeaders);

        // Keep data as-is without normalization (preserve all fields)
        const participants = jsonData.map((row) => ({
          ...row,
          name: row.name || row.Name || row.NAME || '',
          branch: row.branch || row.Branch || row.BRANCH || '',
          college: row.college || row.College || row.COLLEGE || '',
          email: row.email || row.Email || row.EMAIL || '',
          event: row.event || row.Event || row.EVENT || '',
        } as Participant));

        setParticipants(participants);
        setCurrentParticipantIndex(0);
        setDataSource('excel');
        
        console.log('✅ Excel uploaded:', { rowCount: participants.length, fields: extractedHeaders });
        console.log('📊 First participant:', participants[0]);
      } catch (err) {
        console.error('❌ Failed to parse Excel:', err);
        alert('Failed to parse Excel file');
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  // ==========================================
  // CERTIFICATE GENERATION
  // ==========================================

  const generateCertificateImage = async (
    participantIndex: number,
    participant: Participant
  ): Promise<Blob | null> => {
    if (!canvasRef.current) return null;

    try {
      // Temporarily update participant index for rendering
      setCurrentParticipantIndex(participantIndex);
      
      // Wait for React to re-render with the new participant data
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, `image/${generateFormat}`);
      });
    } catch (error) {
      console.error('Failed to generate certificate:', error);
      return null;
    }
  };

  const downloadSeparateFiles = async () => {
    if (participants.length === 0) {
      alert('No participants loaded');
      return;
    }

    setIsGenerating(true);
    try {
      const zip = new JSZip();

      for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        const fileName = `${eventName}_${participant.name}`;

        if (generateFormat === 'pdf') {
          // Generate PDF for each participant
          const blob = await generateCertificateImage(i, participant);
          if (blob) {
            const imgUrl = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
              const pdf = new jsPDF('l', 'mm', 'a4');
              const width = pdf.internal.pageSize.getWidth();
              const height = pdf.internal.pageSize.getHeight();
              pdf.addImage(imgUrl, 'PNG', 0, 0, width, height);
              zip.file(`${fileName}.pdf`, pdf.output('blob'));
            };
            img.src = imgUrl;
          }
        } else {
          // PNG or JPG
          const blob = await generateCertificateImage(i, participant);
          if (blob) {
            zip.file(`${fileName}.${generateFormat}`, blob);
          }
        }

        // Small delay to ensure rendering
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${eventName}_Certificates.zip`);

      alert(`✅ Generated ${participants.length} certificates!`);
      setShowModal(false);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate certificates');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCombinedPDF = async () => {
    if (participants.length === 0) {
      alert('No participants loaded');
      return;
    }

    setIsGenerating(true);
    try {
      const pdf = new jsPDF('l', 'mm', 'a4');
      let isFirstPage = true;

      for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];

        const blob = await generateCertificateImage(i, participant);
        if (blob) {
          const imgUrl = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            if (!isFirstPage) {
              pdf.addPage();
            }
            const width = pdf.internal.pageSize.getWidth();
            const height = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgUrl, 'PNG', 0, 0, width, height);
            isFirstPage = false;
          };
          img.src = imgUrl;
        }

        // Small delay to ensure rendering
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      pdf.save(`${eventName}_Certificates.pdf`);
      alert(`✅ Generated combined PDF with ${participants.length} certificates!`);
      setShowModal(false);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    if (generateMode === 'separate') {
      downloadSeparateFiles();
    } else {
      downloadCombinedPDF();
    }
  };

  // ==========================================
  // TASK 4 & 6: CANVAS UPDATE EFFECT & DEBUG LOGGING
  // ==========================================

  useEffect(() => {
    // Load program data if programId is provided
    if (programId) {
      const loadProgramData = async () => {
        try {
          const response = await programApi.getPublicProgramById(programId);
          if (response.success && response.data) {
            setEventName(response.data.eventName || 'Event Certificates');
            console.log('✅ Program loaded:', response.data.eventName);
          }
        } catch (error) {
          console.error('❌ Failed to load program:', error);
        }
      };
      loadProgramData();
    }
  }, [programId]);

  // Load attended users when programId is available
  useEffect(() => {
    if (programId && dataSource === 'attended') {
      loadAttendedUsersFromAPI(programId);
    }
  }, [programId, dataSource]);

  useEffect(() => {
    // TASK 4: Force canvas real-time update
    // (HTML canvas updates automatically, but explicit update for safety)
    if (canvasRef.current) {
      // Trigger any pending renders
      canvasRef.current.style.opacity = canvasRef.current.style.opacity || '1';
    }

    // TASK 8: Debug logging
    console.log('📊 Certificate Editor State:', {
      participants: participants.length,
      fields,
      currentIndex: currentParticipantIndex,
      currentParticipant: participants[currentParticipantIndex],
      templateImage: templateImage ? { width: templateImage.width, height: templateImage.height } : null,
      elements: elements.length,
      selectedElement,
    });
  }, [participants, fields, currentParticipantIndex, templateImage, elements, selectedElement]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">🎓 Certificate Editor</h1>

        {/* ==========================================
            DATA SOURCE SECTION
            ========================================== */}
        <div className="mb-6 flex gap-4 items-end">
          <div className="flex-1 max-w-md">
            <Label className="font-semibold mb-2 block">Data Source</Label>
            <Select value={dataSource} onValueChange={(val) => setDataSource(val as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sample">Sample Data (5 participants)</SelectItem>
                <SelectItem value="excel">Upload Excel File</SelectItem>
                {programId && <SelectItem value="attended">Attended Users (from Program)</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {dataSource === 'sample' ? (
            <Button onClick={loadSampleParticipants} variant="outline" className="gap-2">
              <Download size={16} />
              Load Sample Data
            </Button>
          ) : dataSource === 'attended' ? (
            <Button onClick={() => programId && loadAttendedUsersFromAPI(programId)} variant="outline" className="gap-2">
              <Download size={16} />
              Load Attended Users
            </Button>
          ) : (
            <>
              <Button
                onClick={() => excelInputRef.current?.click()}
                variant="outline"
                className="gap-2"
              >
                <Upload size={16} />
                Upload Excel
              </Button>
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={handleExcelUpload}
              />
            </>
          )}

          {participants.length > 0 && (
            <div className="text-sm text-green-600 font-semibold">
              ✅ {participants.length} participants loaded
            </div>
          )}

          <Input
            placeholder="Event name..."
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {/* Main Layout: Templates | Toolbox | Canvas */}
        <div className="flex gap-6">
          {/* ==========================================
              LEFT: TEMPLATES PANEL
              ========================================== */}
          <Card className="p-6 w-48 max-h-[600px] overflow-y-auto space-y-4">
            <h3 className="font-bold text-lg">Templates</h3>

            {/* Default Templates */}
            <div className="space-y-2">
              {DEFAULT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => switchTemplate(template)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition ${
                    selectedTemplate.id === template.id && !uploadedTemplate
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div
                    className="w-full h-12 rounded mb-2 border"
                    style={{ backgroundColor: template.thumbnail }}
                  />
                  <p className="text-sm font-semibold">{template.name}</p>
                </button>
              ))}
            </div>

            {/* Upload Template */}
            <div className="pt-4 border-t">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full gap-2"
              >
                <Upload size={16} />
                Upload Template
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleUploadTemplate}
              />
            </div>

            {uploadedTemplate && (
              <p className="text-xs text-green-600">✅ Custom template loaded</p>
            )}
          </Card>

          {/* ==========================================
              CENTER: TOOLBOX PANEL
              ========================================== */}
          <Card className="p-6 w-56 max-h-[600px] overflow-y-auto space-y-6">
            <h3 className="font-bold text-lg">Toolbox</h3>

            {/* TASK 2: Display Available Fields */}
            {fields.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <p className="text-xs font-semibold text-blue-900">📋 Available Fields:</p>
                <div className="flex flex-wrap gap-2">
                  {fields.map((field) => (
                    <button
                      key={field}
                      // TASK 2: Connect button click to field handler - adds to canvas directly
                      onClick={() => handleFieldClick(field)}
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer active:bg-blue-700 transition"
                      title={`Click to add <${field}> to canvas${selectedElement ? ' (append to selected)' : ' (create new)'}`}
                    >
                      &lt;{field}&gt;
                    </button>
                  ))}
                </div>
                <p className="text-xs text-blue-800">
                  💡 Click fields to add to canvas {selectedElement ? '(append to selected)' : '(creates new text)'}
                </p>
              </div>
            )}

            {/* Add Text Section */}
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Add Text</Label>
              <Input
                placeholder="Enter text... (use <Name>, <Branch>, etc.)"
                value={newTextContent}
                onChange={(e) => setNewTextContent(e.target.value)}
                className="text-sm"
              />
              <Button
                onClick={addTextElement}
                className="w-full gap-2"
                size="sm"
              >
                <Plus size={16} />
                Add Text
              </Button>
            </div>

            {/* Text Styling - Only show if text selected */}
            {selectedElement && elements.find((el) => el.id === selectedElement && el.type === 'text') && (
              <>
                {/* Font Family */}
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">Font</Label>
                  <Select
                    value={fontFamily}
                    onValueChange={(val) => {
                      setFontFamily(val);
                      updateSelectedElementStyle({ fontFamily: val });
                    }}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                      <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">Size: {fontSize}px</Label>
                  <Slider
                    value={[fontSize]}
                    onValueChange={(val) => {
                      setFontSize(val[0]);
                      updateSelectedElementStyle({ fontSize: val[0] });
                    }}
                    min={12}
                    max={120}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">Color</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => {
                        setTextColor(e.target.value);
                        updateSelectedElementStyle({ color: e.target.value });
                      }}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{textColor}</span>
                  </div>
                </div>

                {/* Bold / Italic */}
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">Style</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setIsBold(!isBold);
                        updateSelectedElementStyle({ bold: !isBold });
                      }}
                      variant={isBold ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 gap-2"
                    >
                      <Bold size={16} />
                      Bold
                    </Button>
                    <Button
                      onClick={() => {
                        setIsItalic(!isItalic);
                        updateSelectedElementStyle({ italic: !isItalic });
                      }}
                      variant={isItalic ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 gap-2"
                    >
                      <Italic size={16} />
                      Italic
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Logo/Image Upload */}
            <div className="space-y-2 border-t pt-4">
              <Label className="font-semibold text-sm">Upload Logo</Label>
              <Button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) addImageElement(file);
                  };
                  input.click();
                }}
                variant="outline"
                className="w-full gap-2"
                size="sm"
              >
                <Upload size={16} />
                Upload Image
              </Button>
            </div>

            {/* Delete Element */}
            {selectedElement && (
              <Button
                onClick={() => deleteElement(selectedElement)}
                variant="destructive"
                className="w-full gap-2"
                size="sm"
              >
                <Trash2 size={16} />
                Delete Selected
              </Button>
            )}

            {/* Download */}
            <div className="border-t pt-4">
              <Button
                onClick={downloadCertificate}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download size={16} />
                Download PNG
              </Button>
            </div>
          </Card>

          {/* ==========================================
              RIGHT: CANVAS PREVIEW
              ========================================== */}
          <div className="flex-1 space-y-6">
            <Card className="p-8 flex flex-col items-center justify-center min-h-[600px]">
              {renderCanvas()}
            </Card>

            {/* Participant Navigation & Info */}
            {participants.length > 0 && (
              <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      Preview: {currentParticipant?.name || 'N/A'} (Participant {currentParticipantIndex + 1}/{participants.length})
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setCurrentParticipantIndex(Math.max(0, currentParticipantIndex - 1))}
                        disabled={currentParticipantIndex === 0}
                        variant="outline"
                        size="sm"
                      >
                        ← Prev
                      </Button>
                      <Button
                        onClick={() =>
                          setCurrentParticipantIndex(
                            Math.min(participants.length - 1, currentParticipantIndex + 1)
                          )
                        }
                        disabled={currentParticipantIndex === participants.length - 1}
                        variant="outline"
                        size="sm"
                      >
                        Next →
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>📧 {currentParticipant?.email}</p>
                    <p>🏢 {currentParticipant?.branch} | 🎓 {currentParticipant?.college}</p>
                    <p>🎯 Event: {currentParticipant?.event}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Element Count */}
            <div className="text-center text-sm text-gray-600">
              {elements.length} element{elements.length !== 1 ? 's' : ''} on canvas
            </div>
          </div>
        </div>

        {/* ==========================================
            GENERATE BUTTON (FIXED BOTTOM)
            ========================================== */}
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setShowModal(true)}
            disabled={participants.length === 0 || elements.length === 0}
            size="lg"
            className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
          >
            <Download size={20} />
            Generate Certificates ({participants.length})
          </Button>
        </div>

        {/* ==========================================
            GENERATION MODAL
            ========================================== */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-8 w-full max-w-2xl space-y-6 bg-white">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">📤 Certificate Export Options</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Mode Selection */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">📋 Export Mode</h3>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition"
                      style={{ borderColor: generateMode === 'separate' ? '#3b82f6' : '#e5e7eb' }}>
                      <input
                        type="radio"
                        name="mode"
                        checked={generateMode === 'separate'}
                        onChange={() => setGenerateMode('separate')}
                        className="w-4 h-4 mr-3"
                      />
                      <div>
                        <p className="font-semibold">📦 Separate Files</p>
                        <p className="text-sm text-gray-600">Each certificate as individual file, packaged in ZIP</p>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition"
                      style={{ borderColor: generateMode === 'combined' ? '#3b82f6' : '#e5e7eb' }}>
                      <input
                        type="radio"
                        name="mode"
                        checked={generateMode === 'combined'}
                        onChange={() => setGenerateMode('combined')}
                        className="w-4 h-4 mr-3"
                      />
                      <div>
                        <p className="font-semibold">📄 Combined PDF</p>
                        <p className="text-sm text-gray-600">All certificates merged into single PDF file</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Format Selection */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">🎨 File Format</h3>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition"
                      style={{ borderColor: generateFormat === 'png' ? '#16a34a' : '#e5e7eb' }}>
                      <input
                        type="radio"
                        name="format"
                        checked={generateFormat === 'png'}
                        onChange={() => setGenerateFormat('png')}
                        disabled={generateMode === 'combined'}
                        className="w-4 h-4 mr-3"
                      />
                      <div>
                        <p className="font-semibold">PNG</p>
                        <p className="text-sm text-gray-600">High quality, transparent background</p>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition"
                      style={{ borderColor: generateFormat === 'jpg' ? '#16a34a' : '#e5e7eb' }}>
                      <input
                        type="radio"
                        name="format"
                        checked={generateFormat === 'jpg'}
                        onChange={() => setGenerateFormat('jpg')}
                        disabled={generateMode === 'combined'}
                        className="w-4 h-4 mr-3"
                      />
                      <div>
                        <p className="font-semibold">JPG</p>
                        <p className="text-sm text-gray-600">Smaller file size, no transparency</p>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition"
                      style={{ borderColor: generateFormat === 'pdf' ? '#16a34a' : '#e5e7eb' }}>
                      <input
                        type="radio"
                        name="format"
                        checked={generateFormat === 'pdf'}
                        onChange={() => setGenerateFormat('pdf')}
                        className="w-4 h-4 mr-3"
                      />
                      <div>
                        <p className="font-semibold">PDF</p>
                        <p className="text-sm text-gray-600">Professional, universal format</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900">
                  📊 Summary: Generate {participants.length} certificate{participants.length !== 1 ? 's' : ''} in {generateMode === 'separate' ? 'separate' : 'combined'} {generateMode === 'combined' || generateFormat === 'pdf' ? 'PDF' : generateFormat.toUpperCase()} format
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Generate & Download
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// TEXT ELEMENT RENDERER (OPTIMIZED)
// ==========================================

interface TextElementRendererProps {
  element: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdatePosition: (x: number, y: number) => void;
  onDoubleClick: () => void;
  displayText?: string; // Data-bound display text
}

const TextElementRendererComponent: React.FC<TextElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdatePosition,
  onDoubleClick,
  displayText,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - element.x,
        y: e.clientY - element.y,
      });
      onSelect();
    },
    [element.x, element.y, onSelect]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      onUpdatePosition(newX, newY);
    },
    [isDragging, dragOffset, onUpdatePosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        fontSize: `${element.fontSize}px`,
        fontFamily: element.fontFamily,
        color: element.color,
        fontWeight: element.bold ? 'bold' : 'normal',
        fontStyle: element.italic ? 'italic' : 'normal',
        cursor: 'move',
        border: isSelected ? '2px solid blue' : 'none',
        padding: '4px',
        backgroundColor: isSelected ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
        borderRadius: '4px',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        transition: isSelected ? 'none' : 'border 0.1s',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Show data-bound text if available, otherwise show template */}
      {displayText !== undefined ? displayText : element.text}
    </div>
  );
};

// Memoized version for performance
const TextElementRenderer = React.memo(TextElementRendererComponent, (prev, next) => {
  return (
    prev.element.x === next.element.x &&
    prev.element.y === next.element.y &&
    prev.element.fontSize === next.element.fontSize &&
    prev.element.color === next.element.color &&
    prev.element.bold === next.element.bold &&
    prev.element.italic === next.element.italic &&
    prev.isSelected === next.isSelected &&
    prev.displayText === next.displayText
  );
});

// ==========================================
// IMAGE ELEMENT RENDERER (OPTIMIZED)
// ==========================================

interface ImageElementRendererProps {
  element: ImageElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdatePosition: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
}

const ImageElementRendererComponent: React.FC<ImageElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdatePosition,
  onResize,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - element.x,
        y: e.clientY - element.y,
      });
      onSelect();
    },
    [element.x, element.y, onSelect]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsResizing(true);
      setDragOffset({
        x: e.clientX - (element.x + element.width),
        y: e.clientY - (element.y + element.height),
      });
    },
    [element.x, element.y, element.width, element.height]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        onUpdatePosition(newX, newY);
      } else if (isResizing) {
        const newWidth = e.clientX - element.x - dragOffset.x;
        const newHeight = e.clientY - element.y - dragOffset.y;
        if (newWidth > 30) onResize(newWidth, newHeight);
      }
    },
    [isDragging, isResizing, dragOffset, element.x, element.y, onUpdatePosition, onResize]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        border: isSelected ? '2px solid blue' : 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        backgroundColor: isSelected ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
        borderRadius: '4px',
        overflow: 'hidden',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <img
        src={element.src}
        alt="certificate-element"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none',
        }}
      />

      {/* Resize Handle */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '20px',
            height: '20px',
            backgroundColor: 'blue',
            cursor: 'se-resize',
          }}
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
};

// Memoized version for performance
const ImageElementRenderer = React.memo(ImageElementRendererComponent, (prev, next) => {
  return (
    prev.element.x === next.element.x &&
    prev.element.y === next.element.y &&
    prev.element.width === next.element.width &&
    prev.element.height === next.element.height &&
    prev.isSelected === next.isSelected
  );
});

export default CertificateEditor;
