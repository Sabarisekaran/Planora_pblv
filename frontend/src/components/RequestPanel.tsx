import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import DynamicForm from './DynamicForm';
import { registrationApi } from '@/services/formApi';

interface RequestPanelProps {
  programId: string;
  program: any;
  userEmail?: string;
  onSuccess: () => void;
}

const RequestPanel = ({ programId, program, userEmail, onSuccess }: RequestPanelProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: any) => {
    try {
      setSubmitting(true);
      setError('');

      const response = await registrationApi.submitRegistration(
        programId,
        userEmail || formData.email,
        formData,
        {
          name: formData.name || '',
          email: userEmail || formData.email || '',
          phone: formData.phone || '',
          role: 'user',
        }
      );

      if (response) {
        setSuccess(true);
        setTimeout(onSuccess, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-600 mb-2">Request Submitted!</h3>
        <p className="text-gray-600">
          Your late registration request has been submitted. The admin will review and approve it soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-amber-50 border border-amber-200">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900">Late Registration</h4>
            <p className="text-sm text-amber-800 mt-1">
              The registration deadline has passed. Your request will be sent to the admin for approval.
            </p>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </Card>
      )}

      <DynamicForm
        programType={program.eventType}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        buttonLabel="Submit Request"
        initialData={userEmail ? { email: userEmail } : {}}
      />
    </div>
  );
};

export default RequestPanel;
