import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader,
  AlertCircle,
  CheckCircle,
  QrCode,
  ArrowRight,
  Clock,
  Lock,
} from 'lucide-react';
import DynamicForm from '@/components/DynamicForm';
import RequestPanel from '@/components/RequestPanel';
import { formApi, registrationApi, approvalApi } from '@/services/formApi';
import { usePrograms } from '@/contexts/ProgramContext';

/**
 * QR REGISTRATION PAGE
 * Users scan QR → Land here → Fill form → Register or Request approval
 */

const QRRegistrationPage = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { programs } = usePrograms();

  // Get program details
  const program = programs.find((p) => p.id === programId);

  // State Management
  const [formConfig, setFormConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'identify' | 'form' | 'result'>('identify');
  
  // User identification
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [identificationType, setIdentificationType] = useState<'email' | 'phone'>('email');
  
  // Registration state
  const [isRegistering, setIsRegistering] = useState(false);
  const [previousData, setPreviousData] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState<'registered' | 'pending' | 'rejected' | null>(null);
  const [isLate, setIsLate] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);

  // Fetch form configuration
  useEffect(() => {
    const fetchForm = async () => {
      try {
        if (!programId) {
          setError('Program ID not found');
          setLoading(false);
          return;
        }

        // Fetch form config
        const form = await formApi.getForm(programId);
        setFormConfig(form);

        // Check if deadline passed
        if (program) {
          const now = new Date();
          const endDate = new Date(program.endDate);
          setIsLate(now > endDate);
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching form:', err);
        setError(err.response?.data?.message || 'Error loading form');
        setLoading(false);
      }
    };

    fetchForm();
  }, [programId, program]);

  // Step 1: Identify user
  const handleIdentify = async () => {
    if (!userEmail && !userPhone) {
      setError('Please enter email or phone');
      return;
    }

    const userIdentifier = identificationType === 'email' ? userEmail : userPhone;

    try {
      // Check registration status
      const status = await registrationApi.checkStatus(programId, userIdentifier);

      if (status.hasPendingRequest) {
        setRegistrationStatus('pending');
        setStep('result');
        return;
      }

      // Check if already registered
      try {
        const prevData = await registrationApi.getPreviousRegistration(programId, userIdentifier);
        if (prevData) {
          setPreviousData(prevData.answers);
        }
      } catch {}

      setStep('form');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error checking status');
    }
  };

  // Step 2: Submit form
  const handleSubmitForm = async (answers: Record<string, any>) => {
    const userIdentifier = identificationType === 'email' ? userEmail : userPhone;

    setIsRegistering(true);
    setError('');

    try {
      const userDetails = {
        email: userEmail,
        phone: userPhone,
        name: answers.name || userEmail,
        role: localStorage.getItem('userRole') || 'user',
      };

      // Try direct registration
      const result = await registrationApi.submitRegistration(
        programId,
        userIdentifier,
        answers,
        userDetails
      );

      if (result.registration) {
        setRegistrationStatus('registered');
        setStep('result');
      }
    } catch (err: any) {
      if (err.response?.status === 202 || err.response?.data?.requiresApproval) {
        // Late registration - show request panel
        setRequiresApproval(true);
      } else {
        setError(err.response?.data?.message || 'Error submitting registration');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRequestSubmitted = () => {
    setRegistrationStatus('pending');
    setRequiresApproval(false);
    setStep('result');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600 font-medium">Loading registration form...</p>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && step === 'identify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 text-center mb-2">Error</h2>
          <p className="text-gray-700 text-center mb-6">{error}</p>
          <Button onClick={() => navigate('/qr-codes')} className="w-full">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  // ========================
  // STEP 1: IDENTIFY USER
  // ========================
  if (step === 'identify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          {/* Program Info */}
          {program && (
            <Card className="p-6 mb-6 border border-blue-200">
              <div className="flex items-center gap-4 mb-4">
                {program.eventLogo ? (
                  <img src={program.eventLogo} alt={program.eventName} className="w-12 h-12 rounded" />
                ) : (
                  <QrCode className="w-12 h-12 text-blue-600" />
                )}
                <div>
                  <h1 className="text-xl font-bold text-foreground">{program.eventName}</h1>
                  <p className="text-sm text-gray-600">{program.programCategory}</p>
                </div>
              </div>
              {isLate && (
                <div className="flex items-center gap-2 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-700" />
                  <p className="text-sm text-yellow-800 font-medium">
                    Registration deadline passed. Late requests require approval.
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Identification Form */}
          <Card className="p-8 border border-blue-200 rounded-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-2">Register for Event</h2>
            <p className="text-gray-600 mb-6">
              Enter your email or phone to check registration status or register
            </p>

            <div className="space-y-4 mb-6">
              {/* ID Type Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  How would you like to identify?
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 flex-1 p-3 border-2 rounded-lg cursor-pointer"
                    style={{
                      borderColor: identificationType === 'email' ? '#3b82f6' : '#e5e7eb',
                      backgroundColor: identificationType === 'email' ? '#eff6ff' : 'transparent',
                    }}>
                    <input
                      type="radio"
                      value="email"
                      checked={identificationType === 'email'}
                      onChange={(e) => setIdentificationType(e.target.value as 'email' | 'phone')}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">Email</span>
                  </label>
                  <label className="flex items-center gap-2 flex-1 p-3 border-2 rounded-lg cursor-pointer"
                    style={{
                      borderColor: identificationType === 'phone' ? '#a855f7' : '#e5e7eb',
                      backgroundColor: identificationType === 'phone' ? '#faf5ff' : 'transparent',
                    }}>
                    <input
                      type="radio"
                      value="phone"
                      checked={identificationType === 'phone'}
                      onChange={(e) => setIdentificationType(e.target.value as 'email' | 'phone')}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">Phone</span>
                  </label>
                </div>
              </div>

              {/* Email Input */}
              {identificationType === 'email' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Email Address</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={userEmail}
                    onChange={(e) => {
                      setUserEmail(e.target.value);
                      setError('');
                    }}
                  />
                </div>
              )}

              {/* Phone Input */}
              {identificationType === 'phone' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={userPhone}
                    onChange={(e) => {
                      setUserPhone(e.target.value);
                      setError('');
                    }}
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleIdentify}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              We'll check if you've already registered
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // ========================
  // STEP 2: FILL FORM
  // ========================
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto py-8">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep('identify')}
              className="mb-4"
            >
              ← Change Identifier
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Registration Form</h1>
            <p className="text-gray-600 mt-2">
              {previousData ? '✅ Your previous data has been auto-filled' : 'Fill out the form to register'}
            </p>
          </div>

          {/* Form */}
          {formConfig && (
            <DynamicForm
              formConfig={formConfig}
              onSubmit={handleSubmitForm}
              isLoading={isRegistering}
              defaultValues={previousData || {}}
              submitButtonText={isLate ? 'Request Late Registration' : 'Register'}
            />
          )}

          {/* Late Registration Notice */}
          {isLate && (
            <Card className="mt-6 p-4 bg-yellow-50 border border-yellow-200">
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900">Late Registration</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    Registration is now closed, but you can submit a request for approval. An administrator will review your submission.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // ========================
  // STEP 2B: REQUEST PANEL (Late Registration)
  // ========================
  if (step === 'form' && requiresApproval) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto py-8">
          <RequestPanel
            programId={programId || ''}
            userEmail={userEmail || userPhone}
            formAnswers={{}}
            userRole={localStorage.getItem('userRole') || 'user'}
            onRequestSubmitted={handleRequestSubmitted}
            onClose={() => setStep('identify')}
          />
        </div>
      </div>
    );
  }

  // ========================
  // STEP 3: RESULT
  // ========================
  if (step === 'result') {
    if (registrationStatus === 'registered') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md text-center border-2 border-green-200">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-700 mb-2">Success! ✅</h2>
            <p className="text-gray-700 mb-6">You have been successfully registered for this event.</p>
            <div className="bg-green-100 p-4 rounded-lg mb-6">
              <p className="text-sm text-green-900">
                <span className="font-semibold">Email:</span> {userEmail || userPhone}
              </p>
              <p className="text-sm text-green-900 mt-2">
                <span className="font-semibold">Status:</span>{' '}
                <span className="text-green-700 font-bold">Registered</span>
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              📧 A confirmation email has been sent to you.
            </p>
            <Button
              onClick={() => navigate('/qr-codes')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Done
            </Button>
          </Card>
        </div>
      );
    }

    if (registrationStatus === 'pending') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md text-center border-2 border-yellow-200">
            <Clock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-yellow-700 mb-2">Pending Approval ⏳</h2>
            <p className="text-gray-700 mb-6">Your late registration request is awaiting approval.</p>
            <div className="bg-yellow-100 p-4 rounded-lg mb-6">
              <p className="text-sm text-yellow-900">
                <span className="font-semibold">Email:</span> {userEmail || userPhone}
              </p>
              <p className="text-sm text-yellow-900 mt-2">
                <span className="font-semibold">Status:</span>{' '}
                <span className="text-yellow-700 font-bold">Pending Approval</span>
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              ⏰ An administrator will review your request soon. You'll receive an email once it's decided.
            </p>
            <Button
              onClick={() => navigate('/qr-codes')}
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
          </Card>
        </div>
      );
    }
  }

  return null;
};

export default QRRegistrationPage;
