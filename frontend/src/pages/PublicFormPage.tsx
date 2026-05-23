/**
 * PublicFormPage
 * 
 * Standalone public form for QR-scanned registration
 * - No authentication required
 * - Google Forms-inspired design
 * - Mobile-friendly
 * - Clean, simple flow
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';
import PublicFormLayout from '@/components/PublicFormLayout';
import DynamicForm from '@/components/DynamicForm';
import { publicApiClient } from '@/api/publicApiClient';

interface Program {
  id: string;
  eventName: string;
  startDate: string;
  endDate: string;
  eventLogo?: string;
}

interface FormConfig {
  id: string;
  programId: string;
  formTitle: string;
  formDescription?: string;
  fields: any[];
}

type PageStep = 'loading' | 'form' | 'success' | 'error' | 'closed';

const PublicFormPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();

  // State management
  const [program, setProgram] = useState<Program | null>(null);
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [currentStep, setCurrentStep] = useState<PageStep>('loading');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLateRegistration, setIsLateRegistration] = useState(false);

  // Load program and form on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!programId) {
          setError('Program ID not found in URL');
          setCurrentStep('error');
          return;
        }

        console.log('📋 PublicFormPage: Loading program', programId);

        // Fetch program from public API (no auth required)
        const programResponse = await publicApiClient.get(`/programs/${programId}`);
        if (!programResponse.data.success || !programResponse.data.data) {
          throw new Error('Failed to load program');
        }

        const loadedProgram = programResponse.data.data;
        setProgram(loadedProgram);
        console.log('✅ Program loaded:', loadedProgram.eventName);

        // Check if registration is still open
        const now = new Date();
        const endDate = new Date(loadedProgram.endDate);
        if (now > endDate) {
          setIsLateRegistration(true);
        }

        // Fetch form configuration from public API (no auth required)
        console.log('📋 Loading form configuration...');
        const formResponse = await publicApiClient.get(`/forms/${programId}`);
        if (!formResponse.data.success || !formResponse.data.data) {
          throw new Error('Failed to load form');
        }

        setFormConfig(formResponse.data.data);
        console.log('✅ Form loaded with', formResponse.data.data.fields.length, 'fields');

        setCurrentStep('form');
      } catch (err: any) {
        console.error('❌ Error loading data:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Failed to load form';
        setError(errorMsg);
        setCurrentStep('error');
      }
    };

    loadData();
  }, [programId]);

  // Handle form submission
  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      setError('');

      if (!programId) {
        setError('Program ID is missing');
        return;
      }

      console.log('📤 Submitting registration...');

      // Prepare registration payload
      const payload = {
        programId,
        email: formData.email?.toLowerCase(),
        name: formData.name,
        phone: formData.phone,
        dynamicFields: {
          ...formData,
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

      // Submit via public API (no auth required)
      const response = await publicApiClient.post('/register', payload);

      if (response.data.success) {
        console.log('✅ Registration submitted successfully');
        setCurrentStep('success');

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state
  if (currentStep === 'loading') {
    return (
      <PublicFormLayout title="Loading...">
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Loader className="animate-spin mx-auto mb-4" size={40} />
          <p>Loading form...</p>
        </div>
      </PublicFormLayout>
    );
  }

  // Render error state
  if (currentStep === 'error') {
    return (
      <PublicFormLayout title="Error">
        <div style={{ padding: '48px 24px' }}>
          <Card className="border-red-200 bg-red-50 p-6">
            <div style={{ display: 'flex', gap: '12px' }}>
              <AlertCircle size={24} className="text-red-600 flex-shrink-0" />
              <div>
                <h2 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>Unable to Load Form</h2>
                <p style={{ margin: 0, color: '#991b1b' }}>{error}</p>
              </div>
            </div>
          </Card>
        </div>
      </PublicFormLayout>
    );
  }

  // Render success state
  if (currentStep === 'success') {
    return (
      <PublicFormLayout title="Registration Successful">
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <CheckCircle size={48} className="text-green-600 mx-auto" />
          </div>
          <h2 style={{ margin: '0 0 12px 0', color: '#059669' }}>Registration Confirmed</h2>
          <p style={{ margin: '0 0 24px 0', color: '#666' }}>
            Thank you for registering for {program?.eventName}. You will receive a confirmation
            email shortly.
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#999' }}>
            Redirecting to home page...
          </p>
        </div>
      </PublicFormLayout>
    );
  }

  // Render form
  return (
    <PublicFormLayout title={program?.eventName || 'Event Registration'}>
      <div style={{ padding: '32px 24px' }}>
        {/* Program info */}
        {program && (
          <div style={{ marginBottom: '32px' }}>
            {program.eventLogo && (
              <img
                src={program.eventLogo}
                alt={program.eventName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '120px',
                  marginBottom: '16px',
                  borderRadius: '8px',
                }}
              />
            )}
            <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>{program.eventName}</h1>
            {isLateRegistration && (
              <div
                style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: '6px',
                  padding: '12px',
                  marginTop: '12px',
                  color: '#92400e',
                  fontSize: '14px',
                }}
              >
                ⚠️ Registration deadline has passed. Your submission requires approval.
              </div>
            )}
          </div>
        )}

        {/* Form */}
        {formConfig && (
          <>
            {formConfig.formDescription && (
              <p style={{ color: '#666', marginBottom: '24px' }}>{formConfig.formDescription}</p>
            )}
            <DynamicForm
              fields={formConfig.fields}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </>
        )}

        {/* Error message */}
        {error && (
          <div
            style={{
              marginTop: '24px',
              padding: '12px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#991b1b',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}
      </div>
    </PublicFormLayout>
  );
};

export default PublicFormPage;
