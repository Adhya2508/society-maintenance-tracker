'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, getErrorMessage } from '@/lib/api';
import { setToken } from '@/lib/auth';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const [error, setError] = useState('');
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      setError('');
      const res = await api.post('/api/auth/login', data);
      setToken(res.data.access_token);
      
      const meRes = await api.get('/api/auth/me');
      if (meRes.data.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Login failed. Please check your credentials.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-brand mb-8">Sign In</h2>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              {...register('email')} 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand focus:outline-none"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password"
              {...register('password')} 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand focus:outline-none"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg transition"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link href="/register" className="text-brand font-semibold hover:underline">Register here</Link>
        </p>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-2">Demo Credentials (seeded)</p>
          <div className="flex justify-between text-xs text-gray-600 bg-gray-50 p-3 rounded">
            <div>
              <span className="font-semibold block">Admin</span>
              admin@society.com<br/>DemoAdmin123!
            </div>
            <div>
              <span className="font-semibold block">Resident</span>
              ravi@society.com<br/>DemoResident123!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
