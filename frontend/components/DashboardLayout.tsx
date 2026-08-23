import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children, roleRequired }: { children: React.ReactNode, roleRequired: 'RESIDENT' | 'ADMIN' }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/api/auth/me');
        if (res.data.role !== roleRequired) {
          // Wrong role — redirect to correct portal, replace so back-button doesn't loop
          router.replace(res.data.role === 'ADMIN' ? '/admin' : '/dashboard');
        } else {
          setAuthorized(true);
        }
      } catch {
        // 401 / network error — silently redirect to login
        // Using replace so back-button won't return to this protected page
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [roleRequired]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Verifying access…</p>
      </div>
    </div>
  );
  if (!authorized) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={roleRequired} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
