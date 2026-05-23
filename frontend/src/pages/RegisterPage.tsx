import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import DynamicForm from '../components/DynamicForm';
import { registrationApi } from '../services/registrationApi';
import { programApi } from '../services/programApi';
import { dateUtils } from '../utils/dateUtils';
import { FORM_TEMPLATES, getTemplate } from '../utils/formTemplates';
import '../styles/RegisterPage.css';

interface Program {
  id: string;
  eventName: string;
  eventType: string;
  startDate: string;
  endDate: string;
  eventLogo?: string;
}

const RegisterPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLateRegistration, setIsLateRegistration] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch program details
  useEffect(() => {
    const fetchProgram = async () => {
      try {
        if (!programId) {
          setError('Program ID not found in URL');
          setLoading(false);
          return;
        }

        console.log('🔍 RegisterPage: Fetching program', { programId, apiUrl: process.env.VITE_API_URL });
        const response = await programApi.getPublicProgramById(programId);
        console.log('✅ Program fetched:', response);
        
        if (response.success && response.data) {
          setProgram(response.data);

          // Check if registration deadline has passed
          const now = new Date();
          const endDate = new Date(response.data.endDate);
          if (now > endDate) {
            setIsLateRegistration(true);
          }
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

  const handleRegistrationSubmit = async (formData: any) => {
    try {
      setSubmitting(true);
      setError('');

      if (!programId) {
        setError('Program ID is missing');
        return;
      }

      const payload = {
        programId,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        dynamicFields: {
          ...formData,
          // Remove standard fields from dynamic fields
          email: undefined,
          name: undefined,
          phone: undefined,
        },
      };

      // Remove undefined values
      Object.keys(payload.dynamicFields).forEach(
        (key) =>
          payload.dynamicFields[key] === undefined &&
          delete payload.dynamicFields[key]
      );

      const response = await registrationApi.registerUser(payload);

      if (response.success) {
        setSuccess(true);
        if (isLateRegistration) {
          setSuccessMessage(
            'Late registration request submitted! Awaiting approval from admin.'
          );
        } else {
          setSuccessMessage('Registration successful! Welcome to the event.');
        }
        // Redirect to attendance page after 3 seconds
        setTimeout(() => {
          if (!isLateRegistration) {
            navigate(`/attendance/${programId}`);
          }
        }, 3000);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.response?.status === 409) {
        setError('You are already registered for this program');
      } else {
        setError(
          err.response?.data?.message || 'Failed to complete registration'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="register-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading program details...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="register-page">
        <div className="error-container">
          <h2>Program Not Found</h2>
          <p>{error || 'The program you are trying to register for does not exist.'}</p>
          <button onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  const programName = program.eventName;
  const programType = program.eventType;
  const template = getTemplate(programType);

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Header */}
        <div className="register-header">
          {program.eventLogo && (
            <img
              src={program.eventLogo}
              alt={programName}
              className="program-logo"
            />
          )}
          <h1>{programName}</h1>
          <p className="program-type">{template.label}</p>
          {isLateRegistration && (
            <div className="late-registration-badge">
              ⚠️ Late Registration (Requires Approval)
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Registration Successful!</h3>
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

        {/* Registration Form */}
        {!success && (
          <div className="register-form-wrapper">
            <div className="form-info">
              <p>
                <strong>Event:</strong> {programName}
              </p>
              <p>
                <strong>Registration Deadline:</strong>{' '}
                {dateUtils.formatDateReadable(program.endDate)}
              </p>
              {isLateRegistration && (
                <p className="late-info">
                  This is a late registration request. It will be reviewed and
                  approved by the admin.
                </p>
              )}
            </div>

            <DynamicForm
              fields={template.fields}
              onSubmit={handleRegistrationSubmit}
              isLoading={submitting}
              submitButtonText={
                isLateRegistration ? 'Submit Request' : 'Register'
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
