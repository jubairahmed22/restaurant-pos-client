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
import { User, Mail, Lock, Phone, MapPin } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email target'),
  password: z.string().min(6, 'Security password must match 6 characters limit'),
  phone: z.string().min(10, 'Provide absolute primary routing cell identifier'),
  address: z.string().min(5, 'Detailed billing address description needed'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await axios.post('http://localhost:51000/api/v1/auth/register', {
        ...data,
        role: 'customer' // Enforce safe root registration level parameters
      });
      if (response.data.success) {
        setAuth(response.data.token, response.data.user);
        toast.success("Account creation complete!");
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration processing rejected.');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      <div className="flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-500 text-sm mb-8">Get access to custom rewards and quick tracking pipelines.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                <input type="text" {...register('name')} className="w-full pl-12 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none" placeholder="John Doe" />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                <input type="email" {...register('email')} className="w-full pl-12 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none" placeholder="john@example.com" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                <input type="text" {...register('phone')} className="w-full pl-12 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none" placeholder="5550192834" />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Delivery Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                <input type="text" {...register('address')} className="w-full pl-12 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none" placeholder="123 Main St, New York" />
              </div>
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Choose Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                <input type="password" {...register('password')} className="w-full pl-12 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none" placeholder="••••••••" />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition mt-4 shadow-md"
            >
              {isSubmitting ? 'Creating profile tracking index...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>

      <div className="hidden md:flex bg-gradient-to-bl from-amber-500 to-orange-600 p-12 flex-col justify-between text-white order-first md:order-last">
        <span className="text-xl font-black tracking-tight">GOURMET KITCHEN</span>
        <div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">Join our premium dining community today.</h2>
          <p className="text-amber-50">Safe payment processing, real-time tracking, and verified chef recipes.</p>
        </div>
        <p className="text-xs text-amber-200/60">© 2026 Gourmet Kitchen Platform Layer.</p>
      </div>
    </div>
  );
}