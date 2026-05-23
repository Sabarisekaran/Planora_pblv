import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { registrationApi } from '../services/registrationApi';
import { attendanceApi } from '../services/attendanceApi';
import { programApi } from '../services/programApi';
import '../styles/AttendancePage.css';

interface Program {
  id: string;
  eventName: string;
  eventType: string;
  eventLogo?: string;
}

interface Registration {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  dynamicFields?: any;
}

const AttendancePage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [inputType, setInputType] = useState<'email' | 'phone'>('email');
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [checking, setChecking] = useState(false);
  const [marking, setMarking] = useState(false);
  const [alreadyMarked, setAlreadyMarked] = useState(false);

  // Fetch program details
  useEffect(() => {
    const fetchProgram = async () => {
      try {
        if (!programId) {
          setError('Program ID not found in URL');
          setLoading(false);
          return;
        }

        console.log('🔍 AttendancePage: Fetching program', { programId, apiUrl: process.env.VITE_API_URL });
        const response = await programApi.getPublicProgramById(programId);
        console.log('✅ Program fetched:', response);
        
        if (response.success && response.data) {
          setProgram(response.data);
        } else {
          console.error('❌ Invalid response structure:', response);
          setError('Program data not found. Response: ' + JSON.stringify(response).substring(0, 100));
        }
      } catch (err: any) {
        console.error('❌ Error fetching program:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
        const status = err.response?.status || 'Unknown';
        setError(`Failed to load program (${status}): ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId]);

  const handleCheckRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setChecking(true);
      setError('');
      setRegistration(null);
      setAlreadyMarked(false);

      if (!emailOrPhone) {
        setError(`Please enter your ${inputType}`);
        return;
      }

      const response = await registrationApi.checkRegistration(
        programId!,
        inputType === 'email' ? emailOrPhone : undefined,
        inputType === 'phone' ? emailOrPhone : undefined
      );

      if (response.isRegistered && response.data) {
        const reg = response.data;
        setRegistration(reg);

        if (reg.status === 'attended') {
          setAlreadyMarked(true);
          setError('Attendance already marked for this registration');
        }
      } else {
        setError(
          'No registration found. Please register first or check your details.'
        );
      }
    } catch (err: any) {
      console.error('Check error:', err);
      setError('Failed to check registration');
    } finally {
      setChecking(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!registration || !programId) return;

    try {
      setMarking(true);
      setError('');

      const response = await attendanceApi.markAttendance(
        programId,
        registration.email
      );

      if (response.success) {
        setSuccess(true);
        setSuccessMessage(
          `Welcome ${registration.name}! Your attendance has been marked.`
        );
        setRegistration(null);
        setEmailOrPhone('');

        // Reset after 3 seconds
        setTimeout(() => {
          setSuccess(false);
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(response.message || 'Failed to mark attendance');
      }
    } catch (err: any) {
      console.error('Attendance error:', err);
      setError(
        err.response?.data?.message || 'Failed to mark attendance'
      );
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="attendance-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading program details...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="attendance-page">
        <div className="error-container">
          <h2>Program Not Found</h2>
          <p>{error || 'The program you are trying to access does not exist.'}</p>
          <button onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  const programName = program.eventName;

  return (
    <div className="attendance-page">
      <div className="attendance-container">
        {/* Header */}
        <div className="attendance-header">
          {program.eventLogo && (
            <img
              src={program.eventLogo}
              alt={programName}
              className="program-logo"
            />
          )}
          <h1>Mark Attendance</h1>
          <p className="program-name">{programName}</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Attendance Marked!</h3>
            <p>{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="error-message">
            <div className="error-icon">!</div>
            <p>{error}</p>
          </div>
        )}

        {/* Main Content */}
        {!success && (
          <div className="attendance-content">
            {!registration ? (
              /* Check Registration Form */
              <div className="check-form-wrapper">
                <h2>Enter Your Details</h2>
                <form onSubmit={handleCheckRegistration} className="check-form">
                  {/* Input Type Toggle */}
                  <div className="input-type-toggle">
                    <button
                      type="button"
                      className={`toggle-btn ${
                        inputType === 'email' ? 'active' : ''
                      }`}
                      onClick={() => {
                        setInputType('email');
                        setEmailOrPhone('');
                      }}
                    >
                      📧 Email
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${
                        inputType === 'phone' ? 'active' : ''
                      }`}
                      onClick={() => {
                        setInputType('phone');
                        setEmailOrPhone('');
                      }}
                    >
                      📱 Phone
                    </button>
                  </div>

                  {/* Input Field */}
                  <div className="form-group">
                    <label htmlFor="emailOrPhone">
                      {inputType === 'email' ? 'Email Address' : 'Phone Number'}
                    </label>
                    <input
                      id="emailOrPhone"
                      type={inputType === 'email' ? 'email' : 'tel'}
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder={
                        inputType === 'email'
                          ? 'Enter your email'
                          : 'Enter your phone number'
                      }
                      className="form-input"
                      disabled={checking}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={checking}
                  >
                    {checking ? 'Checking...' : 'Check Registration'}
                  </button>
                </form>
              </div>
            ) : (
              /* Registration Details & Mark Attendance */
              <div className="registration-details-wrapper">
                <div className="registration-card">
                  <h2>Registration Details</h2>

                  <div className="details-grid">
                    <div className="detail-item">
                      <label>Name</label>
                      <p>{registration.name}</p>
                    </div>
                    <div className="detail-item">
                      <label>Email</label>
                      <p>{registration.email}</p>
                    </div>
                    <div className="detail-item">
                      <label>Phone</label>
                      <p>{registration.phone}</p>
                    </div>
                    <div className="detail-item">
                      <label>Status</label>
                      <p className={`status-${registration.status}`}>
                        {registration.status === 'attended'
                          ? '✓ Attended'
                          : '⏳ Registered'}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Fields */}
                  {registration.dynamicFields &&
                    Object.keys(registration.dynamicFields).length > 0 && (
                      <div className="dynamic-fields">
                        <h3>Additional Information</h3>
                        <div className="fields-grid">
                          {Object.entries(registration.dynamicFields).map(
                            ([key, value]: any) => (
                              <div key={key} className="field-item">
                                <label>{key}</label>
                                <p>{value || '-'}</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {!alreadyMarked && (
                    <div className="action-buttons">
                      <button
                        className="mark-attendance-btn"
                        onClick={handleMarkAttendance}
                        disabled={marking}
                      >
                        {marking ? 'Marking...' : '✓ Mark Attendance'}
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => {
                          setRegistration(null);
                          setEmailOrPhone('');
                          setError('');
                        }}
                        disabled={marking}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {alreadyMarked && (
                    <div className="already-marked">
                      <p>✓ Attendance already marked</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
