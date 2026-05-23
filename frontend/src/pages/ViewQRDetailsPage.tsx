import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  QrCode,
  Eye,
  MousePointer,
  TrendingUp,
  BarChart3,
  Copy,
  Download,
  Share2,
  Calendar,
  Clock,
  Smartphone,
  MapPin,
  CheckCircle,
  AlertCircle,
  Info,
  Edit,
} from 'lucide-react';

/**
 * VIEW QR DETAILS PAGE
 * Shows detailed information about QR codes
 * Features:
 * - QR code statistics
 * - Scan analytics
 * - Performance metrics
 * - Usage history
 * - Device information
 */

interface QRScanData {
  date: string;
  scans: number;
  device: string;
  location?: string;
}

const ViewQRDetailsPage = () => {
  const { programId } = useParams();
  const navigate = useNavigate();

  // Mock data - In production, this would come from backend
  const [qrData, setQrData] = useState({
    id: programId || 'QR-001',
    type: 'registration',
    programName: 'Tech Conference 2026',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    url: `https://event.example.com/register/${programId}`,
    totalScans: 1247,
    uniqueScans: 945,
    todayScans: 156,
    weekScans: 687,
    conversionRate: 75.8,
    averageScanTime: 2.3,
    status: 'active',
  });

  // Mock scan data
  const [scanData] = useState<QRScanData[]>([
    { date: 'Apr 19', scans: 156, device: 'Mobile', location: 'Event Venue' },
    { date: 'Apr 18', scans: 142, device: 'Mobile', location: 'Event Venue' },
    { date: 'Apr 17', scans: 128, device: 'Mobile', location: 'Event Venue' },
    { date: 'Apr 16', scans: 118, device: 'Mobile', location: 'Event Venue' },
    { date: 'Apr 15', scans: 143, device: 'Mobile', location: 'Event Venue' },
  ]);

  // Device breakdown
  const [deviceBreakdown] = useState({
    ios: 52,
    android: 38,
    web: 10,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
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
            <h1 className="text-3xl font-bold text-foreground">QR Code Details</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {qrData.programName} - {qrData.type.charAt(0).toUpperCase() + qrData.type.slice(1)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Status & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Status Card */}
        <Card className="p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium">Status</p>
              <p className="text-lg font-bold text-foreground mt-1">
                {qrData.status === 'active' ? 'Active' : 'Inactive'}
              </p>
            </div>
            <CheckCircle className={`w-8 h-8 ${qrData.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
        </Card>

        {/* Created Date */}
        <Card className="p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium">Created</p>
              <p className="text-sm font-bold text-foreground mt-1">
                {qrData.createdAt.toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {Math.floor((Date.now() - qrData.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days ago
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        {/* Total Scans */}
        <Card className="p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium">Total Scans</p>
              <p className="text-2xl font-bold text-foreground mt-1">{qrData.totalScans.toLocaleString()}</p>
              <p className="text-xs text-green-600 font-medium">↑ {qrData.todayScans} today</p>
            </div>
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        {/* Conversion Rate */}
        <Card className="p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium">Conversion Rate</p>
              <p className="text-2xl font-bold text-foreground mt-1">{qrData.conversionRate}%</p>
              <p className="text-xs text-gray-500">{qrData.uniqueScans.toLocaleString()} unique</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* QR Code Display */}
      <Card className="p-8 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* QR Code Image */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-lg border-2 border-gray-300">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData.url)}&ecc=H`}
                alt="QR Code"
                className="w-80 h-80 rounded"
              />
            </div>
            <p className="text-sm text-gray-600 font-medium">Scan to {qrData.type}</p>
          </div>

          {/* QR Details */}
          <div className="flex-1 space-y-6">
            {/* URL */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">QR Code URL</h3>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs font-mono text-gray-600 break-all">{qrData.url}</p>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(qrData.url)}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(qrData.url, '_blank')}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Open
                </Button>
              </div>
            </div>

            {/* Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-medium mb-2">QR Type</p>
                <div className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium w-fit">
                  {qrData.type === 'registration' ? '📝' : '✓'} {qrData.type.charAt(0).toUpperCase() + qrData.type.slice(1)}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium mb-2">QR ID</p>
                <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-mono">
                  {qrData.id}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan Timeline */}
        <Card className="p-6 border border-gray-200 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Scans Over Time
          </h3>
          <div className="space-y-3">
            {scanData.map((data, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-foreground">{data.date}</p>
                  <p className="text-xs text-gray-600">{data.device} • {data.location}</p>
                </div>
                <div className="flex items-end gap-2">
                  <div
                    className="bg-gradient-to-t from-blue-400 to-blue-600 rounded"
                    style={{
                      width: '40px',
                      height: `${(data.scans / 160) * 100}px`,
                      minHeight: '20px',
                    }}
                  />
                  <p className="font-bold text-foreground whitespace-nowrap">{data.scans}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Device Breakdown */}
        <Card className="p-6 border border-gray-200">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Device Breakdown
          </h3>
          <div className="space-y-4">
            {Object.entries(deviceBreakdown).map(([device, percentage]) => (
              <div key={device}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground capitalize">{device}</p>
                  <p className="text-sm font-bold text-gray-600">{percentage}%</p>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      device === 'ios' ? 'bg-blue-500' :
                      device === 'android' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="p-6 border border-gray-200">
        <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Unique Scans */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-blue-900 font-medium">Unique Scans</p>
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-900">{qrData.uniqueScans.toLocaleString()}</p>
            <p className="text-xs text-blue-700 mt-2">
              {((qrData.uniqueScans / qrData.totalScans) * 100).toFixed(1)}% of total scans
            </p>
          </div>

          {/* Weekly Scans */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-green-900 font-medium">This Week</p>
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-900">{qrData.weekScans.toLocaleString()}</p>
            <p className="text-xs text-green-700 mt-2">
              Avg. {Math.floor(qrData.weekScans / 7)} scans per day
            </p>
          </div>

          {/* Average Time */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-purple-900 font-medium">Avg. Response Time</p>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-900">{qrData.averageScanTime.toFixed(1)}s</p>
            <p className="text-xs text-purple-700 mt-2">
              Time to complete action
            </p>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border border-blue-200">
        <div className="flex gap-4">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">About QR Analytics</h4>
            <p className="text-sm text-blue-800">
              These analytics show how many times your QR code has been scanned and provides insights into user behavior. 
              Use this data to optimize your QR code placement and distribution strategy.
            </p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button onClick={() => navigate('/qr-management')} variant="outline" className="flex-1">
          Back to QR Management
        </Button>
        <Button onClick={() => window.print()} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Print Report
        </Button>
        <Button className="gap-2">
          <Share2 className="w-4 h-4" />
          Share Details
        </Button>
      </div>
    </div>
  );
};

export default ViewQRDetailsPage;
