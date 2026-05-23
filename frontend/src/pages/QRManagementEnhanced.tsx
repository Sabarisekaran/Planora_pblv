import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Settings,
  Upload,
  X,
  Loader,
} from 'lucide-react';
import { usePrograms } from '@/contexts/ProgramContext';
import { getQRURL } from '@/utils/baseUrl';

type Mode = 'generate' | 'custom';
type QRTab = 'coordinators' | 'poster' | 'participants';

interface CoordinatorData {
  name: string;
  event: string;
  branch: string;
  verificationId?: string | number;
}

interface ParticipantData {
  name: string;
  uniqueId: string;
  email?: string;
  phone?: string;
}

interface PosterQRData {
  image: string;
  qrUrl: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

/**
 * ENHANCED QR CODE MANAGEMENT SYSTEM
 * Features:
 * - Generate mode (default QR generation)
 * - Custom mode (custom URLs)
 * - Bulk QR generation (CSV/Excel)
 * - ID card style QR cards
 * - Poster QR placement
 * - Download all formats
 */
const QRManagementEnhanced = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { programs } = usePrograms();

  // Main state
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [mode, setMode] = useState<Mode>('generate');
  const [showTabs, setShowTabs] = useState(false);
  const [activeTab, setActiveTab] = useState<QRTab>('coordinators');

  // Custom mode state
  const [customRegistrationUrl, setCustomRegistrationUrl] = useState('');
  const [customAttendanceUrl, setCustomAttendanceUrl] = useState('');

  // Coordinators tab state
  const [coordinatorFile, setCoordinatorFile] = useState<File | null>(null);
  const [coordinatorData, setCoordinatorData] = useState<CoordinatorData[]>([]);
  const [cardColor, setCardColor] = useState('#3b82f6');
  const [textTemplate, setTextTemplate] = useState('name');
  const [verificationFrom, setVerificationFrom] = useState('1000');
  const [verificationTo, setVerificationTo] = useState('1100');
  const [generatedCoordinatorQRs, setGeneratedCoordinatorQRs] = useState<any[]>([]);

  // Poster tab state
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState('');
  const [posterPreview, setPosterPreview] = useState('');
  const [qrOnPoster, setQROnPoster] = useState<PosterQRData | null>(null);
  const [posterQRSize, setPosterQRSize] = useState(150);
  const [posterQRPosition, setPosterQRPosition] = useState({ x: 50, y: 50 });

