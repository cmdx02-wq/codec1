'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Filter, Loader, BookOpen, Clock, Tag, X, GraduationCap, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  isFree: boolean;
  difficulty: string;
  duration: string;
  modules: any;
}

export default function CoursesPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');

  // Booking Modal State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [provider, setProvider] = useState<'STRIPE' | 'RAZORPAY'>('STRIPE');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (difficulty !== 'All') queryParams.append('difficulty', difficulty);

        const data = await api.get(`/courses?${queryParams.toString()}`);
        setCourses(data);
      } catch (err) {
        showToast('Failed to load courses. Using default placeholders.', 'warning');
        // Fallback local mockup
        setCourses([
          {
            id: 'c-1',
            title: 'AI Freelancing Blueprint',
            description: 'The complete step-by-step framework to launch an active online business using AI systems.',
            thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
            price: 199,
            isFree: false,
            difficulty: 'Beginner',
            duration: '8 Hours',
            modules: [],
          },
          {
            id: 'c-2',
            title: 'Advanced AI Automations with Make & Zapier',
            description: 'Master workflow automation, API connecting, logical loops, and database queries.',
            thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
            price: 299,
            isFree: false,
            difficulty: 'Advanced',
            duration: '12 Hours',
            modules: [],
          },
          {
            id: 'c-3',
            title: 'Introduction to Prompt Engineering',
            description: 'Learn the fundamentals of structuring prompts, few-shot prompts, and chain-of-thought.',
            thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
            price: 0,
            isFree: true,
            difficulty: 'Beginner',
            duration: '2 Hours',
            modules: [],
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadCourses();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, difficulty, showToast]);

  const handleEnroll = (course: Course) => {
    if (!user) {
      showToast('Please login to enroll in courses!', 'info');
      router.push('/login');
      return;
    }

    if (course.isFree || course.price === 0) {
      handleFreeEnrollment(course.id);
    } else {
      setSelectedCourse(course);
      setCouponApplied(false);
      setCouponCode('');
    }
  };

  const handleFreeEnrollment = async (courseId: string) => {
    try {
      const data = await api.post('/payments/checkout', {
        courseId,
        provider: 'FREE',
      });
      if (data.success) {
        showToast('Enrolled successfully! Redirecting to dashboard...', 'success');
        await refreshUser();
        router.push('/dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Enrollment failed', 'error');
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode === 'LAUNCH50') {
      setCouponApplied(true);
      showToast('Coupon code applied! 50% discount registered.', 'success');
    } else {
      showToast('Invalid coupon code.', 'error');
    }
  };

  const handleCheckoutSubmit = async () => {
    if (!selectedCourse) return;
    setCheckoutLoading(true);

    try {
      const data = await api.post('/payments/checkout', {
        courseId: selectedCourse.id,
        provider,
        couponCode: couponApplied ? 'LAUNCH50' : undefined,
      });

      setSelectedCourse(null);

      if (data.checkoutUrl) {
        router.push(data.checkoutUrl);
      } else if (data.success && data.mock) {
        showToast('Course enrolled! View it in your dashboard.', 'success');
        router.push('/dashboard');
      } else if (data.razorpayOrderId) {
        router.push(`/payment-simulation?orderId=${data.orderId}`);
      }
    } catch (err: any) {
      showToast(err.message || 'Checkout failed', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getPrice = (original: number) => {
    if (couponApplied) {
      return original * 0.5;
    }
    return original;
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <GraduationCap className="w-9 h-9 text-blue-600 animate-bounce" />
              Syllabus Tracks & Materials
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto">
              Unlock hands-on classes mapping detailed instructions, code frameworks, and proposal systems to start freelancing.
            </p>
          </div>

          {/* Search and Filters Bar */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-850 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
              {['All', 'Beginner', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    difficulty === lvl
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800 bg-white/55 dark:bg-slate-900/55 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Catalog list */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <AlertCircle className="w-10 h-10 text-slate-300" />
              <p className="text-xs">No courses found matching criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
                >
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {course.duration}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-2 py-0.5 rounded-lg text-xs font-black text-slate-900 dark:text-white shadow-sm">
                      {course.price === 0 ? 'FREE' : `$${course.price}`}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1 gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider rounded uppercase bg-blue-100/50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          {course.difficulty}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{course.description}</p>
                    </div>

                    <button
                      onClick={() => handleEnroll(course)}
                      className="w-full mt-auto btn-primary-grad py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      {course.price === 0 ? 'Enroll Free' : 'Purchase Course'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Checkout Drawer Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCourse(null)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed inset-x-4 top-[15%] md:left-[35%] md:right-[35%] z-[60] bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Confirm Checkout</h3>
                <button onClick={() => setSelectedCourse(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                  <img src={selectedCourse.thumbnail} className="w-12 h-12 object-cover rounded-lg" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{selectedCourse.title}</h4>
                    <span className="text-[10px] text-slate-400">Duration: {selectedCourse.duration}</span>
                  </div>
                </div>

                {/* Gateway */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setProvider('STRIPE')}
                      className={`py-2 text-xs font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                        provider === 'STRIPE'
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      Stripe (USD)
                    </button>
                    <button
                      onClick={() => setProvider('RAZORPAY')}
                      className={`py-2 text-xs font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                        provider === 'RAZORPAY'
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      Razorpay (INR)
                    </button>
                  </div>
                </div>

                {/* Coupon input */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Discount Coupon</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. LAUNCH50"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={couponApplied}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-850 dark:text-slate-100 uppercase focus:outline-none"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponApplied || !couponCode}
                      className="border border-slate-200 dark:border-slate-800 px-3 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0 disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="text-[10px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Coupon code &ldquo;LAUNCH50&rdquo; applied: 50% discount!
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
                  <span>Grand Total:</span>
                  <div className="flex items-center gap-1.5">
                    {couponApplied && <span className="line-through text-slate-400 text-xs">${selectedCourse.price}</span>}
                    <span>${getPrice(selectedCourse.price)}</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleCheckoutSubmit}
                  disabled={checkoutLoading}
                  className="w-full btn-primary-grad py-2.5 rounded-xl text-xs font-semibold flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {checkoutLoading ? <Loader className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
                  Confirm Enrollment Checkout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
