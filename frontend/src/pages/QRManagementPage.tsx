import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePrograms } from '@/contexts/ProgramContext';
import { Download, Copy, Check, AlertCircle, Loader, ArrowLeft, QrCode } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { programApi } from '@/services/programApi';
import { getQRURL } from '@/utils/baseUrl';

const QRManagementPage = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { programs } = usePrograms();
  const [program, setProgram] = useState(null);
  const [registrationQR, setRegistrationQR] = useState(null);
  const [attendanceQR, setAttendanceQR] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true);
        setError(null);

        const found = programs.find(p => p.id === programId);
        if (!found) {
          setError('Program not found');
          return;
        }

        if (!found.automation?.autoGenerateQR) {
          setError('QR code generation is not enabled for this program');
          return;
        }

        setProgram(found);

        // Generate QR URLs
        const registrationUrl = getQRURL(`/register/${found.id}`);
        const attendanceUrl = getQRURL(`/attendance/${found.id}`);

        // Fetch QR codes from backend if available
        try {
          const qrData = await programApi.generateQRs(found.id);
          setRegistrationQR(qrData.registrationQR);
          setAttendanceQR(qrData.attendanceQR);
        } catch (err) {
          console.log('Could not fetch QR codes from backend, using URL-based generation');
          setRegistrationQR({ url: registrationUrl });
          setAttendanceQR({ url: attendanceUrl });
        }
      } catch (err) {
        console.error('Error fetching program:', err);
        setError(err.message || 'Failed to load program');
      } finally {
        setLoading(false);
      }
    };

    if (programId) {
      fetchProgram();
    }
  }, [programId, programs]);

  const handleDownload = (qrImage, filename) => {
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `${filename || 'qr-code'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyURL = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/qr-codes')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
        <Card className="p-12 text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading QR codes...</p>
        </Card>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button variant="outline" size="sm" onClick={() => navigate('/qr-codes')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card className="p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-red-600">Error</h2>
              <p className="text-gray-600 mt-2">{error || 'Program not found'}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const registrationUrl = getQRURL(`/register/${program.id}`);
  const attendanceUrl = getQRURL(`/attendance/${program.id}`);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/qr-codes')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                QR Code Management
              </h1>
              <p className="text-sm text-muted-foreground">
                {program.eventName}
              </p>
            </div>
          </div>
        </div>
        {program.eventLogo && (
          <img 
            src={program.eventLogo} 
            alt={program.eventName}
            className="h-16 w-16 rounded-lg object-cover"
          />
        )}
      </div>

      {/* QR Codes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration QR */}
        <Card className="p-6 border border-gray-200 rounded-2xl shadow-sm">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-foreground">📝 Registration QR</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Users scan this to register
            </p>
            <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded inline-block">
              Route: /register/{program.id}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-gray-300 flex items-center justify-center mb-4 min-h-[256px]">
            {registrationQR?.qrImage ? (
              <img
                src={registrationQR.qrImage}
                alt="Registration QR"
                className="w-full h-full max-w-xs max-h-xs"
              />
            ) : (
              <div className="text-center py-12">
                <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">QR Code</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {registrationQR?.qrImage && (
              <Button
                onClick={() => handleDownload(registrationQR.qrImage, `registration-qr-${program.eventName}`)}
                className="w-full gap-2"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </Button>
            )}
            <Button
              onClick={() => handleCopyURL(registrationUrl, 'registration')}
              variant="outline"
              className="w-full gap-2"
            >
              {copiedId === 'registration' ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  URL Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy URL
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Attendance QR */}
        <Card className="p-6 border border-gray-200 rounded-2xl shadow-sm">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <QrCode className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-foreground">✓ Attendance QR</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Users scan this to mark attendance
            </p>
            <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded inline-block">
              Route: /attendance/{program.id}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-gray-300 flex items-center justify-center mb-4 min-h-[256px]">
            {attendanceQR?.qrImage ? (
              <img
                src={attendanceQR.qrImage}
                alt="Attendance QR"
                className="w-full h-full max-w-xs max-h-xs"
              />
            ) : (
              <div className="text-center py-12">
                <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">QR Code</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {attendanceQR?.qrImage && (
              <Button
                onClick={() => handleDownload(attendanceQR.qrImage, `attendance-qr-${program.eventName}`)}
                className="w-full gap-2"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </Button>
            )}
            <Button
              onClick={() => handleCopyURL(attendanceUrl, 'attendance')}
              variant="outline"
              className="w-full gap-2"
            >
              {copiedId === 'attendance' ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  URL Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy URL
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="p-6 bg-blue-50 border border-blue-200 rounded-2xl">
        <h3 className="font-semibold text-blue-900 mb-4">📋 How to Use</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-900">
          <div>
            <h4 className="font-medium mb-2">Registration QR</h4>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Print or display the QR code</li>
              <li>User scans with phone</li>
              <li>Registration form opens</li>
              <li>User fills and submits</li>
              <li>Data saved automatically</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium mb-2">Attendance QR</h4>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Print or display the QR code</li>
              <li>User scans with phone</li>
              <li>Attendance page opens</li>
              <li>User enters email</li>
              <li>Attendance marked</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QRManagementPage;

                  Download
                </Button>
                <Button
                  onClick={() => handleCopy(qr.qrImage, qr.subEventId)}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  {copiedId === qr.subEventId ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copiedId === qr.subEventId ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {qrCodes.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">
              No QR codes available for this program
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QRManagementPage;
