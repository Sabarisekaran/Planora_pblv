import React, { useEffect, useState } from 'react';
import { registrationApi } from '../services/registrationApi';
import { programApi } from '../services/programApi';
import { dateUtils } from '../utils/dateUtils';
import '../styles/AdminDashboard.css';

interface Program {
  _id: string;
  name: string;
  type: string;
}

interface Registration {
  _id: string;
  name: string;
  email: string;
  phone: string;
  programId: string;
  status: string;
  isApproved: boolean;
  registeredAt: string;
  attendanceTime?: string;
}

interface RegistrationRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  programId: string;
  status: string;
  reason: string;
  requestedAt: string;
}

interface Stats {
  totalRegistrations: number;
  totalAttended: number;
  attendancePercentage: number;
  pendingApprovals: number;
  lateRegistrations: number;
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'registrations' | 'approvals'>(
    'stats'
  );

  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  // Load programs on mount
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const response = await programApi.getAllPrograms();
        if (response.success) {
          setPrograms(response.data);
          if (response.data.length > 0) {
            setSelectedProgram(response.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Error loading programs:', err);
        setError('Failed to load programs');
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, []);

  // Load data when program selection changes or tab changes
  useEffect(() => {
    if (selectedProgram && !loading) {
      loadProgramData();
    }
  }, [selectedProgram, activeTab]);

  const loadProgramData = async () => {
    try {
      setError('');

      if (activeTab === 'stats' || activeTab === 'registrations') {
        const [statsResponse, regsResponse] = await Promise.all([
          registrationApi.getAttendanceStats(selectedProgram),
          registrationApi.getProgramRegistrations(selectedProgram),
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
        if (regsResponse.success) {
          setRegistrations(regsResponse.data);
        }
      }

      if (activeTab === 'stats' || activeTab === 'approvals') {
        const requestsResponse = await registrationApi.getPendingRequests(
          selectedProgram
        );
        if (requestsResponse.success) {
          setRequests(requestsResponse.data);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      const userId = localStorage.getItem('userId') || 'admin'; // Get actual user ID from auth

      const response = await registrationApi.approveRequest(requestId, userId);

      if (response.success) {
        // Remove from requests and reload
        setRequests(requests.filter((r) => r._id !== requestId));
        // Reload registrations
        const regsResponse = await registrationApi.getProgramRegistrations(
          selectedProgram
        );
        if (regsResponse.success) {
          setRegistrations(regsResponse.data);
        }
      }
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Failed to approve request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string = '') => {
    try {
      setProcessingRequest(requestId);
      const response = await registrationApi.rejectRequest(
        requestId,
        reason || 'Request rejected'
      );

      if (response.success) {
        setRequests(requests.filter((r) => r._id !== requestId));
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request');
    } finally {
      setProcessingRequest(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="dashboard">
        <div className="error-state">
          <h2>No Programs Found</h2>
          <p>No programs available to manage.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Admin Dashboard</h1>
        <p>Manage registrations and attendance</p>
      </div>

      <div className="dashboard-controls">
        <label>Select Program:</label>
        <select
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="program-select"
        >
          {programs.map((program) => (
            <option key={program._id} value={program._id}>
              {program.name} ({program.type})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📈 Statistics
        </button>
        <button
          className={`tab-button ${activeTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('registrations')}
        >
          📝 Registrations ({registrations.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          ⏳ Pending Approvals ({requests.length})
        </button>
      </div>

      <div className="dashboard-content">
        {/* Statistics Tab */}
        {activeTab === 'stats' && stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <h3>Total Registrations</h3>
              <p className="stat-number">{stats.totalRegistrations}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <h3>Total Attended</h3>
              <p className="stat-number">{stats.totalAttended}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <h3>Attendance Rate</h3>
              <p className="stat-number">{stats.attendancePercentage}%</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <h3>Pending Approvals</h3>
              <p className="stat-number">{stats.pendingApprovals}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <h3>Late Registrations</h3>
              <p className="stat-number">{stats.lateRegistrations}</p>
            </div>
          </div>
        )}

        {/* Registrations Tab */}
        {activeTab === 'registrations' && (
          <div className="registrations-section">
            {registrations.length === 0 ? (
              <p className="empty-state">No registrations yet</p>
            ) : (
              <div className="table-responsive">
                <table className="registrations-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Registered</th>
                      <th>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg._id}>
                        <td>{reg.name}</td>
                        <td>{reg.email}</td>
                        <td>{reg.phone}</td>
                        <td>
                          <span className={`status-badge ${reg.status}`}>
                            {reg.status === 'attended' ? '✓' : '⏳'} {reg.status}
                          </span>
                        </td>
                        <td>{dateUtils.formatDateReadable(reg.registeredAt)}</td>
                        <td>
                          {reg.attendanceTime
                            ? dateUtils.formatDateReadable(reg.attendanceTime)
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="approvals-section">
            {requests.length === 0 ? (
              <p className="empty-state">No pending requests</p>
            ) : (
              <div className="requests-list">
                {requests.map((request) => (
                  <div key={request._id} className="request-card">
                    <div className="request-info">
                      <h3>{request.name}</h3>
                      <p>
                        <strong>Email:</strong> {request.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {request.phone}
                      </p>
                      <p>
                        <strong>Reason:</strong> {request.reason}
                      </p>
                      <p className="request-time">
                        Requested:{' '}
                        {dateUtils.formatDateReadable(request.requestedAt)}
                      </p>
                    </div>
                    <div className="request-actions">
                      <button
                        className="approve-btn"
                        onClick={() => handleApproveRequest(request._id)}
                        disabled={processingRequest === request._id}
                      >
                        {processingRequest === request._id
                          ? 'Processing...'
                          : '✓ Approve'}
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleRejectRequest(request._id)}
                        disabled={processingRequest === request._id}
                      >
                        {processingRequest === request._id
                          ? 'Processing...'
                          : '✗ Reject'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
