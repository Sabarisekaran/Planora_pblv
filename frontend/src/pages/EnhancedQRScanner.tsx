import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Enhanced QR Scanner Component
 * Handles JSON parsing, validation, and navigation to QRView page
 * Supports both manual JSON input and camera scanning
 */
const EnhancedQRScanner: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [manualJSON, setManualJSON] = useState('');
  const [scanning, setScanning] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Parse and validate QR data
   */
  const parseQRData = (jsonString: string) => {
    try {
      setError('');
      setSuccess('');
      
      console.log('🔄 Raw QR text:', jsonString);

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(jsonString);
      } catch (parseErr) {
        // If not JSON, try to decode from URL-encoded format
        try {
          data = JSON.parse(decodeURIComponent(jsonString));
        } catch {
          throw new Error('Invalid QR format: not valid JSON');
        }
      }

      console.log('✅ Parsed data:', data);

      // Validate data structure
      if (!data.type || !data.id) {
        throw new Error('Invalid QR format: missing type or id');
      }

      // Validate type
      if (!['participant', 'coordinator', 'program'].includes(data.type)) {
        throw new Error(`Invalid type: ${data.type}. Must be participant, coordinator, or program`);
      }

      // Must have programId
      if (!data.programId) {
        throw new Error('Invalid QR format: missing programId');
      }

      console.log('🎉 QR validated successfully:', data);
      setParsedData(data);
      setSuccess(`✅ ${data.type} QR detected!`);

      // Auto-navigate to QRView after short delay
      setTimeout(() => {
        navigateToQRView(data);
      }, 1500);
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to parse QR data';
      console.error('❌ Parse error:', errorMsg);
      setError(errorMsg);
      setParsedData(null);
    }
  };

  /**
   * Navigate to QR view page with data
   */
  const navigateToQRView = (data: any) => {
    const encodedData = encodeURIComponent(JSON.stringify(data));
    console.log('🔗 Navigating to QR view with:', data);
    navigate(`/qr-view?data=${encodedData}`);
  };

  /**
   * Handle manual JSON input
   */
  const handleManualInput = () => {
    if (!manualJSON.trim()) {
      setError('Please enter QR data');
      return;
    }

    console.log('📝 Processing manual input:', manualJSON);
    parseQRData(manualJSON);
  };

  /**
   * Handle camera input (if available)
   */
  const startScanning = async () => {
    try {
      setError('');
      setScanning(true);

      // Check for camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('📷 Camera stream started');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Camera access denied';
      console.error('❌ Camera error:', errorMsg);
      setError(`Camera error: ${errorMsg}`);
      setScanning(false);
    }
  };

  /**
   * Stop camera stream
   */
  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setScanning(false);
    console.log('📷 Camera stream stopped');
  };

  /**
   * Capture and decode QR from video (fallback - requires jsQR)
   */
  const captureQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    console.log('📸 QR code captured, but decoding requires jsQR library');
    console.log('💡 Fallback: Use manual JSON input or copy QR content');
  };

  /**
   * Reset form
   */
  const resetForm = () => {
    setManualJSON('');
    setParsedData(null);
    setError('');
    setSuccess('');
    stopScanning();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">📱 QR Code Scanner</h1>
          <p className="text-lg text-gray-600">Scan or paste QR data to view details</p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-red-50 border border-red-200 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </Card>
        )}

        {/* Success Display */}
        {success && (
          <Card className="p-4 bg-green-50 border border-green-200 flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">{success}</p>
              <p className="text-green-700 text-sm">Redirecting to details page...</p>
            </div>
          </Card>
        )}

        {/* Manual Input Section */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">📝 Manual JSON Input</h2>

          <div className="space-y-2">
            <Label>Paste QR Data (JSON)</Label>
            <Textarea
              placeholder={`Paste the QR content here, e.g.:
{"type":"participant","id":"63f7c1d9...","programId":"63f7b8d9..."}`}
              value={manualJSON}
              onChange={(e) => setManualJSON(e.target.value)}
              className="font-mono text-sm h-32"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm text-blue-900">
            <p className="font-semibold">ℹ️ Expected Format:</p>
            <p className="font-mono">{"{ type, id, programId }"}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleManualInput}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              ✅ Submit QR Data
            </Button>

            <Button onClick={resetForm} variant="outline">
              🔄 Clear
            </Button>
          </div>
        </Card>

        {/* Camera Section */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">📷 Camera Scanning</h2>

          {!scanning && (
            <>
              <p className="text-gray-600">Use your device camera to scan QR codes</p>
              <Button
                onClick={startScanning}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                📷 Start Camera
              </Button>
            </>
          )}

          {scanning && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded border-2 border-gray-300"
                style={{ aspectRatio: '1' }}
              />
              <canvas
                ref={canvasRef}
                className="hidden"
                width={320}
                height={320}
              />

              <div className="space-y-2 text-sm text-gray-600">
                <p>📸 Position QR code in the camera frame</p>
                <p className="text-yellow-700 font-semibold">
                  ⚠️ Camera scanning requires QR decoder library (jsQR)
                </p>
                <p>💡 Fallback: Copy QR content and use manual input above</p>
              </div>

              <Button
                onClick={stopScanning}
                variant="destructive"
                className="w-full"
              >
                ⏹️ Stop Camera
              </Button>
            </>
          )}
        </Card>

        {/* Parsed Data Display */}
        {parsedData && (
          <Card className="p-6 space-y-4 bg-green-50 border-green-200">
            <h2 className="text-2xl font-bold text-green-900">✅ QR Data Parsed</h2>

            <pre className="bg-white p-4 rounded border-2 border-green-200 overflow-auto font-mono text-sm">
              {JSON.stringify(parsedData, null, 2)}
            </pre>

            <Button
              onClick={() => navigateToQRView(parsedData)}
              className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              👁️ View Details
            </Button>
          </Card>
        )}

        {/* Info */}
        <Card className="p-6 bg-gray-50 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">📖 How to Scan</h3>
          <ol className="text-sm text-gray-700 space-y-2">
            <li>
              <strong>Option 1 - Manual:</strong> Copy the QR content JSON and paste into the input box above
            </li>
            <li>
              <strong>Option 2 - Camera:</strong> Use your device camera to point at QR code
            </li>
            <li>
              <strong>Output:</strong> QR data is parsed and validated
            </li>
            <li>
              <strong>Navigate:</strong> Automatically redirected to detail page
            </li>
          </ol>
        </Card>

        {/* Debug Info */}
        <Card className="p-4 bg-gray-100 border border-gray-300">
          <p className="text-xs font-mono text-gray-600">
            💻 Debug: Check browser console (F12) for detailed logging
          </p>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedQRScanner;
