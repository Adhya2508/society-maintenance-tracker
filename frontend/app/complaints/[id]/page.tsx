'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import { ArrowLeft, Clock, MessageSquare, AlertCircle } from 'lucide-react';

export default function ComplaintDetail() {
  const params = useParams();
  const [complaint, setComplaint] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [compRes, histRes] = await Promise.all([
          api.get(`/api/complaints/${params.id}`),
          api.get(`/api/complaints/${params.id}/history`)
        ]);
        setComplaint(compRes.data);
        setHistory(histRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchDetails();
  }, [params.id]);

  if (loading) {
    return (
      <DashboardLayout roleRequired="RESIDENT">
        <div className="p-8 text-center text-gray-500">Loading complaint details...</div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout roleRequired="RESIDENT">
        <div className="p-8 text-center text-red-500 font-medium">Complaint not found or access denied.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout roleRequired="RESIDENT">
      <div className="p-8 max-w-4xl mx-auto">
        <Link href="/complaints" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand mb-6 transition font-medium text-sm">
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
              
              <div className="prose max-w-none mb-8">
                <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
              </div>
              
              {complaint.photo_url && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Attached Photo</h3>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <img src={complaint.photo_url} alt="Complaint attachment" className="w-full h-auto object-cover max-h-96" />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Reported On</p>
                  <p className="font-medium text-gray-900">{new Date(complaint.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Priority</p>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${complaint.priority === 'HIGH' ? 'bg-red-50 text-red-700' : complaint.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                    {complaint.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* History Timeline */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock size={20} className="text-brand" />
                Status History
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
                          <span className="text-xs text-gray-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.note || 'Status updated'}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                            {item.actor_role === 'ADMIN' ? <AlertCircle size={12} /> : <MessageSquare size={12} />}
                          </div>
                          <span>By {item.actor_name} ({item.actor_role})</span>
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
