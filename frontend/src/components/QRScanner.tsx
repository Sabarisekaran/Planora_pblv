import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Scan, X } from 'lucide-react';
import { QRData, CoordinatorData, ParticipantData } from './QRGenerator';

interface QRScannerProps {
  onScan?: (data: QRData) => void;
}

/**
 * QR Code Scanner Component
 * Scans QR codes and extracts embedded JSON data
 * Supports manual JSON input as fallback
 */
export const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const [manualJSON, setManualJSON] = useState('');
  const [parsedData, setParsedData] = useState<QRData | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse JSON from QR scan or manual input
  const parseQRData = (jsonString: string) => {
    try {
      setError('');
      const data = JSON.parse(jsonString);

      // Validate data structure
      if (!data.type || (data.type !== 'coordinator' && data.type !== 'participant')) {
        throw new Error('Invalid QR data: missing or invalid type');
      }

      if (data.type === 'coordinator') {
        const coordinatorData: CoordinatorData = data;
        if (!coordinatorData.name || !coordinatorData.role || !coordinatorData.branch || !coordinatorData.event) {
          throw new Error('Invalid coordinator data: missing required fields');
        }
        setParsedData(coordinatorData);
        onScan?.(coordinatorData);
      } else if (data.type === 'participant') {
        const participantData: ParticipantData = data;
        if (!participantData.name || !participantData.event || !participantData.college || !participantData.email) {
          throw new Error('Invalid participant data: missing required fields');
        }
        setParsedData(participantData);
        onScan?.(participantData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse QR data';
      setError(errorMessage);
      setParsedData(null);
    }
  };

  // Handle manual JSON input
  const handleManualInput = () => {
    if (!manualJSON.trim()) {
      setError('Please enter JSON data');
      return;
    }
    parseQRData(manualJSON);
  };

  // Handle image upload with jsQR (fallback)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      const reader = new FileReader();

      reader.onload = async (event) => {
        const img = new Image();
        img.onload = async () => {
          try {
            // Try to use jsQR library if available
            // For now, show fallback message
            setError('QR Image scanning requires jsQR library. Use manual JSON input as fallback.');
          } catch (err) {
            setError('Failed to scan QR code from image');
          }
        };
        img.src = event.target?.result as string;
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process image file');
    }
  };

  // Clear parsed data
  const clearData = () => {
    setParsedData(null);
    setManualJSON('');
    setError('');
  };

  return (
    <div className="w-full space-y-6">
      {/* Manual JSON Input */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">📝 Manual JSON Input</h3>

        <div>
          <Label htmlFor="json-input">Paste QR JSON Data</Label>
          <Textarea
            id="json-input"
            placeholder={`Paste QR JSON data here. Example:
{
  "type": "coordinator",
  "name": "John Smith",
  "role": "Event Coordinator",
  "branch": "Computer Science",
  "event": "Tech Summit 2026"
}`}
            value={manualJSON}
            onChange={(e) => setManualJSON(e.target.value)}
            className="mt-2 font-mono text-sm"
            rows={8}
          />
        </div>

        <Button onClick={handleManualInput} className="w-full gap-2">
          <Scan size={16} />
          Parse QR Data
        </Button>
      </Card>

      {/* Image Upload */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">🖼️ Upload QR Image</h3>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="w-full gap-2"
        >
          <Upload size={16} />
          Select QR Image (Requires jsQR)
        </Button>

        <p className="text-sm text-gray-500">
          Note: Image scanning requires jsQR library. Use manual JSON input for best results.
        </p>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-red-300 bg-red-50">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      {/* Parsed Data Display */}
      {parsedData && (
        <Card className="p-6 space-y-4 border-green-300 bg-green-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-green-900">✅ QR Data Scanned Successfully</h3>
            <Button
              onClick={clearData}
              variant="ghost"
              size="sm"
              className="gap-1"
            >
              <X size={16} />
              Clear
            </Button>
          </div>

          {/* Data Details by Type */}
          {parsedData.type === 'coordinator' && (
            <CoordinatorDisplay data={parsedData} />
          )}

          {parsedData.type === 'participant' && (
            <ParticipantDisplay data={parsedData} />
          )}

          {/* Raw JSON */}
          <div className="mt-4">
            <Label>Raw JSON Data</Label>
            <div className="bg-white p-4 rounded-lg mt-2 overflow-auto max-h-48">
              <code className="text-sm font-mono text-gray-800">
                {JSON.stringify(parsedData, null, 2)}
              </code>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

/**
 * Display parsed Coordinator data
 */
const CoordinatorDisplay: React.FC<{ data: CoordinatorData }> = ({ data }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-3 bg-white rounded border border-green-200">
        <p className="text-xs text-gray-600">Name</p>
        <p className="text-lg font-semibold text-green-900">{data.name}</p>
      </div>
      <div className="p-3 bg-white rounded border border-green-200">
        <p className="text-xs text-gray-600">Role</p>
        <p className="text-lg font-semibold text-green-900">{data.role}</p>
      </div>
      <div className="p-3 bg-white rounded border border-green-200">
        <p className="text-xs text-gray-600">Branch</p>
        <p className="text-lg font-semibold text-green-900">{data.branch}</p>
      </div>
      <div className="p-3 bg-white rounded border border-green-200">
        <p className="text-xs text-gray-600">Event</p>
        <p className="text-lg font-semibold text-green-900">{data.event}</p>
      </div>
    </div>
  </div>
);

/**
 * Display parsed Participant data
 */
const ParticipantDisplay: React.FC<{ data: ParticipantData }> = ({ data }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-3 bg-white rounded border border-green-200">
        <p className="text-xs text-gray-600">Name</p>
        <p className="text-lg font-semibold text-green-900">{data.name}</p>
      </div>
      <div className="p-3 bg-white rounded border border-green-200">
        <p className="text-xs text-gray-600">Event</p>
        <p className="text-lg font-semibold text-green-900">{data.event}</p>
      </div>
      <div className="p-3 bg-white rounded border border-green-200">
        <p className="text-xs text-gray-600">College</p>
        <p className="text-lg font-semibold text-green-900">{data.college}</p>
      </div>
      <div className="p-3 bg-white rounded border border-green-200">
        <p className="text-xs text-gray-600">Email</p>
        <p className="text-sm font-mono text-green-900">{data.email}</p>
      </div>
    </div>
  </div>
);

export default QRScanner;