  // Participants tab state
  const [participantFile, setParticipantFile] = useState<File | null>(null);
  const [participantData, setParticipantData] = useState<ParticipantData[]>([]);
  const [generatedParticipantQRs, setGeneratedParticipantQRs] = useState<any[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Get program on mount
  useEffect(() => {
    if (programId) {
      const program = programs.find(p => p.id === programId);
      setSelectedProgram(program);
    } else if (programs.length > 0) {
      setSelectedProgram(programs[0]);
    }
  }, [programId, programs]);

  // ==========================================
  // FILE PARSING FUNCTIONS
  // ==========================================

  const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;

          if (file.name.endsWith('.csv')) {
            Papa.parse(content, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                resolve(results.data);
              },
              error: (err) => reject(err),
            });
          } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData);
          } else {
            reject(new Error('Unsupported file format. Use CSV or Excel.'));
          }
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('Error reading file'));

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  // ==========================================
  // COORDINATORS TAB HANDLERS
  // ==========================================

  const handleCoordinatorFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError('');
      setCoordinatorFile(file);

      const data = await parseFile(file);
      setCoordinatorData(data);
      console.log('✅ Coordinator data parsed:', data);
    } catch (err: any) {
      setError(`Error parsing file: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateCoordinatorQRs = () => {
    if (coordinatorData.length === 0) {
      setError('Please upload coordinator data first');
      return;
    }

    try {
      setLoading(true);
      const verStart = parseInt(verificationFrom);
      const verEnd = parseInt(verificationTo);
      const qrCount = coordinatorData.length;
      const step = Math.floor((verEnd - verStart) / qrCount);

      const qrCards = coordinatorData.map((coord, idx) => {
        const verificationId = verStart + idx * step;
        const qrData = `${coord.name}-${coord.event}-${verificationId}`;

        return {
          id: `coord-${idx}`,
          ...coord,
          verificationId,
          qrData,
          qrContent: qrData,
        };
      });

      setGeneratedCoordinatorQRs(qrCards);
      console.log('✅ Generated coordinator QRs:', qrCards);
    } catch (err: any) {
      setError(`Error generating QRs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // POSTER TAB HANDLERS
  // ==========================================

  const handlePosterImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setPosterPreview(imageData);
      setPosterFile(file);
    };
    reader.readAsDataURL(file);
  };

  const generatePosterQR = () => {
    if (!posterUrl) {
      setError('Please enter a URL for the QR code');
      return;
    }

    setQROnPoster({
      image: posterPreview,
      qrUrl: posterUrl,
      position: posterQRPosition,
      size: { width: posterQRSize, height: posterQRSize },
    });
  };

  const handlePosterQRDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!qrOnPoster) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setQROnPoster({
      ...qrOnPoster,
      position: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
    });
  };

  // ==========================================
  // PARTICIPANTS TAB HANDLERS
  // ==========================================

  const handleParticipantFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError('');
      setParticipantFile(file);

      const data = await parseFile(file);
      setParticipantData(data);
      console.log('✅ Participant data parsed:', data);
    } catch (err: any) {
      setError(`Error parsing file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateParticipantQRs = () => {
    if (participantData.length === 0) {
      setError('Please upload participant data first');
      return;
    }

    try {
      setLoading(true);
      const qrCards = participantData.map((participant, idx) => {
        const qrData = `${participant.name}-${participant.uniqueId}`;

        return {
          id: `part-${idx}`,
          ...participant,
          qrData,
          qrContent: qrData,
        };
      });

      setGeneratedParticipantQRs(qrCards);
      console.log('✅ Generated participant QRs:', qrCards);
    } catch (err: any) {
      setError(`Error generating QRs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DOWNLOAD HANDLERS
  // ==========================================

  const downloadAsZip = async (qrCards: any[], filename: string) => {
    try {
      // For now, create a simple HTML file with all QRs
      // In production, use a library like jszip
      const html = generateHTMLReport(qrCards);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.html`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download QRs');
    }
  };

  const generateHTMLReport = (qrCards: any[]): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Codes Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .card { 
            display: inline-block; 
            border: 1px solid #ccc; 
            padding: 20px; 
            margin: 10px; 
            text-align: center;
            page-break-inside: avoid;
          }
          .card h3 { margin-top: 10px; }
          canvas { border: 1px solid #ddd; }
          @media print { .card { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        <h1>QR Codes Report</h1>
        <div id="qr-container"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
        <script>
          const qrCards = ${JSON.stringify(qrCards)};
          const container = document.getElementById('qr-container');
          
          qrCards.forEach(card => {
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = '<h3>' + (card.name || card.uniqueId) + '</h3>';
            
            const qrDiv = document.createElement('div');
            qrDiv.id = 'qr-' + card.id;
            div.appendChild(qrDiv);
            
            container.appendChild(div);
            
            new QRCode(qrDiv, {
              text: card.qrContent,
              width: 200,
              height: 200,
            });
          });
        </script>
      </body>
      </html>
    `;
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ==========================================
  // RENDER FUNCTIONS
  // ==========================================

  const renderGenerateMode = () => {
    const registrationUrl = getQRURL(`/register/${selectedProgram?.id}`);
    const attendanceUrl = getQRURL(`/attendance/${selectedProgram?.id}`);

    return (
      <div className="space-y-6">
        {/* Registration QR */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">📋 Registration QR</h3>
          <p className="text-sm text-gray-600 mb-4">{registrationUrl}</p>
          <div className="flex justify-center mb-4 p-4 bg-gray-50 rounded-lg">
            <QRCode value={registrationUrl} size={256} level="H" />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleCopyToClipboard(registrationUrl, 'reg-url')}
              className="flex-1"
            >
              {copiedId === 'reg-url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy URL
            </Button>
            <Button className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </Card>

        {/* Attendance QR */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">✅ Attendance QR</h3>
          <p className="text-sm text-gray-600 mb-4">{attendanceUrl}</p>
          <div className="flex justify-center mb-4 p-4 bg-gray-50 rounded-lg">
            <QRCode value={attendanceUrl} size={256} level="H" />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleCopyToClipboard(attendanceUrl, 'att-url')}
              className="flex-1"
            >
              {copiedId === 'att-url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy URL
            </Button>
            <Button className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  const renderCustomMode = () => {
    return (
      <div className="space-y-6">
        {/* Custom Registration QR */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">📋 Custom Registration QR</h3>
          <div className="space-y-3 mb-4">
            <Label>Paste Registration URL</Label>
            <Input
              value={customRegistrationUrl}
              onChange={(e) => setCustomRegistrationUrl(e.target.value)}
              placeholder="https://example.com/register"
            />
          </div>
          {customRegistrationUrl && (
            <>
              <div className="flex justify-center mb-4 p-4 bg-gray-50 rounded-lg">
                <QRCode value={customRegistrationUrl} size={256} level="H" />
              </div>
              <Button onClick={() => handleCopyToClipboard(customRegistrationUrl, 'custom-reg')}>
                {copiedId === 'custom-reg' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy URL
              </Button>
            </>
          )}
        </Card>

        {/* Custom Attendance QR */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">✅ Custom Attendance QR</h3>
          <div className="space-y-3 mb-4">
            <Label>Paste Attendance URL</Label>
            <Input
              value={customAttendanceUrl}
              onChange={(e) => setCustomAttendanceUrl(e.target.value)}
              placeholder="https://example.com/attendance"
            />
          </div>
          {customAttendanceUrl && (
            <>
              <div className="flex justify-center mb-4 p-4 bg-gray-50 rounded-lg">
                <QRCode value={customAttendanceUrl} size={256} level="H" />
              </div>
              <Button onClick={() => handleCopyToClipboard(customAttendanceUrl, 'custom-att')}>
                {copiedId === 'custom-att' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copy URL
              </Button>
            </>
          )}
        </Card>
      </div>
    );
  };

  const renderCoordinatorsTab = () => {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">👥 Coordinators QR Cards</h3>

          {/* File Upload */}
          <div className="space-y-3 mb-6">
            <Label>Upload CSV/Excel with coordinator data</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleCoordinatorFileUpload}
                className="hidden"
                id="coordinator-file"
              />
              <label htmlFor="coordinator-file" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">CSV or Excel (Name, Event, Branch)</p>
              </label>
            </div>
            {coordinatorFile && <p className="text-sm text-green-600">✅ {coordinatorFile.name}</p>}
          </div>

          {coordinatorData.length > 0 && (
            <>
              {/* Customization Options */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label>Card Color</Label>
                  <input
                    type="color"
                    value={cardColor}
                    onChange={(e) => setCardColor(e.target.value)}
                    className="w-full h-10 rounded"
                  />
                </div>

                <div>
                  <Label>Text Template</Label>
                  <Select value={textTemplate} onValueChange={setTextTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name Only</SelectItem>
                      <SelectItem value="full">Full Details</SelectItem>
                      <SelectItem value="event">Event & Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Verification From</Label>
                  <Input
                    type="number"
                    value={verificationFrom}
                    onChange={(e) => setVerificationFrom(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Verification To</Label>
                  <Input
                    type="number"
                    value={verificationTo}
                    onChange={(e) => setVerificationTo(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={generateCoordinatorQRs}
                className="w-full mb-6"
                disabled={loading}
              >
                {loading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <QrCode className="w-4 h-4 mr-2" />}
                Generate QR Cards ({coordinatorData.length})
              </Button>
            </>
          )}

          {/* Generated QR Cards */}
          {generatedCoordinatorQRs.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {generatedCoordinatorQRs.map((card) => (
                  <div key={card.id} className="p-4 rounded-lg border-2" style={{ borderColor: cardColor, backgroundColor: `${cardColor}10` }}>
                    <h4 className="font-semibold text-center mb-2">{card.name}</h4>
                    {(textTemplate === 'full' || textTemplate === 'event') && (
                      <p className="text-sm text-gray-600 text-center mb-2">{card.event} • {card.branch}</p>
                    )}
                    <div className="flex justify-center mb-2">
                      <QRCode value={card.qrContent} size={150} level="H" />
                    </div>
                    <p className="text-xs text-center text-gray-500">ID: {card.verificationId}</p>
                  </div>
                ))}
              </div>

              <Button onClick={() => downloadAsZip(generatedCoordinatorQRs, 'coordinators-qr')} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download All Coordinators QR
              </Button>
            </>
          )}
        </Card>
      </div>
    );
  };

  const renderPosterTab = () => {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">🖼️ Poster QR Placement</h3>

          {/* Image Upload */}
          <div className="space-y-3 mb-6">
            <Label>Upload Poster Image</Label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePosterImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white"
            />
          </div>

          {/* URL Input */}
          <div className="space-y-3 mb-6">
            <Label>QR Code URL</Label>
            <Input
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          {/* QR Size Control */}
          <div className="space-y-3 mb-6">
            <Label>QR Code Size: {posterQRSize}px</Label>
            <input
              type="range"
              min="50"
              max="500"
              value={posterQRSize}
              onChange={(e) => setPosterQRSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <Button onClick={generatePosterQR} className="w-full mb-6" disabled={!posterPreview || !posterUrl}>
            <QrCode className="w-4 h-4 mr-2" />
            Generate Poster QR
          </Button>

          {/* Poster Preview */}
          {posterPreview && qrOnPoster && (
            <div
              className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50"
              style={{
                backgroundImage: `url(${posterPreview})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '400px',
              }}
              onClick={handlePosterQRDrag}
            >
              <div
                className="absolute cursor-move hover:opacity-80 transition"
                style={{
                  left: `${qrOnPoster.position?.x || 50}px`,
                  top: `${qrOnPoster.position?.y || 50}px`,
                  width: posterQRSize,
                  height: posterQRSize,
                  padding: '2px',
                  backgroundColor: 'white',
                }}
              >
                <QRCode value={qrOnPoster.qrUrl} size={posterQRSize - 4} level="H" />
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  };

  const renderParticipantsTab = () => {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">👤 Event Participants QR Cards</h3>

          {/* File Upload */}
          <div className="space-y-3 mb-6">
            <Label>Upload CSV/Excel with participant data</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleParticipantFileUpload}
                className="hidden"
                id="participant-file"
              />
              <label htmlFor="participant-file" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">CSV or Excel (Name, Unique ID)</p>
              </label>
            </div>
            {participantFile && <p className="text-sm text-green-600">✅ {participantFile.name}</p>}
          </div>

          {participantData.length > 0 && (
            <Button
              onClick={generateParticipantQRs}
              className="w-full mb-6"
              disabled={loading}
            >
              {loading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <QrCode className="w-4 h-4 mr-2" />}
              Generate QR Cards ({participantData.length})
            </Button>
          )}

          {/* Generated QR Cards */}
          {generatedParticipantQRs.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {generatedParticipantQRs.map((card) => (
                  <div key={card.id} className="p-4 rounded-lg border-2 border-blue-300 bg-blue-50">
                    <h4 className="font-semibold text-center mb-2">{card.name}</h4>
                    <p className="text-sm text-gray-600 text-center mb-2">ID: {card.uniqueId}</p>
                    <div className="flex justify-center mb-2">
                      <QRCode value={card.qrContent} size={150} level="H" />
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={() => downloadAsZip(generatedParticipantQRs, 'participants-qr')} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download All Participants QR
              </Button>
            </>
          )}
        </Card>
      </div>
    );
  };

  // ==========================================
  // MAIN RENDER
  // ==========================================

  if (!selectedProgram) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <p className="text-gray-600 font-medium">No program selected</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Enhanced QR Management</h1>
          <p className="text-gray-600">Program: <span className="font-semibold">{selectedProgram?.eventName}</span></p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 mb-6 border-red-200 bg-red-50">
            <p className="text-red-700 flex items-center">
              <X className="w-4 h-4 mr-2" />
              {error}
            </p>
          </Card>
        )}

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => setMode('generate')}
            variant={mode === 'generate' ? 'default' : 'outline'}
            className="flex-1 min-w-[120px]"
          >
            📊 Generate
          </Button>
          <Button
            onClick={() => setMode('custom')}
            variant={mode === 'custom' ? 'default' : 'outline'}
            className="flex-1 min-w-[120px]"
          >
            ✏️ Custom
          </Button>
          <Button
            onClick={() => setShowTabs(!showTabs)}
            variant={showTabs ? 'default' : 'outline'}
            className="flex-1 min-w-[120px]"
          >
            <Settings className="w-4 h-4 mr-2" />
            QR Tabs
          </Button>
        </div>

        {/* Content */}
        {!showTabs && mode === 'generate' && renderGenerateMode()}
        {!showTabs && mode === 'custom' && renderCustomMode()}

        {showTabs && (
          <div className="space-y-4">
            <div className="flex gap-2 mb-6 overflow-x-auto">
              <Button
                onClick={() => setActiveTab('coordinators')}
                variant={activeTab === 'coordinators' ? 'default' : 'outline'}
              >
                👥 Coordinators
              </Button>
              <Button
                onClick={() => setActiveTab('poster')}
                variant={activeTab === 'poster' ? 'default' : 'outline'}
              >
                🖼️ Poster
              </Button>
              <Button
                onClick={() => setActiveTab('participants')}
                variant={activeTab === 'participants' ? 'default' : 'outline'}
              >
                👤 Participants
              </Button>
            </div>

            {activeTab === 'coordinators' && renderCoordinatorsTab()}
            {activeTab === 'poster' && renderPosterTab()}
            {activeTab === 'participants' && renderParticipantsTab()}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRManagementEnhanced;
