import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getQRURL } from '@/utils/baseUrl';

interface QRGeneratorProps {
  formId: string;
  formTitle?: string;
}

const QRGenerator = ({ formId, formTitle }: QRGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const formUrl = getQRURL(`/custom-form/${formId}`);

  useEffect(() => {
    if (canvasRef.current && formId) {
      QRCode.toCanvas(canvasRef.current, formUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }).then(() => {
        const url = canvasRef.current?.toDataURL();
        if (url) setQrUrl(url);
      });
    }
  }, [formId, formUrl]);

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `form-qr-${formId}.png`;
    link.click();
  };

  const copyFormUrl = () => {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 bg-white border border-gray-200">
      <h3 className="text-lg font-semibold text-foreground mb-4">QR Code</h3>

      <div className="space-y-4">
        {/* QR Code Canvas */}
        <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
          <canvas ref={canvasRef} />
        </div>

        {/* Form URL */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Form URL:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={formUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={copyFormUrl}
              className="gap-1"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Download Button */}
        <Button onClick={downloadQR} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4" />
          Download QR Code
        </Button>

        {/* Instructions */}
        <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          <p className="font-semibold mb-2">How to use:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Share the QR code with users</li>
            <li>Users scan QR to fill the form</li>
            <li>Responses are automatically saved</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default QRGenerator;
