import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';
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
import { Download, Copy, Check, AlertCircle } from 'lucide-react';
import qrViewApi from '@/services/qrViewApi';

/**
 * Enhanced QR Generator Component
 * Uses API-based approach: encodes ID in QR, fetches full data from backend
 * This prevents data loss on page reload and ensures data stays up-to-date
 */
const EnhancedQRGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [qrType, setQrType] = useState<'participant' | 'coordinator' | 'program'>('participant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedQR, setGeneratedQR] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Participant form
  const [participantData, setParticipantData] = useState({
    programId: '',
    registrationId: '',
    name: '',
    email: '',
    branch: '',
    college: '',
  });

  // Coordinator form
  const [coordinatorData, setCoordinatorData] = useState({
    programId: '',
    coordinatorId: '',
    name: '',
    role: '',
    branch: '',
    email: '',
    phone: '',
  });

  // Program form
  const [programData, setProgramData] = useState({
    programId: '',
    eventName: '',
    date: '',
    location: '',
  });

  /**
   * Generate Participant QR
   */
  const generateParticipantQR = async () => {
    try {
      setError('');
      setLoading(true);

      if (!participantData.programId || !participantData.registrationId) {
        setError('Program ID and Registration ID are required');
        return;
      }

      console.log('🔄 Generating participant QR...', participantData);

      const result = await qrViewApi.generateQR(
        'participant',
        participantData.programId,
        participantData.registrationId
      );

      if (result.success) {
        console.log('✅ QR Generated:', result.data);
        setGeneratedQR(result.data);
      } else {
        setError(result.message || 'Failed to generate QR');
      }
    } catch (err: any) {
      console.error('❌ Error generating QR:', err);
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate Coordinator QR
   */
  const generateCoordinatorQR = async () => {
    try {
      setError('');
      setLoading(true);

      if (!coordinatorData.programId || !coordinatorData.coordinatorId) {
        setError('Program ID and Coordinator ID are required');
        return;
      }

      console.log('🔄 Generating coordinator QR...', coordinatorData);

      const result = await qrViewApi.generateQR(
        'coordinator',
        coordinatorData.programId,
        undefined,
        coordinatorData.coordinatorId
      );

      if (result.success) {
        console.log('✅ QR Generated:', result.data);
        setGeneratedQR(result.data);
      } else {
        setError(result.message || 'Failed to generate QR');
      }
    } catch (err: any) {
      console.error('❌ Error generating QR:', err);
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Download QR Code
   */
  const downloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `qr-${generatedQR.qrId}.png`;
      link.click();
    }
  };

  /**
   * Copy QR Content to Clipboard
   */
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedQR.qrContent, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Test Scan - Navigate to QR view to simulate scanning
   */
  const testScan = () => {
    if (!generatedQR) return;
    const content = encodeURIComponent(generatedQR.qrContent);
    navigate(`/qr-view?data=${content}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">🎯 Enhanced QR Generator</h1>
          <p className="text-lg text-gray-600">Generate QR codes with embedded participant/coordinator data</p>
        </div>

        {/* Type Selector */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Select QR Type</Label>
            <Select value={qrType} onValueChange={(value: any) => setQrType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participant">👥 Participant QR</SelectItem>
                <SelectItem value="coordinator">👔 Coordinator QR</SelectItem>
                <SelectItem value="program">🎪 Program QR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-red-50 border border-red-200">
            <div className="flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Participant Form */}
        {qrType === 'participant' && (
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">👥 Participant QR</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Program ID *</Label>
                <Input
                  placeholder="e.g., 63f7b8d9..."
                  value={participantData.programId}
                  onChange={(e) =>
                    setParticipantData({ ...participantData, programId: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Registration ID *</Label>
                <Input
                  placeholder="e.g., 63f7c1d9..."
                  value={participantData.registrationId}
                  onChange={(e) =>
                    setParticipantData({
                      ...participantData,
                      registrationId: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Name (Display)</Label>
                <Input
                  placeholder="Participant name"
                  value={participantData.name}
                  onChange={(e) =>
                    setParticipantData({ ...participantData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Email (Display)</Label>
                <Input
                  placeholder="participant@example.com"
                  value={participantData.email}
                  onChange={(e) =>
                    setParticipantData({ ...participantData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Branch (Display)</Label>
                <Input
                  placeholder="e.g., Computer Science"
                  value={participantData.branch}
                  onChange={(e) =>
                    setParticipantData({ ...participantData, branch: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>College (Display)</Label>
                <Input
                  placeholder="e.g., XYZ University"
                  value={participantData.college}
                  onChange={(e) =>
                    setParticipantData({ ...participantData, college: e.target.value })
                  }
                />
              </div>
            </div>

            <Button
              onClick={generateParticipantQR}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Generating...' : '📱 Generate QR'}
            </Button>
          </Card>
        )}

        {/* Coordinator Form */}
        {qrType === 'coordinator' && (
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">👔 Coordinator QR</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Program ID *</Label>
                <Input
                  placeholder="e.g., 63f7b8d9..."
                  value={coordinatorData.programId}
                  onChange={(e) =>
                    setCoordinatorData({ ...coordinatorData, programId: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Coordinator ID *</Label>
                <Input
                  placeholder="e.g., 63f7d5a1..."
                  value={coordinatorData.coordinatorId}
                  onChange={(e) =>
                    setCoordinatorData({
                      ...coordinatorData,
                      coordinatorId: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Name (Display)</Label>
                <Input
                  placeholder="Coordinator name"
                  value={coordinatorData.name}
                  onChange={(e) =>
                    setCoordinatorData({ ...coordinatorData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Role (Display)</Label>
                <Input
                  placeholder="e.g., Manager"
                  value={coordinatorData.role}
                  onChange={(e) =>
                    setCoordinatorData({ ...coordinatorData, role: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Branch (Display)</Label>
                <Input
                  placeholder="e.g., CSE"
                  value={coordinatorData.branch}
                  onChange={(e) =>
                    setCoordinatorData({ ...coordinatorData, branch: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Email (Display)</Label>
                <Input
                  placeholder="coordinator@example.com"
                  value={coordinatorData.email}
                  onChange={(e) =>
                    setCoordinatorData({ ...coordinatorData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Phone (Display)</Label>
                <Input
                  placeholder="9876543210"
                  value={coordinatorData.phone}
                  onChange={(e) =>
                    setCoordinatorData({ ...coordinatorData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <Button
              onClick={generateCoordinatorQR}
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white"
            >
              {loading ? 'Generating...' : '👔 Generate QR'}
            </Button>
          </Card>
        )}

        {/* Generated QR Display */}
        {generatedQR && (
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">✅ QR Code Generated</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* QR Image */}
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                {generatedQR.qrImage && (
                  <>
                    <img
                      src={generatedQR.qrImage}
                      alt="Generated QR Code"
                      className="w-64 h-64"
                    />
                    <p className="text-sm text-gray-600 mt-3 text-center">
                      Scan this QR code with your phone camera
                    </p>
                  </>
                )}
              </div>

              {/* QR Details */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">QR ID</Label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                    {generatedQR.qrId}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Content</Label>
                  <pre className="font-mono text-xs bg-gray-100 p-2 rounded overflow-auto max-h-48">
                    {JSON.stringify(generatedQR.qrContent, null, 2)}
                  </pre>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Expires</Label>
                  <p className="text-sm">
                    {new Date(generatedQR.expiresAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={downloadQR} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>

              <Button onClick={copyToClipboard} variant="outline" className="gap-2">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>

              <Button onClick={testScan} className="gap-2 bg-green-600 hover:bg-green-700">
                🔍 Test Scan
              </Button>
            </div>
          </Card>
        )}

        {/* Info */}
        <Card className="p-6 bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How It Works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ Enter Program ID and Registration/Coordinator ID</li>
            <li>✅ Click Generate to create QR code</li>
            <li>✅ QR contains minimal data: {'{type, id, programId}'}</li>
            <li>✅ When scanned, data is fetched from backend API</li>
            <li>✅ Click "Test Scan" to preview the QR view page</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedQRGenerator;
