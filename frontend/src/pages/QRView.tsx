import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import '../styles/QRView.css';

interface QRDataResponse {
  type: 'participant' | 'coordinator' | 'program';
  programId: string;
  participant?: {
    name: string;
    email: string;
    branch: string;
    college: string;
  };
  coordinator?: {
    name: string;
    email: string;
    role: string;
    branch: string;
    phone: string;
  };
  program?: {
    name: string;
    date: string;
    location: string;
  };
}

const QRView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [qrData, setQrData] = useState<QRDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const fetchQRData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get QR data from URL
        const urlParams = new URLSearchParams(location.search);
        const qrContent = urlParams.get('data');

        console.log('🔍 Fetching QR View...');
        console.log('📱 QR Content from URL:', qrContent);

        if (!qrContent) {
          console.error('❌ No QR data in URL');
          setError('No QR data provided. Please scan a QR code.');
          setLoading(false);
          return;
        }

        // Parse QR content
        let parsedContent;
        try {
          const decoded = decodeURIComponent(qrContent);
          console.log('🔓 Decoded content:', decoded);
          parsedContent = JSON.parse(decoded);
          console.log('✅ Parsed content:', parsedContent);
        } catch (e) {
          console.error('❌ Parse error:', e);
          setError('Invalid QR code format. Could not parse data.');
          setLoading(false);
          return;
        }

        const { id: qrId, type } = parsedContent;

        if (!qrId || !type) {
          console.error('❌ Missing qrId or type');
          setError('Invalid QR code data: missing required fields');
          setLoading(false);
          return;
        }

        console.log('📊 Parsed QR:', { qrId, type });

        // Fetch QR data from backend
        console.log('🔄 Calling API: GET /api/qr-data/' + qrId);
        const response = await apiClient.get(`/qr-data/${qrId}`);

        console.log('📨 API Response:', response.data);

        if (response.data.success) {
          console.log('✅ QR Data loaded successfully:', response.data.data);
          setQrData(response.data.data);
          setScanned(true);
        } else {
          console.error('❌ API returned error:', response.data.message);
          setError(response.data.message || 'Failed to load QR data');
        }
      } catch (err: any) {
        console.error('❌ Error fetching QR data:', err);
        
        if (err.response?.status === 410) {
          setError('⏰ QR code has expired');
        } else if (err.response?.status === 404) {
          setError('❌ QR code not found');
        } else {
          const errorMsg = err.response?.data?.message || err.message || 'Failed to load QR data';
          setError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQRData();
  }, [location]);

  if (loading) {
    return (
      <div className="qr-view-container">
        <div className="qr-view-card loading">
          <div className="spinner"></div>
          <p>Loading QR data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="qr-view-container">
        <div className="qr-view-card error">
          <div className="error-icon">⚠️</div>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="qr-view-container">
        <div className="qr-view-card error">
          <p>No data available</p>
          <button onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-view-container">
      {/* Participant View */}
      {qrData.type === 'participant' && qrData.participant && (
        <div className="qr-view-card participant">
          <div className="card-header participant">
            <div className="header-icon">👤</div>
            <h1>Participant Details</h1>
          </div>

          <div className="card-content">
            {/* Program Info */}
            {qrData.program && (
              <div className="section program-section">
                <h3>📍 Event</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Event Name</label>
                    <p className="value">{qrData.program?.name || 'N/A'}</p>
                  </div>
                  <div className="info-item">
                    <label>Date</label>
                    <p className="value">{qrData.program?.date || 'N/A'}</p>
                  </div>
                  <div className="info-item">
                    <label>Location</label>
                    <p className="value">{qrData.program?.location || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Participant Info */}
            <div className="section participant-section">
              <h3>ℹ️ Details</h3>
              <div className="info-grid">
                <div className="info-item full-width">
                  <label>Name</label>
                  <p className="value name">{qrData.participant?.name || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p className="value email">{qrData.participant?.email || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Branch</label>
                  <p className="value">{qrData.participant?.branch || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>College</label>
                  <p className="value">{qrData.participant?.college || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="actions">
              <button className="action-btn register" onClick={() => {
                // Could navigate to registration details or mark attendance
                console.log('Register or mark attendance');
              }}>
                ✅ Mark Attendance
              </button>
              <button className="action-btn home" onClick={() => navigate('/')}>
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coordinator View */}
      {qrData.type === 'coordinator' && qrData.coordinator && (
        <div className="qr-view-card coordinator">
          <div className="card-header coordinator">
            <div className="header-icon">🎯</div>
            <h1>Coordinator Details</h1>
          </div>

          <div className="card-content">
            {/* Program Info */}
            {qrData.program && (
              <div className="section program-section">
                <h3>📍 Event</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Event Name</label>
                    <p className="value">{qrData.program?.name || 'N/A'}</p>
                  </div>
                  <div className="info-item">
                    <label>Date</label>
                    <p className="value">{qrData.program?.date || 'N/A'}</p>
                  </div>
                  <div className="info-item">
                    <label>Location</label>
                    <p className="value">{qrData.program?.location || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Coordinator Info */}
            <div className="section coordinator-section">
              <h3>ℹ️ Details</h3>
              <div className="info-grid">
                <div className="info-item full-width">
                  <label>Name</label>
                  <p className="value name">{qrData.coordinator?.name || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Role</label>
                  <p className="value role-badge">{qrData.coordinator?.role || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Branch</label>
                  <p className="value">{qrData.coordinator?.branch || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p className="value email">{qrData.coordinator?.email || 'N/A'}</p>
                </div>
                {qrData.coordinator?.phone && (
                  <div className="info-item">
                    <label>Phone</label>
                    <p className="value">{qrData.coordinator?.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="actions">
              <button className="action-btn contact" onClick={() => {
                if (qrData.coordinator?.email) {
                  window.location.href = `mailto:${qrData.coordinator.email}`;
                }
              }}>
                ✉️ Contact
              </button>
              <button className="action-btn home" onClick={() => navigate('/')}>
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program View */}
      {qrData.type === 'program' && qrData.program && (
        <div className="qr-view-card program">
          <div className="card-header program">
            <div className="header-icon">🎪</div>
            <h1>Program Details</h1>
          </div>

          <div className="card-content">
            <div className="section program-section">
              <div className="info-grid">
                <div className="info-item full-width">
                  <label>Event Name</label>
                  <p className="value name">{qrData.program?.name || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Date</label>
                  <p className="value">{qrData.program?.date || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Location</label>
                  <p className="value">{qrData.program?.location || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="actions">
              <button className="action-btn register" onClick={() => {
                navigate(`/register/${qrData.programId}`);
              }}>
                📝 Register
              </button>
              <button className="action-btn attend" onClick={() => {
                navigate(`/attendance/${qrData.programId}`);
              }}>
                ✅ Mark Attendance
              </button>
              <button className="action-btn home" onClick={() => navigate('/')}>
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRView;
