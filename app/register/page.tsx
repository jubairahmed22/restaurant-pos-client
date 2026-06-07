'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/services/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

import { useAuthStore } from '@/store/authStore';

// Replace with your own images
import slideOne from '@/app/assest/slideOne.avif';
import slideTwo from '@/app/assest/slideTwo.avif';

const slides = [
  {
    id: 1,
    image: slideOne,
    title: 'Create Your Digital Identity',
    description:
      'Join RIN and unlock a premium experience built for modern users.',
  },
  {
    id: 2,
    image: slideTwo,
    title: 'Simple. Secure. Powerful.',
    description:
      'Manage your account, orders, and activities from one elegant platform.',
  },
];

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email target'),
  password: z.string().min(
    6,
    'Security password must match 6 characters limit'
  ),
  phone: z.string().min(
    10,
    'Provide absolute primary routing cell identifier'
  ),
  address: z.string().min(
    5,
    'Detailed billing address description needed'
  ),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(nextSlide, 5000);

    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await api.post('/auth/register', { ...data, role: 'customer' });

      if (response.data.success) {
        setAuth(response.data.token, response.data.user);
        toast.success('Account creation complete!');
        router.push('/');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          'Registration processing rejected.'
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden font-sans selection:bg-[#1B3A6B]/10">

      {/* LEFT SIDE SLIDER */}
      <div
        className="hidden lg:block relative w-[60%] h-screen overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <Image
              src={slides[currentSlide].image}
              alt="Background"
              fill
              priority
              className="object-cover"
            />
            {/* Premium Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1B3A6B]/40 to-slate-900/20" />
          </motion.div>
        </AnimatePresence>

        {/* Logo */}
        <div className="absolute top-10 left-10 z-30">
          <h1 className="text-white text-3xl font-black tracking-tighter uppercase">
            RIN
          </h1>
        </div>

        {/* Content Overlay Card */}
        <motion.div
          key={slides[currentSlide].id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute bottom-12 left-12 max-w-xl z-20"
        >
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-10 shadow-2xl shadow-black/10">
            <h2 className="text-[#1B3A6B] text-5xl font-serif italic leading-tight mb-5">
              {slides[currentSlide].title}
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              {slides[currentSlide].description}
            </p>
          </div>
        </motion.div>
      </div>

      {/* RIGHT SIDE REGISTER FORM */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-5 md:p-8 overflow-y-auto bg-white border-l border-slate-100">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg my-auto"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-[#1B3A6B] text-4xl font-black tracking-tighter">
              RIN
            </h1>
          </div>

          <div className="bg-white rounded-[2.5rem] p-2">

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                <ShieldCheck className="text-[#1B3A6B]" size={26} />
              </div>
              <div>
                <h2 className="text-[#1B3A6B] text-3xl font-serif italic">
                  Create Account
                </h2>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                  Join the RIN platform
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1B3A6B] transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-[#1B3A6B] font-medium outline-none focus:border-[#1B3A6B] focus:bg-white transition-all shadow-sm"
                  />
                </div>
                {errors.name && (
                  <p className="text-rose-500 text-xs font-bold mt-1 ml-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1B3A6B] transition-colors"
                    size={18}
                  />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="john@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-[#1B3A6B] font-medium outline-none focus:border-[#1B3A6B] focus:bg-white transition-all shadow-sm"
                  />
                </div>
                {errors.email && (
                  <p className="text-rose-500 text-xs font-bold mt-1 ml-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">
                  Phone Number
                </label>
                <div className="relative group">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1B3A6B] transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    {...register('phone')}
                    placeholder="+8801XXXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-[#1B3A6B] font-medium outline-none focus:border-[#1B3A6B] focus:bg-white transition-all shadow-sm"
                  />
                </div>
                {errors.phone && (
                  <p className="text-rose-500 text-xs font-bold mt-1 ml-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">
                  Address
                </label>
                <div className="relative group">
                  <MapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1B3A6B] transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    {...register('address')}
                    placeholder="Dhaka, Bangladesh"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-[#1B3A6B] font-medium outline-none focus:border-[#1B3A6B] focus:bg-white transition-all shadow-sm"
                  />
                </div>
                {errors.address && (
                  <p className="text-rose-500 text-xs font-bold mt-1 ml-1">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1B3A6B] transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-[#1B3A6B] font-medium outline-none focus:border-[#1B3A6B] focus:bg-white transition-all shadow-sm"
                  />
                </div>
                {errors.password && (
                  <p className="text-rose-500 text-xs font-bold mt-1 ml-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer bg-[#1B3A6B] py-4.5 px-6 rounded-2xl flex items-center justify-between group mt-6 shadow-lg shadow-[#1B3A6B]/10 hover:bg-[#1B3A6B]/90 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <span className="text-white font-bold uppercase tracking-[0.2em] text-xs">
                  {isSubmitting
                    ? 'Creating Account...'
                    : 'Create Account'}
                </span>

                {!isSubmitting && (
                  <div className="bg-white/10 p-2 rounded-xl group-hover:translate-x-1 transition-transform">
                    <ArrowRight
                      size={18}
                      className="text-white"
                    />
                  </div>
                )}
              </button>
            </form>

            {/* Login Navigation Redirection */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-sm font-medium">
                Already have an account?
              </p>
              <Link
                href="/login"
                className="inline-block mt-3 text-[#1B3A6B] hover:text-[#1B3A6B]/80 transition font-bold uppercase tracking-widest text-xs underline underline-offset-4 decoration-[#1B3A6B]/20"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Footer Metadata context */}
          <div className="text-center mt-8">
            <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">
              © 2026 RIN Systems. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}