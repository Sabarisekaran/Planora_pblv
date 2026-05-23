import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Plus, Eye, Edit, Trash2, BarChart3, Copy, Share2 } from 'lucide-react';
import { customFormApi } from '@/services/customFormApi';

interface Form {
  _id: string;
  title: string;
  description?: string;
  fields?: any[];
  createdAt: string;
  updatedAt: string;
  programId?: string | { _id: string; title: string };
  isAutoCreated?: boolean;
}

const FormsListPage = () => {
  const navigate = useNavigate();

  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await customFormApi.getAllForms();
      setForms(data.forms || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading forms');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await customFormApi.deleteForm(formId);
        setForms(forms.filter((f) => f._id !== formId));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error deleting form');
      }
    }
  };

  const copyFormUrl = (formId: string) => {
    const url = `${window.location.origin}/custom-form/${formId}`;
    navigator.clipboard.writeText(url);
    setCopied(formId);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">My Forms</h1>
          <p className="text-gray-600 mt-2">Create and manage your custom forms</p>
        </div>
        <Button
          onClick={() => navigate('/form-builder')}
          className="gap-2 bg-blue-600 hover:bg-blue-700 h-12 text-lg px-6"
        >
          <Plus className="w-5 h-5" />
          Create New Form
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {/* Forms Grid */}
      {forms.length === 0 ? (
        <Card className="p-12 text-center border border-gray-200">
          <div className="space-y-4">
            <div className="text-6xl">📋</div>
            <h3 className="text-2xl font-bold text-foreground">No Forms Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first form to start collecting responses
            </p>
            <Button
              onClick={() => navigate('/form-builder')}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create First Form
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => {
            const programInfo = typeof form.programId === 'object' ? form.programId : null;
            return (
              <Card
                key={form._id}
                className="p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                {/* Program Badge */}
                {form.isAutoCreated && (
                  <div className="mb-3 flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full w-fit">
                    <span>✓ Auto-Created</span>
                  </div>
                )}

                {programInfo && (
                  <div className="mb-3 flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full w-fit">
                    <span>📌 {programInfo.title}</span>
                  </div>
                )}

                {/* Form Title */}
                <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
                  {form.title}
                </h3>

                {/* Description */}
                {form.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {form.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between py-3 border-y border-gray-200 my-3 text-sm">
                  <span className="text-gray-600">
                    {form.fields?.length || 0} fields
                  </span>
                  <span className="text-gray-600">
                    {new Date(form.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 mt-4">
                  {/* Preview */}
                  <Button
                    onClick={() => navigate(`/custom-form/${form._id}`)}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>

                  {/* Edit */}
                  <Button
                    onClick={() => navigate(`/form-builder/${form._id}`)}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Form
                  </Button>

                  {/* View Responses */}
                  <Button
                    onClick={() => navigate(`/form-responses/${form._id}`)}
                    className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Responses
                  </Button>

                  {/* Copy URL */}
                  <Button
                    onClick={() => copyFormUrl(form._id)}
                    variant="outline"
                    className="w-full gap-2"
                    disabled={copied === form._id}
                  >
                    <Copy className="w-4 h-4" />
                    {copied === form._id ? 'Copied!' : 'Copy Link'}
                  </Button>

                  {/* Delete */}
                  <Button
                    onClick={() => handleDeleteForm(form._id)}
                    variant="destructive"
                    className="w-full gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FormsListPage;
