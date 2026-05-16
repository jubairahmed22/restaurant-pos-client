'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please supply a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await axios.post('http://localhost:51000/api/v1/auth/login', data);
      if (response.data.success) {
        setAuth(response.data.token, response.data.user);
        toast.success(`Welcome back, ${response.data.user.name}!`);
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid authentication credentials');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      <div className="hidden md:flex bg-gradient-to-br from-orange-500 to-amber-600 p-12 flex-col justify-between text-white">
        <span className="text-xl font-black tracking-tight">GOURMET KITCHEN</span>
        <div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">Access premium culinary choices instantly.</h2>
          <p className="text-orange-100">Log into your dashboard tracking portfolio ecosystem.</p>
        </div>
        <p className="text-xs text-orange-200/60">© 2026 Gourmet Kitchen Platform Layer.</p>
      </div>

      <div className="flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-500 text-sm mb-8">Enter your profile access keys below to authenticate.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  {...register('email')}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm"
                  placeholder="name@domain.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  {...register('password')}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-200 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md mt-4"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            Don't have an active user account?{' '}
            <Link href="/register" className="text-orange-600 font-bold hover:underline">Register Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}