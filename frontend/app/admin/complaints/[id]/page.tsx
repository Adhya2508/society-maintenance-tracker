'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api, getErrorMessage } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import { ArrowLeft, Clock, MessageSquare, AlertCircle } from 'lucide-react';

export default function AdminComplaintDetail() {
  const params = useParams();
  const [complaint, setComplaint] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Status Update State
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchDetails();
  }, [params.id]);

  const fetchDetails = async () => {
    try {
      const [compRes, histRes] = await Promise.all([
        api.get(`/api/complaints/${params.id}`),
        api.get(`/api/complaints/${params.id}/history`)
      ]);
      setComplaint(compRes.data);
      setHistory(histRes.data);
      setNewStatus(compRes.data.status);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus === complaint.status) return;
    
    setUpdating(true);
    setError('');
    setSuccessMessage('');
    try {
      await api.patch(`/api/admin/complaints/${params.id}/status`, {
        status: newStatus,
        note: note || undefined
      });
      setNote('');
      setSuccessMessage('Status updated & notification email sent to resident!');
      fetchDetails(); // Reload data
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to update status'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <DashboardLayout roleRequired="ADMIN"><div className="p-8 text-center">Loading...</div></DashboardLayout>;
  if (!complaint) return <DashboardLayout roleRequired="ADMIN"><div className="p-8 text-center text-red-500">Not found</div></DashboardLayout>;

  return (
    <DashboardLayout roleRequired="ADMIN">
      <div className="p-8 max-w-5xl mx-auto">
        <Link href="/admin/complaints" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand mb-6 transition font-medium text-sm">
          <ArrowLeft size={16} />
          Back to Complaints
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{complaint.category} Issue</h1>
                  <p className="text-gray-500 font-medium">{complaint.complaint_number}</p>
                </div>
                <StatusBadge status={complaint.status} />
              </div>
              
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
              </div>

              {/* Photo Attachment if present */}
              {complaint.photo_url && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Attached Photo:</p>
                  <a href={complaint.photo_url} target="_blank" rel="noopener noreferrer" className="block max-w-md">
                    <img 
                      src={complaint.photo_url} 
                      alt="Complaint attachment" 
                      className="w-full max-h-80 object-cover rounded-xl border border-gray-200 shadow-sm hover:opacity-95 transition" 
                    />
                  </a>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Resident Name</p>
                  <p className="font-semibold text-gray-900">{complaint.resident_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Resident Email</p>
                  <p className="font-semibold text-brand underline text-sm">{complaint.resident_email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Reported On</p>
                  <p className="font-medium text-gray-900">{new Date(complaint.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Update Status Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Update Status</h2>
              {successMessage && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm font-medium border border-green-200">{successMessage}</div>}
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
              
              <form onSubmit={handleStatusUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand focus:outline-none"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Note (visible to resident)</label>
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="E.g., Assigned to plumber, will be fixed today..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={updating || newStatus === complaint.status}
                    className="bg-brand py-2 px-6 rounded-lg text-white font-medium hover:bg-brand-dark transition disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* History Timeline */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock size={20} className="text-brand" />
                History Timeline
              </h2>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {history.map((item, idx) => (
                  <div key={item.id} className="relative flex items-start gap-4 z-10">
                    <div className={`w-5 h-5 rounded-full border-4 border-white shrink-0 mt-1 ${item.new_status === 'RESOLVED' ? 'bg-green-500' : item.new_status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-900 text-sm">
                            {item.new_status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.note || 'Status updated'}</p>
                        <div className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()} by {item.actor_name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
