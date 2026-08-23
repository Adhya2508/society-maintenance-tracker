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
          router.push(res.data.role === 'ADMIN' ? '/admin' : '/dashboard');
        } else {
          setAuthorized(true);
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [roleRequired]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand">Loading...</div>;
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
