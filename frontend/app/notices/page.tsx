'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Megaphone, Pin } from 'lucide-react';

export default function ResidentNotices() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get('/api/notices');
        setNotices(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  return (
    <DashboardLayout roleRequired="RESIDENT">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-brand/10 rounded-xl text-brand">
            <Megaphone size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notice Board</h1>
            <p className="text-gray-500 mt-1">Important announcements from society management</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-12 text-gray-500">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Notices</h3>
            <p className="text-gray-500">There are currently no active announcements.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {notices.map((notice) => (
              <div 
                key={notice.id} 
                className={`bg-white rounded-xl shadow-sm border p-6 transition hover:shadow-md ${
                  notice.is_important ? 'border-amber-200 border-l-4 border-l-amber-500' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {notice.is_important && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                        <Pin size={12} />
                        IMPORTANT
                      </span>
                    )}
                    <h2 className="text-xl font-bold text-gray-900">{notice.title}</h2>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                    {new Date(notice.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="prose max-w-none text-gray-700">
                  <p className="whitespace-pre-wrap">{notice.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
