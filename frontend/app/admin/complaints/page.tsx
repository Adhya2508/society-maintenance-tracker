'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import { AlertCircle, Search, Filter } from 'lucide-react';

export default function AdminComplaints() {
  const [data, setData] = useState<any>({ data: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (category) params.append('category', category);
        if (priority) params.append('priority', priority);
        if (search) params.append('search', search);
        params.append('page', page.toString());
        params.append('limit', '20');

        const res = await api.get(`/api/admin/complaints?${params.toString()}`);
        setData(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce search slightly
    const timeoutId = setTimeout(() => {
      fetchComplaints();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [status, category, priority, search, page]);

  // Sort: Overdue first, then by date
  const sortedComplaints = [...(data.data || [])].sort((a, b) => {
    if (a.is_overdue && !b.is_overdue) return -1;
    if (!a.is_overdue && b.is_overdue) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <DashboardLayout roleRequired="ADMIN">
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Complaints</h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search ID or description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand focus:outline-none text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="py-2 px-3 border rounded-lg text-sm focus:ring-2 focus:ring-brand focus:outline-none bg-white min-w-[140px]">
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="py-2 px-3 border rounded-lg text-sm focus:ring-2 focus:ring-brand focus:outline-none bg-white min-w-[140px]">
            <option value="">All Categories</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="CLEANING">Cleaning</option>
            <option value="SECURITY">Security</option>
            <option value="PARKING">Parking</option>
            <option value="OTHER">Other</option>
          </select>

          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="py-2 px-3 border rounded-lg text-sm focus:ring-2 focus:ring-brand focus:outline-none bg-white min-w-[140px]">
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading complaints...</div>
          ) : sortedComplaints.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No complaints found matching the criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 text-sm font-semibold text-gray-600">ID / Date</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Resident</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Details</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Priority</th>
                    <th className="p-4 text-sm font-semibold text-gray-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedComplaints.map((c: any) => (
                    <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${c.is_overdue ? 'bg-red-50/30' : ''}`}>
                      <td className="p-4">
                        <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                          {c.is_overdue && (
                            <span title="Overdue">
                              <AlertCircle size={14} className="text-red-500" />
                            </span>
                          )}
                          {c.complaint_number}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(c.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-900">{c.resident_name}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-900 mb-1">{c.category}</div>
                        <div className="text-sm text-gray-500 max-w-[200px] truncate">{c.description}</div>
                      </td>
                      <td className="p-4 text-sm"><StatusBadge status={c.status} /></td>
                      <td className="p-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${c.priority === 'HIGH' ? 'border-red-200 text-red-700 bg-red-50' : c.priority === 'MEDIUM' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-green-200 text-green-700 bg-green-50'}`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-right">
                        <Link href={`/admin/complaints/${c.id}`} className="text-brand font-medium hover:underline">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {data.pagination?.total_pages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Showing page {data.pagination.page} of {data.pagination.total_pages}
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button 
                  disabled={page === data.pagination.total_pages} 
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
