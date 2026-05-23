import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, Download, Search, Eye, X } from 'lucide-react';
import { registrationApi } from '@/services/formApi';

/**
 * RESPONSE VIEW PAGE
 * View all submitted registrations for a program
 */

interface Registration {
  _id: string;
  userIdentifier: string;
  userEmail: string;
  userName: string;
  answers: Record<string, any>;
  status: string;
  registrationDate: string;
  isLateRegistration: boolean;
}

const ResponseViewPage = () => {
  const { programId } = useParams();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Fetch registrations
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        if (!programId) {
          setError('Program ID not found');
          setLoading(false);
          return;
        }

        const data = await registrationApi.getRegistrations(programId, filterStatus || undefined);
        setRegistrations(data.registrations || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching registrations');
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [programId, filterStatus]);

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const search = searchTerm.toLowerCase();
    return (
      reg.userEmail?.toLowerCase().includes(search) ||
      reg.userName?.toLowerCase().includes(search) ||
      reg.userIdentifier?.toLowerCase().includes(search)
    );
  });

  // Download CSV
  const downloadCSV = () => {
    if (registrations.length === 0) {
      alert('No registrations to download');
      return;
    }

    // Prepare CSV headers
    const fields = ['Email', 'Name', 'Status', 'Registered At', 'Late Registration'];
    
    // Get all unique answer keys
    const answerKeys = new Set<string>();
    registrations.forEach((reg) => {
      Object.keys(reg.answers || {}).forEach((key) => answerKeys.add(key));
    });
    
    fields.push(...Array.from(answerKeys));

    // Prepare rows
    const rows = registrations.map((reg) => [
      reg.userEmail,
      reg.userName,
      reg.status,
      new Date(reg.registrationDate).toLocaleString(),
      reg.isLateRegistration ? 'Yes' : 'No',
      ...Array.from(answerKeys).map((key) => reg.answers?.[key] || ''),
    ]);

    // Create CSV content
    const csvContent = [
      fields.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${programId}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Registrations</h1>
          <p className="text-gray-600 mt-2">{filteredRegistrations.length} registrations</p>
        </div>
        <Button onClick={downloadCSV} className="gap-2">
          <Download className="w-4 h-4" />
          Download CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Status</label>
            <select
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Status</option>
              <option value="registered">Registered</option>
              <option value="approved">Approved</option>
              <option value="pending_approval">Pending Approval</option>
            </select>
          </div>

          {/* Count */}
          <div className="flex items-end">
            <div className="p-3 bg-blue-50 rounded-lg w-full">
              <p className="text-xs text-gray-600">Total Registrations</p>
              <p className="text-2xl font-bold text-blue-600">{filteredRegistrations.length}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {/* Table */}
      <Card className="overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No registrations found
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg._id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{reg.userName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{reg.userEmail}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reg.status === 'registered' ? 'bg-green-100 text-green-700' :
                        reg.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        reg.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {reg.isLateRegistration ? (
                        <span className="text-orange-600 font-medium">Late</span>
                      ) : (
                        <span className="text-green-600 font-medium">On-time</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(reg.registrationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReg(reg)}
                        className="gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-foreground">Registration Details</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedReg(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              {/* User Info */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">User Information</h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600">Name</p>
                    <p className="font-medium text-foreground">{selectedReg.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="font-medium text-foreground">{selectedReg.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <p className="font-medium text-foreground">{selectedReg.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Registration Date</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedReg.registrationDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Answers */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Form Answers</h3>
                <div className="space-y-2">
                  {Object.entries(selectedReg.answers || {}).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium capitalize">{key}</p>
                      <p className="text-sm text-foreground mt-1">{String(value)}</p>
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

export default ResponseViewPage;
