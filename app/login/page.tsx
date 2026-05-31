'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

import { useAuthStore } from '@/store/authStore';

// Replace with your images
import slideOne from '@/app/assest/slideOne.avif';
import slideTwo from '@/app/assest/slideTwo.avif';

const slides = [
  {
    id: 1,
    image: slideOne,
    title: 'Secure. Fast. Reliable.',
    description:
      'Access your RIN account securely and manage everything from one powerful dashboard.',
  },
  {
    id: 2,
    image: slideTwo,
    title: 'Built For Modern Business',
    description:
      'A premium platform designed for performance, scalability and simplicity.',
  },
];

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

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
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await axios.post(
        'http://localhost:51000/api/v1/auth/login',
        data
      );

      if (response.data.success) {
        setAuth(response.data.token, response.data.user);

        toast.success(
          `Welcome back, ${response.data.user.name}!`
        );

        router.push('/');
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          'Invalid login credentials'
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">

      {/* ================= LEFT SLIDER ================= */}
      <div
        className="hidden lg:block relative w-[65%] h-screen overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <Image
              src={slides[currentSlide].image}
              alt="Background"
              fill
              priority
              className="object-cover"
            />

            <div className="absolute inset-0 bg-black/50" />
          </motion.div>
        </AnimatePresence>

        {/* Logo */}
        <div className="absolute top-10 left-10 z-30">
          <h1 className="text-white text-3xl font-black tracking-tight">
            RIN
          </h1>
        </div>

        {/* Content */}
        <motion.div
          key={slides[currentSlide].id}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute bottom-12 left-12 max-w-xl z-20"
        >
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-[2rem] p-10">
            <h2 className="text-white text-5xl font-bold leading-tight mb-5">
              {slides[currentSlide].title}
            </h2>

            <p className="text-zinc-300 text-lg leading-relaxed">
              {slides[currentSlide].description}
            </p>
          </div>
        </motion.div>
      </div>

      {/* ================= RIGHT LOGIN ================= */}
      <div className="w-full lg:w-[35%] flex items-center justify-center p-6 md:p-10 bg-white">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-white text-4xl font-black">
              RIN
            </h1>
          </div>

          <div className="bg-white border border-white/5 rounded-[2rem] p-8 md:p-10">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <ShieldCheck className="text-white" size={22} />
              </div>

              <div>
                <h2 className="text-white text-2xl font-bold">
                  Welcome Back
                </h2>

                <p className="text-zinc-500 text-sm">
                  Sign in to continue
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label className="text-xs uppercase tracking-widest text-zinc-500 mb-2 block">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-4 text-zinc-500"
                  />

                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-[#0f110d] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-white/20 transition"
                  />
                </div>

                {errors.email && (
                  <p className="text-red-400 text-xs mt-2">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-xs uppercase tracking-widest text-zinc-500 mb-2 block">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-4 text-zinc-500"
                  />

                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-[#0f110d] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-white/20 transition"
                  />
                </div>

                {errors.password && (
                  <p className="text-red-400 text-xs mt-2">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-zinc-400 hover:text-white transition"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer bg-[#fdfcf5] py-4 px-6 rounded-2xl flex items-center justify-between group mt-2"
              >
                <span className="text-[#111] font-bold uppercase tracking-wide text-sm">
                  {isSubmitting
                    ? 'Authenticating...'
                    : 'Sign In'}
                </span>

                {!isSubmitting && (
                  <div className="bg-black/5 p-2 rounded-xl">
                    <ArrowRight
                      size={18}
                      className="text-black"
                    />
                  </div>
                )}
              </button>
            </form>

            {/* Register */}
            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-zinc-500 text-sm">
                Don't have an account?
              </p>

              <Link
                href="/register"
                className="inline-block mt-3 text-white hover:text-zinc-300 transition font-medium"
              >
                Create New Account
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-zinc-600 text-xs">
              © 2026 RIN. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}