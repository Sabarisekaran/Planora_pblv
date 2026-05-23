import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { approvalApi } from '@/services/formApi';

/**
 * APPROVAL PANEL
 * Admin can review and approve/reject late registration requests
 */

interface ApprovalRequest {
  _id: string;
  userEmail: string;
  userPhone: string;
  userName: string;
  userRole: string;
  status: 'pending' | 'approved' | 'rejected';
  requestReason: string;
  formAnswers: Record<string, any>;
  requestedAt: string;
}

const ApprovalPanel = () => {
  const { programId } = useParams();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processAction, setProcessAction] = useState<'approve' | 'reject' | null>(null);
  const [processing, setProcessing] = useState(false);

  // Fetch pending requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (!programId) {
          setError('Program ID not found');
          setLoading(false);
          return;
        }

        const data = await approvalApi.getPendingRequests(programId);
        setRequests(data.requests || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching requests');
        setLoading(false);
      }
    };

    fetchRequests();
  }, [programId]);

  // Handle approve
  const handleApprove = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      const userEmail = localStorage.getItem('userEmail') || 'admin';
      await approvalApi.approveRequest(selectedRequest._id, reviewNotes, userEmail);

      // Update list
      setRequests((prev) => prev.filter((r) => r._id !== selectedRequest._id));
      setSelectedRequest(null);
      setReviewNotes('');
      setProcessAction(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error approving request');
    } finally {
      setProcessing(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      const userEmail = localStorage.getItem('userEmail') || 'admin';
      await approvalApi.rejectRequest(selectedRequest._id, reviewNotes, userEmail);

      // Update list
      setRequests((prev) => prev.filter((r) => r._id !== selectedRequest._id));
      setSelectedRequest(null);
      setReviewNotes('');
      setProcessAction(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error rejecting request');
    } finally {
      setProcessing(false);
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Late Registration Approvals</h1>
        <p className="text-gray-600 mt-2">{requests.length} pending requests</p>
      </div>

      {/* Error */}
      {error && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        </Card>
      )}

      {/* No Requests */}
      {requests.length === 0 && (
        <Card className="p-12 text-center border border-gray-200">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">All Caught Up! ✅</h3>
          <p className="text-gray-600">
            {selectedRequest ? 'Processing request...' : 'There are no pending approval requests.'}
          </p>
        </Card>
      )}

      {/* Requests List */}
      {!selectedRequest && requests.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requests.map((request) => (
            <Card
              key={request._id}
              className="p-6 border border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setSelectedRequest(request)}
            >
              {/* User Info */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{request.userName}</h3>
                  <p className="text-sm text-gray-600">{request.userRole}</p>
                </div>
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {request.userEmail}
                </div>
                {request.userPhone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {request.userPhone}
                  </div>
                )}
              </div>

              {/* Request Reason */}
              <div className="p-3 bg-white rounded-lg mb-4">
                <p className="text-xs text-gray-600 font-medium mb-1">Request Reason</p>
                <p className="text-sm text-foreground">{request.requestReason}</p>
              </div>

              {/* Requested Time */}
              <p className="text-xs text-gray-500">
                Requested {new Date(request.requestedAt).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Request Details & Review */}
      {selectedRequest && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Card */}
            <Card className="p-6 border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                User Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Name</p>
                  <p className="text-sm font-semibold text-foreground">{selectedRequest.userName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Role</p>
                  <p className="text-sm font-semibold text-foreground capitalize">{selectedRequest.userRole}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Email</p>
                  <p className="text-sm text-blue-600">{selectedRequest.userEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Phone</p>
                  <p className="text-sm text-foreground">{selectedRequest.userPhone || '-'}</p>
                </div>
              </div>
            </Card>

            {/* Request Reason */}
            <Card className="p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Request Reason
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-foreground">{selectedRequest.requestReason}</p>
              </div>
            </Card>

            {/* Form Answers */}
            <Card className="p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-foreground mb-4">Registration Data</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.entries(selectedRequest.formAnswers || {}).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium uppercase">{key}</p>
                    <p className="text-sm text-foreground mt-1">{String(value)}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Review Panel (Sidebar) */}
          <Card className="p-6 border border-gray-200 h-fit sticky top-4">
            <h3 className="text-lg font-bold text-foreground mb-4">Review & Decision</h3>

            {/* Review Notes */}
            <div className="space-y-3 mb-6">
              <label className="text-sm font-medium text-gray-700">Review Notes</label>
              <textarea
                placeholder="Add notes about your decision..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                disabled={processing}
              />
            </div>

            {/* Action Buttons */}
            {!processAction ? (
              <div className="space-y-3">
                <Button
                  onClick={() => setProcessAction('approve')}
                  disabled={processing}
                  className="w-full gap-2 bg-green-600 hover:bg-green-700 h-12"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Request
                </Button>
                <Button
                  onClick={() => setProcessAction('reject')}
                  disabled={processing}
                  variant="destructive"
                  className="w-full gap-2 h-12"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Request
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    {processAction === 'approve'
                      ? '⚠️ Are you sure you want to APPROVE this request?'
                      : '⚠️ Are you sure you want to REJECT this request?'}
                  </p>
                </div>

                <Button
                  onClick={processAction === 'approve' ? handleApprove : handleReject}
                  disabled={processing}
                  className={processAction === 'approve' ? 'w-full bg-green-600 hover:bg-green-700' : 'w-full bg-red-600 hover:bg-red-700'}
                >
                  {processing ? 'Processing...' : 'Confirm'}
                </Button>
                <Button
                  onClick={() => setProcessAction(null)}
                  disabled={processing}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Back Button */}
            {!processAction && (
              <Button
                onClick={() => {
                  setSelectedRequest(null);
                  setReviewNotes('');
                }}
                variant="ghost"
                className="w-full mt-6"
              >
                Back to List
              </Button>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default ApprovalPanel;
