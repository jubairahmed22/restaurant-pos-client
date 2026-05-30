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
      const response = await axios.post(
        'http://localhost:51000/api/v1/auth/register',
        {
          ...data,
          role: 'customer',
        }
      );

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
    <div className="min-h-screen flex bg-[#0a0a0a] overflow-hidden">

      {/* LEFT SIDE SLIDER */}
      <div
        className="hidden lg:block relative w-[60%] h-screen overflow-hidden"
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

      {/* RIGHT SIDE REGISTER FORM */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-5 md:p-8 overflow-y-auto">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-white text-4xl font-black">
              RIN
            </h1>
          </div>

          <div className="bg-[#161813] border border-white/5 rounded-[2rem] p-6 md:p-8">

            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <ShieldCheck
                  className="text-white"
                  size={22}
                />
              </div>

              <div>
                <h2 className="text-white text-2xl font-bold">
                  Create Account
                </h2>

                <p className="text-zinc-500 text-sm">
                  Join the RIN platform
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Name */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
                  Full Name
                </label>

                <div className="relative">
                  <User
                    className="absolute left-4 top-4 text-zinc-500"
                    size={18}
                  />

                  <input
                    type="text"
                    {...register('name')}
                    placeholder="John Doe"
                    className="w-full bg-[#0f110d] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-white/20 transition"
                  />
                </div>

                {errors.name && (
                  <p className="text-red-400 text-xs mt-2">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    className="absolute left-4 top-4 text-zinc-500"
                    size={18}
                  />

                  <input
                    type="email"
                    {...register('email')}
                    placeholder="john@example.com"
                    className="w-full bg-[#0f110d] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-white/20 transition"
                  />
                </div>

                {errors.email && (
                  <p className="text-red-400 text-xs mt-2">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
                    className="absolute left-4 top-4 text-zinc-500"
                    size={18}
                  />

                  <input
                    type="text"
                    {...register('phone')}
                    placeholder="+8801XXXXXXXXX"
                    className="w-full bg-[#0f110d] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-white/20 transition"
                  />
                </div>

                {errors.phone && (
                  <p className="text-red-400 text-xs mt-2">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
                  Address
                </label>

                <div className="relative">
                  <MapPin
                    className="absolute left-4 top-4 text-zinc-500"
                    size={18}
                  />

                  <input
                    type="text"
                    {...register('address')}
                    placeholder="Dhaka, Bangladesh"
                    className="w-full bg-[#0f110d] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-white/20 transition"
                  />
                </div>

                {errors.address && (
                  <p className="text-red-400 text-xs mt-2">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    className="absolute left-4 top-4 text-zinc-500"
                    size={18}
                  />

                  <input
                    type="password"
                    {...register('password')}
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer bg-[#fdfcf5] py-4 px-6 rounded-2xl flex items-center justify-between group mt-6"
              >
                <span className="text-[#111] font-bold uppercase tracking-wide text-sm">
                  {isSubmitting
                    ? 'Creating Account...'
                    : 'Create Account'}
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

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-zinc-500 text-sm">
                Already have an account?
              </p>

              <Link
                href="/login"
                className="inline-block mt-3 text-white hover:text-zinc-300 transition font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-zinc-600 text-xs">
              © 2026 RIN. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}