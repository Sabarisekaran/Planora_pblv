import React, { useState } from 'react';
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
import { Download, Copy, Check } from 'lucide-react';

// Type definitions
export interface CoordinatorData {
  type: 'coordinator';
  name: string;
  role: string;
  branch: string;
  event: string;
}

export interface ParticipantData {
  type: 'participant';
  name: string;
  event: string;
  college: string;
  email: string;
}

export type QRData = CoordinatorData | ParticipantData;

interface QRGeneratorProps {
  data?: QRData;
  onGenerate?: (data: QRData) => void;
}

/**
 * QR Code Generator Component
 * Generates QR codes with embedded full JSON data
 * Supports both Coordinators and Participants
 */
export const QRGenerator: React.FC<QRGeneratorProps> = ({ data, onGenerate }) => {
  const [qrType, setQrType] = useState<'coordinator' | 'participant'>('coordinator');
  const [copied, setCopied] = useState(false);
  const [generatedQRData, setGeneratedQRData] = useState<QRData | null>(data || null);

  // Coordinator form state
  const [coordinator, setCoordinator] = useState({
    name: '',
    role: '',
    branch: '',
    event: '',
  });

  // Participant form state
  const [participant, setParticipant] = useState({
    name: '',
    event: '',
    college: '',
    email: '',
  });

  // Generate coordinator QR
  const generateCoordinatorQR = () => {
    const coordinatorData: CoordinatorData = {
      type: 'coordinator',
      name: coordinator.name,
      role: coordinator.role,
      branch: coordinator.branch,
      event: coordinator.event,
    };

    setGeneratedQRData(coordinatorData);
    onGenerate?.(coordinatorData);
  };

  // Generate participant QR
  const generateParticipantQR = () => {
    const participantData: ParticipantData = {
      type: 'participant',
      name: participant.name,
      event: participant.event,
      college: participant.college,
      email: participant.email,
    };

    setGeneratedQRData(participantData);
    onGenerate?.(participantData);
  };

  // Download QR code
  const downloadQR = () => {
    if (!generatedQRData) return;
    
    const qrElement = document.querySelector('canvas');
    if (qrElement) {
      const link = document.createElement('a');
      link.href = qrElement.toDataURL('image/png');
      link.download = `qr-${generatedQRData.type}-${Date.now()}.png`;
      link.click();
    }
  };

  // Copy data to clipboard
  const copyToClipboard = () => {
    if (!generatedQRData) return;
    
    navigator.clipboard.writeText(JSON.stringify(generatedQRData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Type Selector */}
      <Card className="p-6">
        <Label className="text-base font-semibold mb-3 block">QR Type</Label>
        <Select value={qrType} onValueChange={(value: any) => setQrType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="coordinator">👔 Coordinator</SelectItem>
            <SelectItem value="participant">👥 Participant</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {/* Coordinator Form */}
      {qrType === 'coordinator' && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Coordinator Information</h3>

          <div>
            <Label htmlFor="coord-name">Name</Label>
            <Input
              id="coord-name"
              placeholder="e.g., John Smith"
              value={coordinator.name}
              onChange={(e) =>
                setCoordinator({ ...coordinator, name: e.target.value })
              }
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="coord-role">Role</Label>
            <Input
              id="coord-role"
              placeholder="e.g., Event Coordinator"
              value={coordinator.role}
              onChange={(e) =>
                setCoordinator({ ...coordinator, role: e.target.value })
              }
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="coord-branch">Branch</Label>
            <Input
              id="coord-branch"
              placeholder="e.g., Computer Science"
              value={coordinator.branch}
              onChange={(e) =>
                setCoordinator({ ...coordinator, branch: e.target.value })
              }
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="coord-event">Event</Label>
            <Input
              id="coord-event"
              placeholder="e.g., Tech Summit 2026"
              value={coordinator.event}
              onChange={(e) =>
                setCoordinator({ ...coordinator, event: e.target.value })
              }
              className="mt-2"
            />
          </div>

          <Button
            onClick={generateCoordinatorQR}
            className="w-full mt-4"
            disabled={
              !coordinator.name ||
              !coordinator.role ||
              !coordinator.branch ||
              !coordinator.event
            }
          >
            Generate Coordinator QR
          </Button>
        </Card>
      )}

      {/* Participant Form */}
      {qrType === 'participant' && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Participant Information</h3>

          <div>
            <Label htmlFor="part-name">Name</Label>
            <Input
              id="part-name"
              placeholder="e.g., Alice Johnson"
              value={participant.name}
              onChange={(e) =>
                setParticipant({ ...participant, name: e.target.value })
              }
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="part-event">Event</Label>
            <Input
              id="part-event"
              placeholder="e.g., AI Workshop"
              value={participant.event}
              onChange={(e) =>
                setParticipant({ ...participant, event: e.target.value })
              }
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="part-college">College</Label>
            <Input
              id="part-college"
              placeholder="e.g., Tech University"
              value={participant.college}
              onChange={(e) =>
                setParticipant({ ...participant, college: e.target.value })
              }
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="part-email">Email</Label>
            <Input
              id="part-email"
              type="email"
              placeholder="e.g., alice@example.com"
              value={participant.email}
              onChange={(e) =>
                setParticipant({ ...participant, email: e.target.value })
              }
              className="mt-2"
            />
          </div>

          <Button
            onClick={generateParticipantQR}
            className="w-full mt-4"
            disabled={
              !participant.name ||
              !participant.event ||
              !participant.college ||
              !participant.email
            }
          >
            Generate Participant QR
          </Button>
        </Card>
      )}

      {/* QR Code Display */}
      {generatedQRData && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Generated QR Code</h3>

          {/* QR Code Canvas */}
          <div className="flex justify-center p-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <QRCode
              value={JSON.stringify(generatedQRData)}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* JSON Data Display */}
          <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-48">
            <code className="text-sm font-mono text-gray-800">
              {JSON.stringify(generatedQRData, null, 2)}
            </code>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={downloadQR}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Download size={16} />
              Download QR
            </Button>

            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="flex-1 gap-2"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy JSON
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QRGenerator;
