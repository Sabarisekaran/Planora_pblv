import React, { useState, useEffect } from 'react';
import qrApi from '../api/qrApi';
import { getBaseURL, logURLConfig } from '../utils/baseUrl';

/**
 * QRPage Component - Simplified for displaying Registration & Attendance QR codes
 * 
 * Mobile-Safe QR Generation:
 * - Backend uses FRONTEND_URL environment variable
 * - Falls back to window.location.origin
 * - NEVER uses localhost (fails on mobile)
 * 
 * @param {Object} program - Program data with id, eventName, etc.
 */
const QRPage = ({ program = null }) => {
  // Log URL configuration on mount (helps with debugging)
  useEffect(() => {
    logURLConfig();
  }, []);
  const [registrationQR, setRegistrationQR] = useState(null);
  const [attendanceQR, setAttendanceQR] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate both QR codes when program is passed
  useEffect(() => {
    if (program && program.id) {
      generateBothQRs();
    }
  }, [program?.id]);

  const generateBothQRs = async () => {
    if (!program || !program.id) {
      setError('Program ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Generate Registration QR
      try {
        const regData = await qrApi.generateQR(program.id, 'registration');
        console.log('✅ Registration QR:', regData);
        setRegistrationQR(regData);
      } catch (err) {
        console.error('❌ Registration QR failed:', err);
      }

      // Generate Attendance QR
      try {
        const attData = await qrApi.generateQR(program.id, 'attendance');
        console.log('✅ Attendance QR:', attData);
        setAttendanceQR(attData);
      } catch (err) {
        console.error('❌ Attendance QR failed:', err);
      }
    } catch (err) {
      console.error('Error generating QRs:', err);
      setError(err.message || 'Failed to generate QR codes');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = (qrImage, filename) => {
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = filename || 'qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If no program, show message
  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 text-amber-900">
            <h3 className="font-semibold mb-2">No Program Selected</h3>
            <p>Please select a program to generate QR codes.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">QR Code Management</h1>
          <p className="text-gray-600 mt-2">
            Program: <span className="font-semibold text-blue-600">{program.eventName || program.name || 'Unknown'}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            ID: <code className="bg-gray-100 px-2 py-1 rounded">{program.id}</code>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-4 text-red-900">
            <p className="font-semibold">Error: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-6 bg-blue-50 border border-blue-300 rounded-lg p-4 text-blue-900">
            <p className="font-semibold">⏳ Generating QR codes...</p>
          </div>
        )}

        {/* Two QR Codes Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Registration QR Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">📝 Registration QR</h2>
              <p className="text-gray-600 text-sm mb-4">
                Users scan this to register for the event
              </p>
              <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded mb-4">
                Route: <code>/register/{program.id}</code>
              </p>
            </div>

            <div className="flex justify-center mb-6">
              {registrationQR?.qrImage ? (
                <div className="bg-white p-4 border-2 border-gray-300 rounded-lg">
                  <img 
                    src={registrationQR.qrImage} 
                    alt="Registration QR Code" 
                    className="w-64 h-64"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m0 0h6m0-6V9m0 0V3m0 6h-6" />
                    </svg>
                    <p className="text-gray-500 text-sm">Generating...</p>
                  </div>
                </div>
              )}
            </div>

            {registrationQR && (
              <div className="space-y-3">
                <button
                  onClick={() => handleDownloadQR(registrationQR.qrImage, `registration-qr-${program.eventName || program.name}.png`)}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download QR Code
                </button>
              </div>
            )}
          </div>

          {/* Attendance QR Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">✓ Attendance QR</h2>
              <p className="text-gray-600 text-sm mb-4">
                Users scan this to mark their attendance
              </p>
              <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded mb-4">
                Route: <code>/attendance/{program.id}</code>
              </p>
            </div>

            <div className="flex justify-center mb-6">
              {attendanceQR?.qrImage ? (
                <div className="bg-white p-4 border-2 border-gray-300 rounded-lg">
                  <img 
                    src={attendanceQR.qrImage} 
                    alt="Attendance QR Code" 
                    className="w-64 h-64"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m0 0h6m0-6V9m0 0V3m0 6h-6" />
                    </svg>
                    <p className="text-gray-500 text-sm">Generating...</p>
                  </div>
                </div>
              )}
            </div>

            {attendanceQR && (
              <div className="space-y-3">
                <button
                  onClick={() => handleDownloadQR(attendanceQR.qrImage, `attendance-qr-${program.eventName || program.name}.png`)}
                  className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download QR Code
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-900">
            <div>
              <h4 className="font-semibold mb-2">📝 Registration QR</h4>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Print or display QR code at registration booth</li>
                <li>User scans with phone camera</li>
                <li>Registration form opens automatically</li>
                <li>User fills and submits form</li>
                <li>Data saved in database</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">✓ Attendance QR</h4>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Print or display QR code at attendance booth</li>
                <li>User scans with phone camera</li>
                <li>Attendance lookup page opens automatically</li>
                <li>User enters their email/phone</li>
                <li>Marks attendance - data updated</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={generateBothQRs}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            🔄 Regenerate QR Codes
          </button>
        </div>