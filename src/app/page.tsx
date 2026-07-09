'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Rocket,
  ArrowRight,
  Play,
  CheckCircle,
  Users,
  Cpu,
  Zap,
  DollarSign,
  ChevronDown,
  Sparkles,
  Award
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-blue-600" />,
      title: 'Make.com Workflow Automation',
      desc: 'Connect databases, CRMs, and email pipes to AI pipelines to save hours of manual typing.',
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      title: 'Custom GPT Chatbots Integration',
      desc: 'Deploy custom-trained, lead-generating chat assistants connected directly to local databases.',
    },
    {
      icon: <Award className="w-6 h-6 text-blue-600" />,
      title: 'ATS-Friendly Resume Rebuilds',
      desc: 'Reframe your experience into high-ticket freelance pitches optimized for search algorithms.',
    },
    {
      icon: <DollarSign className="w-6 h-6 text-blue-600" />,
      title: 'High-Ticket Client Acquisition',
      desc: 'Acquire recurring corporate clients through cold outreach, Upwork proposals, and portfolios.',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Choose Your Skill Track',
      desc: 'Select from workflow integrations, chatbot development, web speedruns, or optimization tracks.',
    },
    {
      step: '02',
      title: 'Build Live Portfolios',
      desc: 'Deliver concrete sandbox tools and custom apps using our visual builder toolkits.',
    },
    {
      step: '03',
      title: 'Pitch & Land Clients',
      desc: 'Deploy high-converting contract templates, onboarding forms, and proposal frameworks.',
    },
  ];

  const testimonials = [
    {
      quote: "AI LaunchPad completely changed my career path. In under 2 weeks, I learned to sell automated email responders to local businesses. I landed my first $1,200 monthly retainer within 10 days of completing the course!",
      author: "Sarah Jenkins",
      role: "AI Automation Freelancer",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    },
    {
      quote: "The resume optimizer and portfolio builder helped me turn simple prompt ideas into client-facing deliverables. The certificate gave local agency owners the trust they needed to outsource chatbot setup to me.",
      author: "Marcus Chen",
      role: "Lead Chatbot Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    },
  ];

  const faqs = [
    {
      q: "Do I need coding experience to succeed?",
      a: "No! AI LaunchPad is designed for beginners. We focus heavily on no-code automation platforms like Make.com, visual chatbot builders, and using LLM prompts to construct applications.",
    },
    {
      q: "How does the 14-day career launch work?",
      a: "Our syllabus is structured to give you one core skill, one live portfolio demo, and your outreach pipeline set up by day 14. If you follow the daily milestones, you'll be actively bidding on gigs.",
    },
    {
      q: "How does the simulated payment checkout work?",
      a: "When purchasing services or premium courses, you can choose Stripe or Razorpay. If no live tokens are configured, the checkout routes to a developer portal where you can click 'Authorize' to immediately unlock courses for testing.",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="pt-20 overflow-hidden">
        {/* HERO SECTION */}
        <section className="relative py-20 md:py-32 px-4 bg-slate-50 dark:bg-slate-950">
          {/* Animated Background Mesh */}
          <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20 pointer-events-none">
            <div className="absolute top-[10%] left-[20%] w-72 h-72 rounded-full bg-blue-400 blur-[80px]" />
            <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-indigo-400 blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto text-center relative z-10 space-y-8">
            {/* Sparkle Tagline */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/50 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Your AI Career in 14 Days</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] max-w-4xl mx-auto"
            >
              Start Earning Online Using the Power of{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                Artificial Intelligence
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
            >
              Master high-ticket AI freelancing, set up company automation networks, and sell chatbot systems. No prior coding required.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link href="/register" className="btn-primary-grad px-8 py-3.5 rounded-xl font-semibold flex items-center gap-2 w-full sm:w-auto text-center justify-center">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/courses" className="border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 px-8 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 w-full sm:w-auto text-slate-700 dark:text-slate-300 transition-colors">
                <Play className="w-4 h-4 fill-current text-blue-600" />
                Watch Demo
              </Link>
            </motion.div>

            {/* Trusted By Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="pt-16 space-y-4"
            >
              <p className="text-xs uppercase tracking-widest font-bold text-slate-400">Trusted by students & freelancers worldwide</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 dark:opacity-40">
                <span className="font-bold text-lg tracking-wider text-slate-600 dark:text-slate-300">STRIPE</span>
                <span className="font-bold text-lg tracking-wider text-slate-600 dark:text-slate-300">LINEAR</span>
                <span className="font-bold text-lg tracking-wider text-slate-600 dark:text-slate-300">VERCEL</span>
                <span className="font-bold text-lg tracking-wider text-slate-600 dark:text-slate-300">NOTION</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES SHOWCASE */}
        <section className="py-20 px-4 bg-white dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800/60">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Learn to Sell High-Demand AI Gigs</h2>
              <p className="text-slate-500 max-w-xl mx-auto">We focus exclusively on monetization. These four skills are driving thousands in monthly billing right now.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((f, idx) => (
                <div key={idx} className="glass-card p-6 rounded-2xl hover:border-blue-500/50 transition-colors duration-300 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">{f.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 px-4 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">How AI LaunchPad Works</h2>
              <p className="text-slate-500 max-w-xl mx-auto">Our structured program goes from skill setup to proposal dispatching.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              {workflowSteps.map((w, idx) => (
                <div key={idx} className="relative bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col gap-4">
                  <div className="text-5xl font-black text-blue-100 dark:text-blue-950/60 leading-none">{w.step}</div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{w.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 px-4 bg-white dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Student Success Stories</h2>
              <p className="text-slate-500 max-w-xl mx-auto">See how freelancers and students are monetizing these course toolsets.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((t, idx) => (
                <div key={idx} className="glass-card p-8 rounded-3xl flex flex-col gap-6">
                  <p className="text-sm italic leading-relaxed text-slate-600 dark:text-slate-300">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <img src={t.avatar} alt={t.author} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{t.author}</h4>
                      <p className="text-[10px] text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING PREVIEW */}
        <section className="py-20 px-4 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto text-center space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Simple, Affordable Pricing</h2>
              <p className="text-slate-500 max-w-xl mx-auto">Choose a plan that fits your career goals. Unlock life-time access to video materials and portfolio resources.</p>
            </div>

            <div className="max-w-sm mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white font-bold text-[9px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">Popular</div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">Professional</h3>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">$199</div>
              
              <ul className="text-left space-y-3 text-xs mb-8 text-slate-600 dark:text-slate-350">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  Lifetime access to 3 core courses
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  Custom resume optimization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  Simulated gateway sandbox checkout
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  Printable SVG certificates
                </li>
              </ul>

              <Link href="/pricing" className="w-full btn-primary-grad block py-3 rounded-xl text-xs font-semibold">
                View All Plans
              </Link>
            </div>
          </div>
        </section>

        {/* FAQS */}
        <section className="py-20 px-4 bg-white dark:bg-slate-900/50">
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
              <p className="text-slate-500">Everything you need to know about the platform.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                  </button>

                  {activeFaq === idx && (
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 text-xs leading-relaxed text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
