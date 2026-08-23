'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import Link from 'next/link';
import { CheckCircle2, CircleDashed, Clock, FileWarning } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

export default function ResidentDashboard() {
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

  const openCount = complaints.filter(c => c.status === 'OPEN').length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <DashboardLayout roleRequired="RESIDENT">
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resident Dashboard</h1>
          <Link href="/complaints/new" className="bg-brand text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-brand-dark transition shadow-sm">
            Raise Complaint
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <FileWarning size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-900">{complaints.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <CircleDashed size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Open</p>
              <p className="text-2xl font-bold text-gray-900">{openCount}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{resolvedCount}</p>
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Complaints</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading complaints...</div>
          ) : complaints.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No complaints raised yet.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-sm font-semibold text-gray-600">ID</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Category</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Description</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.slice(0, 5).map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4 text-sm font-medium text-gray-900">{c.complaint_number}</td>
                    <td className="p-4 text-sm text-gray-600">{c.category}</td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{c.description}</td>
                    <td className="p-4 text-sm"><StatusBadge status={c.status} /></td>
                    <td className="p-4 text-sm text-right">
                      <Link href={`/complaints/${c.id}`} className="text-brand font-medium hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {complaints.length > 5 && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <Link href="/complaints" className="text-sm font-medium text-brand hover:underline">View All Complaints</Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
