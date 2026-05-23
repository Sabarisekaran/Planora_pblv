import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Download,
  Copy,
  Check,
  ArrowLeft,
  QrCode,
  FileDown,
  Share2,
  Loader,
  AlertCircle,
  Eye,
  Settings,
} from 'lucide-react';

/**
 * GENERATE QR PAGE
 * Creates and displays actual QR codes
 * Features:
 * - Generate QR from URL
 * - Download as PNG/SVG
 * - Copy QR code
 * - Share QR code
 * - Customize size & error correction
 */

const GenerateQRPage = () => {
  const { programId } = useParams();
  const navigate = useNavigate();

  // State Management
  const [qrUrl, setQrUrl] = useState('');
  const [qrType, setQrType] = useState<'registration' | 'attendance'>('registration');
  const [qrSize, setQrSize] = useState(300);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'H' | 'Q'>('M');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);

  // Generate QR Code using QR Server API (no library needed)
  const generateQR = () => {
    if (!qrUrl.trim()) {
      alert('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      // Using QR Server API for free QR generation
      const encodedUrl = encodeURIComponent(qrUrl);
      const qrServerUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodedUrl}&ecc=${errorCorrection}`;
      
      setQrImage(qrServerUrl);
    } catch (error) {
      alert('Error generating QR code');
    } finally {
      setLoading(false);
    }
  };

  // Handle download
  const handleDownload = async (format: 'png' | 'svg') => {
    if (!qrImage) return;

    try {
      const link = document.createElement('a');
      link.href = qrImage;
      link.download = `qr-${qrType}-${Date.now()}.${format === 'png' ? 'png' : 'svg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert('Error downloading QR code');
    }
  };

  // Handle copy URL
  const handleCopyURL = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle share
  const handleShare = async () => {
    if (!qrImage) return;

    try {
      const response = await fetch(qrImage);
      const blob = await response.blob();
      const file = new File([blob], `qr-${qrType}.png`, { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          title: `${qrType.charAt(0).toUpperCase() + qrType.slice(1)} QR Code`,
          text: `Scan this QR code for ${qrType}`,
          files: [file],
        });
      } else {
        alert('Sharing not supported in this browser');
      }
    } catch (error) {
      alert('Error sharing QR code');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/qr-management')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Generate QR Code</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create custom QR codes for your events
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* QR Type Selection */}
          <Card className="p-6 border border-gray-200">
            <h3 className="font-semibold text-foreground mb-4">QR Type</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all" style={{borderColor: qrType === 'registration' ? '#3b82f6' : '#e5e7eb', backgroundColor: qrType === 'registration' ? '#eff6ff' : 'transparent'}}>
                <input
                  type="radio"
                  value="registration"
                  checked={qrType === 'registration'}
                  onChange={(e) => setQrType(e.target.value as 'registration')}
                  className="w-4 h-4"
                />
                <span className="font-medium text-foreground">Registration</span>
              </label>
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all" style={{borderColor: qrType === 'attendance' ? '#a855f7' : '#e5e7eb', backgroundColor: qrType === 'attendance' ? '#faf5ff' : 'transparent'}}>
                <input
                  type="radio"
                  value="attendance"
                  checked={qrType === 'attendance'}
                  onChange={(e) => setQrType(e.target.value as 'attendance')}
                  className="w-4 h-4"
                />
                <span className="font-medium text-foreground">Attendance</span>
              </label>
            </div>
          </Card>

          {/* URL Input */}
          <Card className="p-6 border border-gray-200">
            <h3 className="font-semibold text-foreground mb-4">QR Content</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  URL to encode
                </label>
                <Input
                  type="text"
                  placeholder="https://example.com/register"
                  value={qrUrl}
                  onChange={(e) => setQrUrl(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                💡 Tip: Use registration or attendance URLs from your event
              </p>
            </div>
          </Card>

          {/* Size Settings */}
          <Card className="p-6 border border-gray-200">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-3">
                  QR Size: {qrSize}px
                </label>
                <input
                  type="range"
                  min="100"
                  max="600"
                  step="50"
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Error Correction
                </label>
                <select
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as 'L' | 'M' | 'H' | 'Q')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="L">Low (L) - 7%</option>
                  <option value="M">Medium (M) - 15%</option>
                  <option value="Q">Quartile (Q) - 25%</option>
                  <option value="H">High (H) - 30%</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <Button
            onClick={generateQR}
            disabled={loading || !qrUrl.trim()}
            className="w-full gap-2 h-12 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                Generate QR Code
              </>
            )}
          </Button>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-2">
          <Card className="p-8 border border-gray-200 flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-br from-gray-50 to-gray-100">
            {!qrImage ? (
              <div className="text-center space-y-4">
                <div className="p-4 rounded-full bg-blue-100 w-fit mx-auto">
                  <QrCode className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-700">No QR Code Generated</h3>
                <p className="text-sm text-gray-500">
                  Enter a URL and click "Generate QR Code" to see the preview
                </p>
              </div>
            ) : (
              <div className="space-y-6 w-full">
                {/* QR Preview */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg border-2 border-gray-300">
                    <img
                      src={qrImage}
                      alt="Generated QR Code"
                      style={{ width: `${Math.min(qrSize, 400)}px`, height: `${Math.min(qrSize, 400)}px` }}
                      className="rounded"
                    />
                  </div>
                </div>

                {/* QR Details */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                  <p className="text-xs text-gray-600 font-mono break-all bg-gray-50 p-2 rounded">
                    {qrUrl}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      Type: {qrType}
                    </span>
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      Size: {qrSize}px
                    </span>
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded">
                      Error Correction: {errorCorrection}
                    </span>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleDownload('png')}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <FileDown className="w-4 h-4" />
                    Download PNG
                  </Button>
                  <Button
                    onClick={() => handleShare()}
                    variant="outline"
                    className="gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>

                {/* Copy URL Button */}
                <Button
                  onClick={handleCopyURL}
                  variant="outline"
                  className="w-full gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">URL Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy URL to Clipboard
                    </>
                  )}
                </Button>

                {/* View Details Button */}
                <Button
                  onClick={() => navigate(`/qr-details/${programId}`)}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View QR Details & Analytics
                </Button>
              </div>
            )}
          </Card>

          {/* Usage Tips */}
          <Card className="mt-6 p-6 bg-blue-50 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">📋 Tips for Best Results</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex gap-2">
                <span>✓</span>
                <span>Use error correction "H" for large prints (will be scanned from distance)</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Size 300-400px works well for most printing needs</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Test scan QR code before distributing to users</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Keep white space around QR code (at least 10% border)</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GenerateQRPage;
