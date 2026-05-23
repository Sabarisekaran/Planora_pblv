import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QRGenerator, { QRData, CoordinatorData, ParticipantData } from '@/components/QRGenerator';
import QRScanner from '@/components/QRScanner';
import { Card } from '@/components/ui/card';

/**
 * QR Code Full Data System Demo Page
 * 
 * This page demonstrates:
 * 1. Generating QR codes with full coordinator/participant data
 * 2. Scanning QR codes and extracting the embedded JSON
 * 3. Viewing complete information from QR codes
 */
const QRFullDataPage: React.FC = () => {
  const [scannedHistory, setScannedHistory] = useState<QRData[]>([]);
  const [lastGenerated, setLastGenerated] = useState<QRData | null>(null);

  // Handle QR generation
  const handleGenerateQR = (data: QRData) => {
    setLastGenerated(data);
  };

  // Handle QR scan
  const handleScanQR = (data: QRData) => {
    setScannedHistory((prev) => [data, ...prev.slice(0, 9)]);
  };

  // Example coordinator data
  const exampleCoordinator: CoordinatorData = {
    type: 'coordinator',
    name: 'John Smith',
    role: 'Senior Coordinator',
    branch: 'Computer Science',
    event: 'Tech Summit 2026',
  };

  // Example participant data
  const exampleParticipant: ParticipantData = {
    type: 'participant',
    name: 'Alice Johnson',
    event: 'AI Workshop',
    college: 'Tech University',
    email: 'alice.johnson@techuni.edu',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">🎯 QR Code Full Data System</h1>
          <p className="text-lg text-gray-600">
            Generate and scan QR codes with complete information embedded
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="generator">📱 Generate QR</TabsTrigger>
            <TabsTrigger value="scanner">📸 Scan QR</TabsTrigger>
            <TabsTrigger value="examples">📖 Examples</TabsTrigger>
          </TabsList>

          {/* Generator Tab */}
          <TabsContent value="generator">
            <Card className="p-6">
              <QRGenerator onGenerate={handleGenerateQR} />
            </Card>
          </TabsContent>

          {/* Scanner Tab */}
          <TabsContent value="scanner">
            <Card className="p-6">
              <QRScanner onScan={handleScanQR} />
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            {/* Coordinator Example */}
            <Card className="p-6 space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">👔 Coordinator Example</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Data Structure</h4>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs font-mono">
                    {JSON.stringify(exampleCoordinator, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Information</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs text-gray-600">Name</p>
                      <p className="font-semibold">{exampleCoordinator.name}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs text-gray-600">Role</p>
                      <p className="font-semibold">{exampleCoordinator.role}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs text-gray-600">Branch</p>
                      <p className="font-semibold">{exampleCoordinator.branch}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs text-gray-600">Event</p>
                      <p className="font-semibold">{exampleCoordinator.event}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Use Cases</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Event coordinator identification badges</li>
                  <li>Check-in/attendance verification</li>
                  <li>Role-based access control</li>
                  <li>Event staff directory</li>
                </ul>
              </div>
            </Card>

            {/* Participant Example */}
            <Card className="p-6 space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">👥 Participant Example</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Data Structure</h4>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs font-mono">
                    {JSON.stringify(exampleParticipant, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Information</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-xs text-gray-600">Name</p>
                      <p className="font-semibold">{exampleParticipant.name}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-xs text-gray-600">Event</p>
                      <p className="font-semibold">{exampleParticipant.event}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-xs text-gray-600">College</p>
                      <p className="font-semibold">{exampleParticipant.college}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="font-mono text-sm">{exampleParticipant.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Use Cases</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Event participant registration</li>
                  <li>Attendance tracking</li>
                  <li>Certificate generation</li>
                  <li>Networking and contact exchange</li>
                </ul>
              </div>
            </Card>

            {/* Data Format Comparison */}
            <Card className="p-6 space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">📊 Data Format Comparison</h3>

              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left font-semibold">Field</th>
                      <th className="p-3 text-left font-semibold">Coordinator</th>
                      <th className="p-3 text-left font-semibold">Participant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-3 font-semibold">type</td>
                      <td className="p-3">"coordinator"</td>
                      <td className="p-3">"participant"</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">name</td>
                      <td className="p-3">✓ Full Name</td>
                      <td className="p-3">✓ Full Name</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">role/event</td>
                      <td className="p-3">Role (e.g., Coordinator)</td>
                      <td className="p-3">Event Name</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">branch/college</td>
                      <td className="p-3">Department/Branch</td>
                      <td className="p-3">College/University</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">event/email</td>
                      <td className="p-3">Event Name</td>
                      <td className="p-3">Email Address</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* History Section */}
        {scannedHistory.length > 0 && (
          <Card className="p-6 space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">📋 Scan History</h3>

            <div className="space-y-3">
              {scannedHistory.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">
                        {item.type === 'coordinator' ? '👔 Coordinator' : '👥 Participant'}
                      </p>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      {item.type === 'coordinator' && (
                        <p className="text-sm text-gray-600">
                          {(item as CoordinatorData).role} • {(item as CoordinatorData).branch}
                        </p>
                      )}
                      {item.type === 'participant' && (
                        <p className="text-sm text-gray-600">
                          {(item as ParticipantData).event} • {(item as ParticipantData).college}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Feature Highlights */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">✨ Key Features</h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-indigo-100">
              <p className="text-3xl mb-2">📦</p>
              <h4 className="font-semibold text-gray-900">Full Data Embedding</h4>
              <p className="text-sm text-gray-600">
                Complete information stored in QR code, no backend lookup needed
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-indigo-100">
              <p className="text-3xl mb-2">🔐</p>
              <h4 className="font-semibold text-gray-900">Secure & Private</h4>
              <p className="text-sm text-gray-600">
                Data is JSON-encoded in QR, portable and offline-compatible
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-indigo-100">
              <p className="text-3xl mb-2">⚡</p>
              <h4 className="font-semibold text-gray-900">Fast Processing</h4>
              <p className="text-sm text-gray-600">
                Instant QR generation and scanning with no network required
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QRFullDataPage;
