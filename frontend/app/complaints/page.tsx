'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';

export default function ResidentComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/api/complaints');
        setComplaints(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  return (
    <DashboardLayout roleRequired="RESIDENT">
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
            <p className="text-gray-500 mt-1">Track and manage your maintenance requests</p>
          </div>
          <Link href="/complaints/new" className="bg-brand text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-brand-dark transition shadow-sm">
            Raise Complaint
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading complaints...</div>
          ) : complaints.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Complaints Yet</h3>
              <p className="text-gray-500 mb-6">You haven't raised any maintenance requests.</p>
              <Link href="/complaints/new" className="text-brand font-medium hover:underline">Raise your first complaint</Link>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-sm font-semibold text-gray-600">ID / Date</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Details</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Priority</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 text-sm">{c.complaint_number}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(c.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900 mb-1">{c.category}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{c.description}</div>
                    </td>
                    <td className="p-4 text-sm"><StatusBadge status={c.status} /></td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${c.priority === 'HIGH' ? 'border-red-200 text-red-700 bg-red-50' : c.priority === 'MEDIUM' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-green-200 text-green-700 bg-green-50'}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right">
                      <Link href={`/complaints/${c.id}`} className="text-brand font-medium hover:underline">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
