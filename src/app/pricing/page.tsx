'use client';

import React, { useState } from 'react';
import { Check, HelpCircle, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Starter',
      description: 'Get familiar with AI fundamentals and start pitching local gigs.',
      monthlyPrice: 29,
      yearlyPrice: 19,
      features: [
        'Access to Introduction to Prompt Engineering',
        'Basic Upwork & Fiverr proposal templates',
        'Simulated gateway testing access',
        'Standard email support',
      ],
      popular: false,
      ctaText: 'Start Learning',
      href: '/register',
    },
    {
      name: 'Professional',
      description: 'Our most popular track. Build full-stack automations and chatbots.',
      monthlyPrice: 199,
      yearlyPrice: 149,
      features: [
        'Access to ALL courses & blueprints',
        'Make.com workflow blueprints download',
        'Interactive AI Chat assistant training files',
        'ATS resume optimization & analysis dashboard',
        'SVG/PDF Certificate generation',
        'Priority Slack community access',
      ],
      popular: true,
      ctaText: 'Unlock Full Access',
      href: '/courses',
    },
    {
      name: 'Agency / Enterprise',
      description: 'Scale your business. Outsource development directly to our vetted team.',
      monthlyPrice: 499,
      yearlyPrice: 399,
      features: [
        'All Professional benefits included',
        '2 Custom chatbot setup requests per month',
        '1 Corporate website development package',
        'Direct 1-on-1 team consulting',
        '100% white-labeled client deliveries',
      ],
      popular: false,
      ctaText: 'Deploy Done-For-You',
      href: '/services',
    },
  ];

  const getPriceDisplay = (plan: typeof plans[0]) => {
    if (billingPeriod === 'yearly') {
      return {
        amount: plan.yearlyPrice,
        period: '/mo billed annually',
      };
    }
    return {
      amount: plan.monthlyPrice,
      period: '/mo',
    };
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Flexible Plans Built for Growth
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto">
              Choose the level of resources and tutoring you need. Scale your freelancing career with live code kits and dedicated automations support.
            </p>

            {/* Toggle Button */}
            <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm mt-6">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  billingPeriod === 'monthly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingPeriod === 'yearly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                Yearly Billing
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md">Save 25%</span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-8 max-w-6xl mx-auto">
            {plans.map((plan, idx) => {
              const display = getPriceDisplay(plan);

              return (
                <div
                  key={plan.name}
                  className={`bg-white dark:bg-slate-900 border rounded-3xl p-8 flex flex-col shadow-sm transition-all relative ${
                    plan.popular
                      ? 'border-blue-500 ring-2 ring-blue-500/20 scale-105 z-10 dark:bg-slate-900/90'
                      : 'border-slate-200/60 dark:border-slate-800'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-blue-600 text-white font-bold text-[9px] px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black text-slate-950 dark:text-white">${display.amount}</span>
                    <span className="text-xs text-slate-500">{display.period}</span>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-4 mb-8 text-xs text-slate-600 dark:text-slate-350 flex-1">
                    {plan.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center ${
                      plan.popular
                        ? 'btn-primary-grad'
                        : 'border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {plan.ctaText}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
