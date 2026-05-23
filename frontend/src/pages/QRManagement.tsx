import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  Loader, 
  ArrowLeft,
  MapPin,
  User,
  CalendarDays,
  Eye
} from 'lucide-react';
import { usePrograms } from '@/contexts/ProgramContext';
import qrApi from '@/api/qrApi';
import { getQRURL } from '@/utils/baseUrl';

/**
 * COMPREHENSIVE QR MANAGEMENT SYSTEM
 * Single file handles:
 * - QR List View (all programs)
 * - QR Detail View (both Registration & Attendance QRs)
 * - QR Download/Copy
 * - Mobile-safe QR generation (uses FRONTEND_URL from backend)
 * - Mobile Responsive
 */

const QRManagement = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { programs } = usePrograms();

  // State Management
  const [view, setView] = useState<'list' | 'detail'>('list'); // list or detail
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [registrationQR, setRegistrationQR] = useState(null);
  const [attendanceQR, setAttendanceQR] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);

  // Filter QR-enabled programs
  const qrPrograms = programs.filter((program) => program.automation?.autoGenerateQR);

  // Determine initial view based on URL param
  useEffect(() => {
    if (programId) {
      const program = programs.find(p => p.id === programId);
      if (program && program.automation?.autoGenerateQR) {
        setSelectedProgram(program);
        setView('detail');
      } else {
        setError('Program not found or QR not enabled');
      }
    }
    setLoading(false);
  }, [programId, programs]);

  // Fetch QR codes when selected program changes
  useEffect(() => {
    if (view === 'detail' && selectedProgram) {
      generateQRCodes();
    }
  }, [selectedProgram?.id, view]);

  // Generate QR codes from backend
  const generateQRCodes = async () => {
    if (!selectedProgram?.id) return;

    try {
      setGeneratingQR(true);
      setError('');

      // Generate registration QR
      const regQR = await qrApi.generateQR(selectedProgram.id, 'registration');
      setRegistrationQR(regQR);
      console.log('✅ Registration QR generated:', regQR);

      // Generate attendance QR
      const attQR = await qrApi.generateQR(selectedProgram.id, 'attendance');
      setAttendanceQR(attQR);
      console.log('✅ Attendance QR generated:', attQR);
    } catch (err) {
      console.error('Error generating QR codes:', err);
      setError(`Failed to generate QR codes: ${err.message}`);
    } finally {
      setGeneratingQR(false);
    }
  };

  // Handle program selection
  const handleSelectProgram = (program) => {
    setSelectedProgram(program);
    setView('detail');
    navigate(`/qr-management/${program.id}`);
  };

  // Handle back button
  const handleBack = () => {
    setView('list');
    navigate('/qr-management');
    setSelectedProgram(null);
  };

  // Generate QR URLs - Uses public URL from environment
  const getQRUrls = (program) => {
    return {
      registration: getQRURL(`/register/${program.id}`),
      attendance: getQRURL(`/attendance/${program.id}`),
    };
  };

  // Handle copy to clipboard
  const handleCopyURL = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle download QR (placeholder - would need QR generation on backend)
  const handleDownloadQR = async (type, programName) => {
    const qrUrls = getQRUrls(selectedProgram);
    const url = type === 'registration' ? qrUrls.registration : qrUrls.attendance;
    
    // For now, copy URL to clipboard as download placeholder
    handleCopyURL(url, `download-${type}`);
    alert(`QR Code URL copied! Use a QR code generator to create the code from:\n${url}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </Card>
      </div>
    );
  }

  // ==========================================
  // LIST VIEW - All QR-Enabled Programs
  // ==========================================
  if (view === 'list') {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">QR Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and distribute QR codes for event registration and attendance
          </p>
        </div>

        {/* No Programs Message */}
        {qrPrograms.length === 0 ? (
          <Card className="p-8 text-center border-2 border-dashed">
            <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No QR-enabled programs found</p>
            <p className="text-sm text-gray-500 mt-2">
              Enable QR code automation in a program to see it here
            </p>
            <Button 
              onClick={() => navigate('/create-program')}
              className="mt-6"
            >
              Create Program
            </Button>
          </Card>
        ) : (
          /* Programs Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {qrPrograms.map((program) => (
              <Card 
                key={program.id} 
                className="p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                {/* Program Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.24em] text-purple-600 font-medium">
                      {program.eventType}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-foreground">
                      {program.eventName || 'Untitled Event'}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {program.programCategory || 'General Event'}
                    </p>
                  </div>
                  {program.eventLogo ? (
                    <img
                      src={program.eventLogo}
                      alt={program.eventName}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-purple-600" />
                    </div>
                  )}
                </div>

                {/* Program Details */}
                <div className="space-y-2 mb-6 text-sm text-gray-600">
                  {program.organizerName && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{program.organizerName}</span>
                    </div>
                  )}
                  {program.venueName && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{program.venueName}</span>
                    </div>
                  )}
                  {program.startDate && (
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      <span>{new Date(program.startDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Status & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    <QrCode className="w-3 h-3" />
                    QR Enabled
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleSelectProgram(program)}
                    className="gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    View QRs
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // DETAIL VIEW - QR Display
  // ==========================================
  if (view === 'detail' && selectedProgram) {
    const { registration, attendance } = getQRUrls(selectedProgram);

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                QR Codes
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedProgram.eventName}
              </p>
            </div>
          </div>
          {selectedProgram.eventLogo && (
            <img
              src={selectedProgram.eventLogo}
              alt={selectedProgram.eventName}
              className="h-16 w-16 rounded-lg object-cover"
            />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-red-50 border border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          </Card>
        )}

        {/* QR Codes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registration QR Card */}
          <Card className="p-6 border border-gray-200 rounded-2xl shadow-sm">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <QrCode className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">
                  Registration QR
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Users scan this to register for the event
              </p>
              <div className="inline-block px-3 py-1 bg-blue-50 rounded-full">
                <p className="text-xs text-blue-700 font-mono break-all">
                  /register/{selectedProgram.id}
                </p>
              </div>
            </div>

            {/* QR Image Display */}
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 flex items-center justify-center min-h-[300px] mb-4">
              {generatingQR ? (
                <div className="text-center">
                  <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Generating QR code...</p>
                </div>
              ) : registrationQR?.qrImage ? (
                <img 
                  src={registrationQR.qrImage} 
                  alt="Registration QR Code"
                  className="max-w-xs h-auto"
                />
              ) : (
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">QR Code Image</p>
                  <p className="text-xs text-gray-400 mt-1">Click refresh to generate</p>
                </div>
              )}
            </div>

            {/* QR URL Display and Actions */}
            <div className="space-y-2">
              {registrationQR?.data?.registrationLink && (
                <>
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 mb-3">
                    <p className="text-xs text-blue-600 font-mono break-all font-medium">
                      📱 Mobile-Safe URL:
                    </p>
                    <p className="text-xs text-blue-700 font-mono break-all mt-1">
                      {registrationQR.data.registrationLink}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleCopyURL(registrationQR.data.registrationLink, 'registration')}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    {copiedId === 'registration' ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">URL Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy URL
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => window.open(registrationQR.data.registrationLink, '_blank')}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Test URL on Mobile
                  </Button>
                </>
              )}
              {!registrationQR && !generatingQR && (
                <Button
                  onClick={generateQRCodes}
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <QrCode className="w-4 h-4" />
                  Generate QR Code
                </Button>
              )}
            </div>
          </Card>

          {/* Attendance QR Card */}
          <Card className="p-6 border border-gray-200 rounded-2xl shadow-sm">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <QrCode className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">
                  Attendance QR
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Users scan this to mark their attendance
              </p>
              <div className="inline-block px-3 py-1 bg-purple-50 rounded-full">
                <p className="text-xs text-purple-700 font-mono break-all">
                  /attendance/{selectedProgram.id}
                </p>
              </div>
            </div>

            {/* QR Image Display */}
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 flex items-center justify-center min-h-[300px] mb-4">
              {generatingQR ? (
                <div className="text-center">
                  <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Generating QR code...</p>
                </div>
              ) : attendanceQR?.qrImage ? (
                <img 
                  src={attendanceQR.qrImage} 
                  alt="Attendance QR Code"
                  className="max-w-xs h-auto"
                />
              ) : (
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">QR Code Image</p>
                  <p className="text-xs text-gray-400 mt-1">Click refresh to generate</p>
                </div>
              )}
            </div>

            {/* QR URL Display and Actions */}
            <div className="space-y-2">
              {attendanceQR?.data?.attendanceLink && (
                <>
                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 mb-3">
                    <p className="text-xs text-purple-600 font-mono break-all font-medium">
                      📱 Mobile-Safe URL:
                    </p>
                    <p className="text-xs text-purple-700 font-mono break-all mt-1">
                      {attendanceQR.data.attendanceLink}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleCopyURL(attendanceQR.data.attendanceLink, 'attendance')}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    {copiedId === 'attendance' ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">URL Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy URL
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => window.open(attendanceQR.data.attendanceLink, '_blank')}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Test URL on Mobile
                  </Button>
                </>
              )}
              {!attendanceQR && !generatingQR && (
                <Button
                  onClick={generateQRCodes}
                  className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  <QrCode className="w-4 h-4" />
                  Generate QR Code
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate(`/generate-qr/${selectedProgram.id}`)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 h-12"
          >
            <QrCode className="w-5 h-5" />
            Generate Custom QR
          </Button>
          <Button
            onClick={() => navigate(`/qr-details/${selectedProgram.id}`)}
            variant="outline"
            className="gap-2 h-12"
          >
            <Download className="w-5 h-5" />
            View QR Analytics
          </Button>
          <Button
            onClick={handleBack}
            variant="outline"
            className="gap-2 h-12"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Programs
          </Button>
        </div>

        {/* Usage Instructions */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl">
          <h3 className="font-semibold text-blue-900 mb-4">📋 How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">📝 Registration QR</h4>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>Print or display the QR code</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>User scans with mobile camera</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>Registration form opens automatically</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">4.</span>
                  <span>User fills and submits form</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">5.</span>
                  <span>Data saved to backend</span>
                </li>
              </ol>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-3">✓ Attendance QR</h4>
              <ol className="space-y-2 text-sm text-purple-800">
                <li className="flex gap-3">
                  <span className="font-bold text-purple-600">1.</span>
                  <span>Print or display the QR code</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-purple-600">2.</span>
                  <span>User scans with mobile camera</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-purple-600">3.</span>
                  <span>Attendance lookup page opens</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-purple-600">4.</span>
                  <span>User enters email address</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-purple-600">5.</span>
                  <span>Marks attendance instantly</span>
                </li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default QRManagement;
