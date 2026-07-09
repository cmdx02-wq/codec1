'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, ShieldAlert, Loader } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

function PaymentSimulationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const { showToast } = useToast();

  const [orderId, setOrderId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderDetail, setOrderDetail] = useState<any>(null);

  useEffect(() => {
    const oId = searchParams?.get('orderId');
    const sId = searchParams?.get('sessionId');
    setOrderId(oId);
    setSessionId(sId);
  }, [searchParams]);

  const handleCompletePayment = async () => {
    if (!orderId) return;
    setLoading(true);

    try {
      const res = await api.post('/payments/simulate-complete', { orderId });
      showToast(res.message || 'Payment simulated successfully!', 'success');
      await refreshUser();
      router.push('/dashboard?tab=courses');
    } catch (err: any) {
      showToast(err.message || 'Payment verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg glass-card rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-xl"
      >
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Secure Gateway Integration</h1>
            <p className="text-xs text-slate-500">Developer Simulation Interface</p>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 rounded-2xl p-4 flex gap-3 mb-6">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">
            <strong>Simulation Mode Triggered:</strong> You are seeing this page because no live Stripe/Razorpay keys are configured. This lets you inspect checkout actions, check callback validation, and unlock products for testing.
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-sm py-1 border-b border-slate-100 dark:border-slate-800/50">
            <span className="text-slate-500">Order ID:</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 select-all">{orderId || 'N/A'}</span>
          </div>
          {sessionId && (
            <div className="flex justify-between text-sm py-1 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-slate-500">Stripe Session:</span>
              <span className="font-mono font-semibold text-slate-850 dark:text-slate-350">{sessionId}</span>
            </div>
          )}
          <div className="flex justify-between text-sm py-1">
            <span className="text-slate-500">Checkout Provider:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Stripe Sandbox / Razorpay</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/')}
            className="border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-3 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer text-center"
          >
            Cancel Order
          </button>
          <button
            onClick={handleCompletePayment}
            disabled={loading}
            className="btn-primary-grad py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Authorize Payment
          </button>
        </div>
      </motion.div>
    </main>
  );
}

export default function PaymentSimulationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <PaymentSimulationContent />
    </Suspense>
  );
}
