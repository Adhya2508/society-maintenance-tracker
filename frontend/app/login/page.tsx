'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, getErrorMessage } from '@/lib/api';
import { setToken } from '@/lib/auth';
import Link from 'next/link';
import { ShieldCheck, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const ROLES = [
  {
    key: 'ADMIN',
    label: 'Admin',
    subtitle: 'Society Management',
    icon: ShieldCheck,
    demoEmail: 'admin@society.com',
    demoPassword: 'DemoAdmin123!',
    accent: 'teal',
  },
  {
    key: 'RESIDENT',
    label: 'Resident',
    subtitle: 'My Dashboard',
    icon: User,
    demoEmail: 'ravi@society.com',
    demoPassword: 'DemoResident123!',
    accent: 'indigo',
  },
] as const;

export default function Login() {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'RESIDENT'>('RESIDENT');
  const router = useRouter();

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const handleRoleSelect = (role: 'ADMIN' | 'RESIDENT') => {
    setSelectedRole(role);
    setError('');
    const found = ROLES.find(r => r.key === role)!;
    setValue('email', found.demoEmail);
    setValue('password', found.demoPassword);
  };

  const onSubmit = async (data: any) => {
    try {
      setError('');
      const res = await api.post('/api/auth/login', data);
      setToken(res.data.access_token);
      const meRes = await api.get('/api/auth/me');
      router.replace(meRes.data.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Login failed. Please check your credentials.'));
    }
  };

  const activeRole = ROLES.find(r => r.key === selectedRole)!;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-600 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 -left-16 w-64 h-64 rounded-full border border-white" />
          <div className="absolute top-1/3 -left-8 w-96 h-96 rounded-full border border-white" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full border border-white" />
        </div>

        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-black text-sm">GH</span>
          </div>
          <div>
            <p className="text-white font-black text-lg">Greenview Heights</p>
            <p className="text-teal-200 text-xs tracking-widest uppercase">Premium Residences</p>
          </div>
        </Link>

        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Welcome back to<br />your community.
          </h2>
          <p className="text-teal-100 leading-relaxed">
            Manage complaints, read notices, and stay connected — all in one place.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[['420+', 'Families'], ['24/7', 'Support'], ['15 ac', 'Green Space']].map(([num, label]) => (
            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15">
              <p className="text-white font-black text-2xl">{num}</p>
              <p className="text-teal-200 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        {/* Back link (mobile) */}
        <div className="w-full max-w-md mb-6 lg:hidden">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft size={15} /> Back to home
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900">Sign In</h1>
            <p className="text-gray-500 mt-1.5 text-sm">Choose your role and enter your credentials.</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isActive = selectedRole === role.key;
              return (
                <button
                  key={role.key}
                  type="button"
                  id={`role-${role.key.toLowerCase()}`}
                  onClick={() => handleRoleSelect(role.key)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left cursor-pointer
                    ${isActive
                      ? 'border-teal-500 bg-teal-50 shadow-md shadow-teal-100'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                    ${isActive ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${isActive ? 'text-teal-700' : 'text-gray-700'}`}>{role.label}</p>
                    <p className={`text-xs ${isActive ? 'text-teal-500' : 'text-gray-400'}`}>{role.subtitle}</p>
                  </div>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <input
                {...register('email')}
                type="email"
                id="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message as string}</p>}
            </div>

            <button
              type="submit"
              id="submit-login"
              disabled={isSubmitting}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-md shadow-teal-200 flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                `Sign in as ${activeRole.label}`
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-teal-600 font-semibold hover:underline">Register here</Link>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
            <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">Demo credentials auto-filled</p>
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">{activeRole.demoEmail}</span>
              {' · '}
              <span className="font-mono">{activeRole.demoPassword}</span>
            </p>
          </div>
        </div>

        {/* Desktop back link */}
        <div className="hidden lg:block mt-8">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={14} /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
