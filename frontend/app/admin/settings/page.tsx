'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api, getErrorMessage } from '@/lib/api';
import { Settings, Save, Clock } from 'lucide-react';

export default function AdminSettings() {
  const [overdueDays, setOverdueDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/admin/settings');
        setOverdueDays(res.data.overdue_days);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await api.patch('/api/admin/settings', { overdue_days: Number(overdueDays) });
      setMessage('Settings updated successfully.');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to update settings'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout roleRequired="ADMIN"><div className="p-8 text-center">Loading settings...</div></DashboardLayout>;

  return (
    <DashboardLayout roleRequired="ADMIN">
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand/10 rounded-xl text-brand">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-500 mt-1">Configure global application parameters</p>
          </div>
        </div>

        {/* SLA Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Service Level Agreements (SLA)</h2>
          
          {message && <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm font-medium">{message}</div>}
          {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm font-medium">{error}</div>}
          
          <div className="max-w-md space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <Clock size={16} className="text-gray-500" />
                Overdue Threshold (Days)
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Complaints unresolved beyond this number of days will be flagged as overdue.
              </p>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  min="1" 
                  max="365" 
                  value={overdueDays}
                  onChange={(e) => setOverdueDays(parseInt(e.target.value) || 1)}
                  className="w-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand focus:outline-none text-lg text-center font-medium"
                />
                <span className="text-gray-500 font-medium">days</span>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-brand text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-brand-dark transition shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
