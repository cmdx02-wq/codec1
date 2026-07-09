'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader, Info, HelpCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ContactPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        message,
        userId: user?.id || undefined,
      };

      const res = await api.post('/marketing/contact', payload);
      showToast(res.message || 'Message submitted successfully!', 'success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit contact message', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Get in Touch with Our Team
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Have questions about our course syllabus? Interested in hiring our team for custom AI chatbot developments? Fill out the form, and our integration specialists will get back to you within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-5xl mx-auto">
            {/* Contact Details Card */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              <div className="bg-slate-900 text-slate-100 rounded-3xl p-8 space-y-8 flex-1 relative overflow-hidden">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/20 blur-[80px] rounded-full pointer-events-none" />

                <div>
                  <h3 className="text-lg font-bold mb-2">Contact Information</h3>
                  <p className="text-xs text-slate-400">Reach out directly via mail or visit our head office.</p>
                </div>

                <div className="space-y-6 text-xs">
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-350">General Support</h4>
                      <p className="text-slate-400 mt-1">support@ailaunchpad.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-350">Business Call Line</h4>
                      <p className="text-slate-400 mt-1">+1 (800) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-350">Headquarters</h4>
                      <p className="text-slate-400 mt-1">100 Pine Street, Suite 1250<br />San Francisco, CA 94111</p>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-6 mt-12 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  Office hours: Mon - Fri, 9:00 AM - 5:00 PM PST.
                </div>
              </div>

              {/* Styled Mock Headquarters Map visualizer */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-4 shadow-sm h-48 relative overflow-hidden flex flex-col justify-end">
                {/* Styled grids simulating map contours */}
                <div className="absolute inset-0 bg-slate-100 dark:bg-slate-950 opacity-50 flex flex-wrap gap-2 pointer-events-none">
                  {Array.from({ length: 48 }).map((_, idx) => (
                    <div key={idx} className="w-10 h-10 border border-slate-200/20 dark:border-slate-800/25 rounded-md" />
                  ))}
                  {/* Road simulation line */}
                  <div className="absolute top-[40%] left-0 right-0 h-4 bg-slate-200/40 dark:bg-slate-900/60 rotate-[-12deg]" />
                  <div className="absolute top-0 bottom-0 left-[50%] w-4 bg-slate-200/40 dark:bg-slate-900/60 rotate-[20deg]" />
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center animate-ping" />
                  <div className="absolute w-5 h-5 rounded-full bg-blue-600 border border-white flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-[10px] font-bold text-slate-800 dark:text-slate-200">
                  Pine St HQ, San Francisco
                </div>
              </div>
            </div>

            {/* Contact Form Card */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 shadow-sm">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-6">Send an Inquiry</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Message Details
                  </label>
                  <textarea
                    placeholder="Write message details..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary-grad py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
