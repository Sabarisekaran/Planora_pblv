import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, ArrowLeft, Download, Eye, X } from 'lucide-react';
import { customFormApi, responseApi } from '@/services/customFormApi';

interface Response {
  _id: string;
  answers: Record<string, any>;
  userEmail?: string;
  createdAt: string;
}

const FormResponsesPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<any>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);

  useEffect(() => {
    if (formId) {
      loadFormAndResponses();
    }
  }, [formId]);

  useEffect(() => {
    filterResponses();
  }, [searchTerm, responses]);

  const loadFormAndResponses = async () => {
    try {
      setLoading(true);
      const [formData, responsesData] = await Promise.all([
        customFormApi.getForm(formId!),
        responseApi.getResponses(formId!),
      ]);

      setForm(formData);
      setResponses(responsesData.responses || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const filterResponses = () => {
    if (!searchTerm) {
      setFilteredResponses(responses);
      return;
    }

    const filtered = responses.filter((response) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        response.userEmail?.toLowerCase().includes(searchLower) ||
        Object.values(response.answers).some(
          (value) =>
            value &&
            String(value).toLowerCase().includes(searchLower)
        )
      );
    });

    setFilteredResponses(filtered);
  };

  const handleDeleteResponse = async (responseId: string) => {
    if (window.confirm('Are you sure you want to delete this response?')) {
      try {
        await responseApi.deleteResponse(responseId);
        setResponses(responses.filter((r) => r._id !== responseId));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error deleting response');
      }
    }
  };

  const downloadCSV = () => {
    if (responses.length === 0) {
      alert('No responses to download');
      return;
    }

    const headers = ['Email', 'Submitted At', ...form.fields.map((f: any) => f.label)];
    const rows = responses.map((response) => [
      response.userEmail || 'N/A',
      new Date(response.createdAt).toLocaleString(),
      ...form.fields.map((field: any) => response.answers[field.label] || ''),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `responses-${formId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
            <h1 className="text-3xl font-bold text-foreground">Form Responses</h1>
            <p className="text-gray-600">{form?.title}</p>
          </div>
        </div>
        <Button onClick={downloadCSV} className="gap-2 bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4" />
          Download CSV
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50">
          <p className="text-sm text-gray-600">Total Responses</p>
          <p className="text-3xl font-bold text-blue-600">{responses.length}</p>
        </Card>
        <Card className="p-4 bg-purple-50">
          <p className="text-sm text-gray-600">Form Fields</p>
          <p className="text-3xl font-bold text-purple-600">{form?.fields?.length || 0}</p>
        </Card>
        <Card className="p-4 bg-green-50">
          <p className="text-sm text-gray-600">Last Response</p>
          <p className="text-sm font-semibold text-green-600">
            {responses.length > 0
              ? new Date(responses[0]?.createdAt).toLocaleDateString()
              : 'No responses'}
          </p>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 border border-gray-200">
        <Input
          placeholder="Search by email or response content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Responses Table */}
      {responses.length === 0 ? (
        <Card className="p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">No responses yet. Share your form to collect responses!</p>
        </Card>
      ) : (
        <Card className="overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Preview</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredResponses.map((response) => (
                  <tr key={response._id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {response.userEmail || 'No email'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(response.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="truncate max-w-xs inline-block">
                        {response.answers && Object.values(response.answers)
                          .slice(0, 2)
                          .join(', ')}
                        ...
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedResponse(response)}
                        className="gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteResponse(response._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-foreground">Response Details</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedResponse(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-600 font-medium">Email</p>
                <p className="font-medium text-foreground">{selectedResponse.userEmail || 'N/A'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-medium">Submitted At</p>
                <p className="font-medium text-foreground">
                  {new Date(selectedResponse.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-foreground mb-3">Answers</p>
                <div className="space-y-3">
                  {selectedResponse.answers && Object.entries(selectedResponse.answers).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium mb-1">{key}</p>
                      <p className="text-sm text-foreground">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FormResponsesPage;
