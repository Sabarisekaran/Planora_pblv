import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, Save, ArrowLeft, Share2, FileUp } from 'lucide-react';
import FieldEditor from '@/components/FieldEditor';
import QRGenerator from '@/components/QRCodeGenerator';
import ExcelImporter from '@/components/ExcelImporter';
import { customFormApi } from '@/services/customFormApi';

interface Field {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface ProgramContext {
  id: string;
  title: string;
}

const FormBuilderPage = () => {
  const { formId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const programId = searchParams.get('programId');
  const [programContext, setProgramContext] = useState<ProgramContext | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    fields: [] as Field[],
  });

  const [loading, setLoading] = useState(!!formId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);

  // Load program context if programId is provided
  useEffect(() => {
    if (programId) {
      loadProgramContext();
    }
  }, [programId]);

  // Load form if editing
  useEffect(() => {
    if (formId) {
      loadForm();
    }
  }, [formId]);

  const loadProgramContext = async () => {
    try {
      // Try to load program data - you may need to add an API endpoint for this
      // For now, we'll just store the programId
      console.log('Loading form for program:', programId);
    } catch (err) {
      console.error('Error loading program:', err);
    }
  };

  const loadForm = async () => {
    try {
      setLoading(true);
      const data = await customFormApi.getForm(formId!);
      setForm({
        title: data.title,
        description: data.description,
        fields: data.fields || [],
      });
      // Set program context if form has programId
      if (data.programId) {
        setProgramContext({
          id: data.programId._id || data.programId,
          title: data.programId.title || 'Unknown Program',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading form');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelImport = (importedFields: Field[]) => {
    // Add imported fields to the form
    const newFields = [
      ...form.fields,
      ...importedFields,
    ];
    setForm({
      ...form,
      fields: newFields,
    });
    setSuccess(`Added ${importedFields.length} field(s) from Excel`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddField = async (field: Omit<Field, 'id'>) => {
    if (formId) {
      // Add field to existing form
      try {
        setSaving(true);
        await customFormApi.addField(
          formId,
          field.label,
          field.type,
          field.required,
          field.placeholder,
          field.options
        );
        await loadForm(); // Reload to get updated form
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error adding field');
      } finally {
        setSaving(false);
      }
    } else {
      // Add to temporary form
      const newField: Field = {
        id: `field_${Date.now()}`,
        ...field,
      };
      setForm({
        ...form,
        fields: [...form.fields, newField],
      });
    }
  };

  const handleRemoveField = async (fieldId: string) => {
    if (formId) {
      // Remove from existing form
      try {
        setSaving(true);
        await customFormApi.removeField(formId, fieldId);
        await loadForm();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error removing field');
      } finally {
        setSaving(false);
      }
    } else {
      // Remove from temporary form
      setForm({
        ...form,
        fields: form.fields.filter((f) => f.id !== fieldId),
      });
    }
  };

  const handleSaveForm = async () => {
    try {
      if (!form.title.trim()) {
        setError('Form title is required');
        return;
      }

      setSaving(true);
      setError('');

      if (formId) {
        // Update existing form
        await customFormApi.updateForm(formId, form.title, form.description, form.fields, true);
        setSuccess('Form updated successfully!');
      } else {
        // Create new form (with programId if available)
        const result = await customFormApi.createForm(
          form.title,
          form.description,
          form.fields,
          programId || undefined
        );
        setSuccess('Form created successfully!');
        // Redirect to form details
        setTimeout(() => {
          navigate(`/form-builder/${result.form._id}${programId ? `?programId=${programId}` : ''}`);
        }, 1000);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving form');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {formId ? 'Edit Form' : 'Create New Form'}
            </h1>
            <p className="text-gray-600 mt-1">
              {programId
                ? 'Create a registration form for your program'
                : formId
                  ? 'Modify your form and share it'
                  : 'Build a custom form and collect responses'}
            </p>
          </div>
        </div>
      </div>

      {/* Program Context Badge */}
      {programId && (
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2">
            <span className="text-blue-700 font-medium">📌 Program-Specific Form</span>
            {programContext && (
              <span className="text-blue-600">: {programContext.title}</span>
            )}
            <span className="text-xs text-blue-500 ml-auto">This form is linked to a specific program</span>
          </div>
        </Card>
      )}

      {/* Error & Success Messages */}
      {error && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {success && (
        <Card className="p-4 bg-green-50 border border-green-200">
          <p className="text-green-700">{success}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form Details */}
          <Card className="p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-foreground mb-4">Form Details</h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Form Title *
                </label>
                <Input
                  placeholder="e.g., Customer Feedback Form"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Tell users what this form is about"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </Card>

          {/* Excel Importer */}
          {!formId && (
            <ExcelImporter onImportComplete={handleExcelImport} />
          )}

          {/* Field Editor */}
          <FieldEditor
            fields={form.fields}
            onAddField={handleAddField}
            onRemoveField={handleRemoveField}
          />

          {/* Save Button */}
          <Button
            onClick={handleSaveForm}
            disabled={saving}
            className="w-full gap-2 bg-green-600 hover:bg-green-700 h-12 text-lg"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {formId ? 'Update Form' : 'Create Form'}
              </>
            )}
          </Button>
        </div>

        {/* Sidebar - QR & Share */}
        {formId && (
          <div className="space-y-6">
            <QRGenerator formId={formId} formTitle={form.title} />

            {/* Share Button */}
            <Button
              onClick={() => setShowQR(!showQR)}
              variant="outline"
              className="w-full gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Form
            </Button>

            {/* Form Stats */}
            <Card className="p-4 bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-600">Total Fields: {form.fields.length}</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilderPage;
