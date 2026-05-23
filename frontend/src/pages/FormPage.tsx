import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { customFormApi, responseApi } from '@/services/customFormApi';

interface Field {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface FormData {
  title: string;
  description?: string;
  fields: Field[];
}

const FormPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (formId) {
      loadForm();
    }
  }, [formId]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const data = await customFormApi.getForm(formId!);
      setForm(data);
      // Initialize answers object
      const initialAnswers: Record<string, any> = {};
      data.fields?.forEach((field: Field) => {
        initialAnswers[field.id] = '';
      });
      setAnswers(initialAnswers);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading form');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setAnswers({
      ...answers,
      [fieldId]: value,
    });
  };

  const validateForm = (): boolean => {
    if (!form) return false;

    for (const field of form.fields) {
      if (field.required && !answers[field.id]) {
        setError(`${field.label} is required`);
        return false;
      }

      if (field.type === 'email' && answers[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(answers[field.id])) {
          setError(`${field.label} must be a valid email`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const formattedAnswers: Record<string, any> = {};
      form?.fields?.forEach((field: Field) => {
        formattedAnswers[field.label] = answers[field.id];
      });

      await responseApi.submitResponse(formId!, formattedAnswers, userEmail);

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error submitting form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Form Not Found</h2>
          <p className="text-gray-600">The form you're looking for doesn't exist.</p>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-4">Your response has been submitted successfully.</p>
          <p className="text-sm text-gray-500">Redirecting...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Form Header */}
        <Card className="p-8 mb-6 border border-gray-200">
          <h1 className="text-4xl font-bold text-foreground mb-3">{form.title}</h1>
          {form.description && (
            <p className="text-gray-600 text-lg">{form.description}</p>
          )}
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="p-4 mb-6 bg-red-50 border border-red-200">
            <p className="text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </p>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input (optional) */}
          <Card className="p-6 border border-gray-200">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Your Email (optional)
            </label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </Card>

          {/* Form Fields */}
          {form.fields?.map((field) => (
            <Card key={field.id} className="p-6 border border-gray-200">
              <label className="text-sm font-medium text-gray-700 block mb-3">
                {field.label}
                {field.required && <span className="text-red-600 ml-1">*</span>}
              </label>

              {/* Text Input */}
              {field.type === 'text' && (
                <Input
                  type="text"
                  placeholder={field.placeholder}
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                />
              )}

              {/* Email Input */}
              {field.type === 'email' && (
                <Input
                  type="email"
                  placeholder={field.placeholder}
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                />
              )}

              {/* Number Input */}
              {field.type === 'number' && (
                <Input
                  type="number"
                  placeholder={field.placeholder}
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                />
              )}

              {/* Textarea */}
              {field.type === 'textarea' && (
                <textarea
                  placeholder={field.placeholder}
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  rows={4}
                  required={field.required}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              )}

              {/* Dropdown */}
              {field.type === 'dropdown' && (
                <select
                  value={answers[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">-- Select an option --</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {/* Checkbox */}
              {field.type === 'checkbox' && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={field.id}
                    checked={answers[field.id] || false}
                    onChange={(e) => handleInputChange(field.id, e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <label htmlFor={field.id} className="text-gray-700">
                    {field.placeholder || 'Check if applicable'}
                  </label>
                </div>
              )}
            </Card>
          ))}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Form'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default FormPage;
