import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Certificate Generation Utilities
 * Handles canvas rendering, PDF creation, and file exports
 */

export interface CertificateData {
  participant: any;
  templateElement: HTMLElement;
  fileName: string;
}

/**
 * Convert HTML element to Canvas
 */
export const elementToCanvas = async (element: HTMLElement): Promise<HTMLCanvasElement> => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
      allowTaint: true,
    });
    return canvas;
  } catch (err) {
    throw new Error('Failed to render certificate to canvas');
  }
};

/**
 * Convert Canvas to Blob
 */
export const canvasToBlob = (
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpg' = 'png'
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const quality = format === 'jpg' ? 0.95 : undefined;

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error(`Failed to convert canvas to ${format}`));
      }
    }, mimeType, quality);
  });
};

/**
 * Create PDF from Canvas
 */
export const canvasToPDF = (canvas: HTMLCanvasElement): jsPDF => {
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  return pdf;
};

/**
 * Download single certificate
 */
export const downloadSingleCertificate = async (
  canvas: HTMLCanvasElement,
  fileName: string,
  format: 'png' | 'jpg' | 'pdf' = 'png'
): Promise<void> => {
  try {
    if (format === 'pdf') {
      const pdf = canvasToPDF(canvas);
      pdf.save(`${fileName}.pdf`);
    } else {
      const blob = await canvasToBlob(canvas, format);
      saveAs(blob, `${fileName}.${format}`);
    }
  } catch (err) {
    throw new Error(`Failed to download certificate as ${format}`);
  }
};

/**
 * Download multiple certificates as ZIP
 */
export const downloadCertificatesAsZip = async (
  certificates: Array<{ canvas: HTMLCanvasElement; fileName: string }>,
  format: 'png' | 'jpg' | 'pdf' = 'png',
  zipFileName: string = 'Certificates'
): Promise<void> => {
  try {
    const zip = new JSZip();

    for (const cert of certificates) {
      if (format === 'pdf') {
        const pdf = canvasToPDF(cert.canvas);
        zip.file(`${cert.fileName}.pdf`, pdf.output('blob'));
      } else {
        const blob = await canvasToBlob(cert.canvas, format);
        zip.file(`${cert.fileName}.${format}`, blob);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${zipFileName}.zip`);
  } catch (err) {
    throw new Error('Failed to create ZIP file');
  }
};

/**
 * Generate combined PDF from multiple certificates
 */
export const generateCombinedPDF = async (
  certificates: Array<{ canvas: HTMLCanvasElement; fileName: string }>,
  pdfFileName: string = 'Certificates'
): Promise<void> => {
  try {
    const pdf = new jsPDF();
    let isFirstPage = true;

    for (const cert of certificates) {
      if (!isFirstPage) {
        pdf.addPage();
      }

      const imgData = cert.canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      isFirstPage = false;
    }

    pdf.save(`${pdfFileName}.pdf`);
  } catch (err) {
    throw new Error('Failed to generate combined PDF');
  }
};

/**
 * Batch process certificates
 */
export const batchProcessCertificates = async (
  templateElement: HTMLElement,
  participants: any[],
  replacePlaceholders: (participant: any) => { [key: string]: string },
  options: {
    format: 'png' | 'jpg' | 'pdf';
    mode: 'separate' | 'combined';
    fileName: string;
  }
): Promise<void> => {
  try {
    const certificates: Array<{ canvas: HTMLCanvasElement; fileName: string }> = [];

    // Generate canvases for all participants
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      const data = replacePlaceholders(participant);

      // Update template with participant data
      const fields = templateElement.querySelectorAll('[data-placeholder]');
      fields.forEach((field) => {
        const placeholder = field.getAttribute('data-placeholder');
        if (placeholder && data[placeholder]) {
          field.textContent = data[placeholder];
        }
      });

      // Render to canvas
      const canvas = await elementToCanvas(templateElement);
      certificates.push({
        canvas,
        fileName: `${options.fileName}_${participant.name}`,
      });

      // Small delay to prevent UI blocking
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Download based on mode
    if (options.mode === 'combined') {
      if (options.format === 'pdf') {
        await generateCombinedPDF(certificates, options.fileName);
      } else {
        // For combined image mode, still use ZIP
        await downloadCertificatesAsZip(certificates, options.format, options.fileName);
      }
    } else {
      await downloadCertificatesAsZip(certificates, options.format, options.fileName);
    }
  } catch (err) {
    throw new Error('Batch certificate processing failed');
  }
};

/**
 * Generate certificate preview as Base64 (for display)
 */
export const generateCertificatePreview = async (
  element: HTMLElement
): Promise<string> => {
  try {
    const canvas = await elementToCanvas(element);
    return canvas.toDataURL('image/png');
  } catch (err) {
    throw new Error('Failed to generate preview');
  }
};

/**
 * Get certificate dimensions from template
 */
export const getCertificateDimensions = (templateElement: HTMLElement): {
  width: number;
  height: number;
} => {
  const style = window.getComputedStyle(templateElement);
  return {
    width: parseInt(style.width, 10),
    height: parseInt(style.height, 10),
  };
};
