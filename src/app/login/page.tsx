'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Rocket, Mail, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, sendOtp, verifyOtp, loginWithGoogle } = useAuth();

  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      // Toast handles error display
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await sendOtp(email);
      setOtpSent(true);
    } catch (err) {
      // Toast handles error
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otpCode) return;

    setLoading(true);
    try {
      await verifyOtp(email, otpCode);
      router.push('/dashboard');
    } catch (err) {
      // Toast handles error
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSimulate = async () => {
    setLoading(true);
    try {
      // Mock Google Profile Info
      const mockEmail = 'google-user@ailaunchpad.com';
      const mockName = 'Google Scholar';
      const mockAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80';
      const mockGoogleId = `g_id_${Date.now()}`;

      await loginWithGoogle(mockEmail, mockName, mockAvatar, mockGoogleId);
      router.push('/dashboard');
    } catch (err) {
      // Toast handles error
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden py-12">
      {/* Dynamic Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px] dark:bg-blue-900/10 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/10 blur-[120px] dark:bg-indigo-900/10 pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 shadow-xl border border-slate-200/50 dark:border-slate-800/50 relative z-10"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 group mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Rocket className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI LaunchPad
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">
            Access your courses, dashboard, and service invoices.
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setAuthMode('password'); setOtpSent(false); }}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              authMode === 'password'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setAuthMode('otp')}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              authMode === 'otp'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Email OTP
          </button>
        </div>

        {/* Auth form */}
        {authMode === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary-grad py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              Sign In with Password
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary-grad py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  Request OTP Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/50 rounded-xl p-3.5 flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs font-medium text-blue-800 dark:text-blue-200">
                    We sent a 6-digit verification code to **{email}**. Please enter it below. (Check your backend console for the OTP value)
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-center text-lg font-bold tracking-widest text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center text-slate-700 dark:text-slate-300"
                  >
                    Change Email
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary-grad py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    Verify & Login
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
              Or Connect With
            </span>
          </div>
        </div>

        {/* Google OAuth Simulation Button */}
        <button
          onClick={handleGoogleSimulate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.69c-.29 1.5-.14 3.01-1.03 4.02v3.3h6.3c3.67-3.38 5.78-8.36 5.78-14.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-6.3-3.3c-1.8.84-3.87.97-5.66.42a8.88 8.88 0 0 1-5.17-5.18H1.36v3.42C3.42 20.65 7.45 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M6.57 14.65c-.41-1.22-.41-2.54 0-3.76V7.47H1.36a11.96 11.96 0 0 0 0 9.07l5.21-3.77z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77-.03 3.47.64 4.74 1.85l3.52-3.52A11.9 11.9 0 0 0 12 0C7.45 0 3.42 3.35 1.36 7.47l5.21 3.77A8.93 8.93 0 0 1 12 4.75z"
            />
          </svg>
          Simulate Google Login
        </button>

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs">
          <span className="text-slate-500 dark:text-slate-400">Don&apos;t have an account yet? </span>
          <Link href="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Sign Up
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
