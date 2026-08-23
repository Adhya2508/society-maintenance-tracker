'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api, getErrorMessage } from '@/lib/api';
import { Megaphone, Pin, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const noticeSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(5).max(2000),
  is_important: z.boolean().default(false),
});

export default function AdminNotices() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      is_important: false
    }
  });

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

  useEffect(() => {
    fetchNotices();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      setSubmitError('');
      await api.post('/api/admin/notices', data);
      setShowModal(false);
      reset();
      fetchNotices();
    } catch (err: any) {
      setSubmitError(getErrorMessage(err, 'Failed to create notice'));
    }
  };

  return (
    <DashboardLayout roleRequired="ADMIN">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand/10 rounded-xl text-brand">
              <Megaphone size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Notices</h1>
              <p className="text-gray-500 mt-1">Broadcast announcements to all residents</p>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-brand text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-dark transition shadow-sm flex items-center gap-2"
          >
            <Plus size={20} />
            New Notice
          </button>
        </div>

        {/* List of Notices */}
        {loading ? (
          <div className="text-center p-12 text-gray-500">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <p className="text-gray-500 mb-4">No notices published yet.</p>
            <button onClick={() => setShowModal(true)} className="text-brand font-medium hover:underline">Publish the first notice</button>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div 
                key={notice.id} 
                className={`bg-white rounded-xl shadow-sm border p-6 ${
                  notice.is_important ? 'border-amber-200 border-l-4 border-l-amber-500' : 'border-gray-100'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    {notice.is_important && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                        <Pin size={12} />
                        IMPORTANT
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900">{notice.title}</h3>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(notice.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">{notice.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Notice</h2>
              
              {submitError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{submitError}</div>}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    {...register('title')} 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand focus:outline-none"
                    placeholder="E.g., Water Supply Maintenance"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea 
                    {...register('content')} 
                    rows={5}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand focus:outline-none resize-none"
                    placeholder="Notice details..."
                  ></textarea>
                  {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message as string}</p>}
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="is_important"
                    {...register('is_important')}
                    className="w-4 h-4 text-brand rounded focus:ring-brand"
                  />
                  <label htmlFor="is_important" className="text-sm font-medium text-gray-700">
                    Mark as Important (pins to top)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => { setShowModal(false); reset(); }}
                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-brand text-white font-medium rounded-lg hover:bg-brand-dark transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Notice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
