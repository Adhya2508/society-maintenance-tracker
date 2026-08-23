import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ClipboardList, Bell, Settings, LogOut } from 'lucide-react';
import { clearToken } from '@/lib/auth';

export default function Sidebar({ role }: { role: 'RESIDENT' | 'ADMIN' }) {
  const router = useRouter();
  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  const navItems = role === 'ADMIN' ? [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Complaints', href: '/admin/complaints', icon: ClipboardList },
    { label: 'Notices', href: '/admin/notices', icon: Bell },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ] : [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'My Complaints', href: '/complaints', icon: ClipboardList },
    { label: 'Notices', href: '/notices', icon: Bell },
  ];

  return (
    <aside className="w-64 bg-brand-dark text-white min-h-screen flex flex-col shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight">SocietyConnect</h2>
        <p className="text-sm opacity-75 mt-1">{role} PORTAL</p>
      </div>
      <nav className="flex-1 px-4 mt-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-brand transition-colors text-sm font-medium">
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-brand transition-colors text-sm font-medium">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
