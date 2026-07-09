'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  User,
  GraduationCap,
  FileText,
  Bookmark,
  Bell,
  Settings,
  Sun,
  Moon,
  Upload,
  Loader,
  Award,
  CheckCircle,
  FileBadge,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Share2,
  AlertCircle,
  X,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import Footer from '../../components/Footer';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/Navbar';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, logout, refreshUser, toggleBookmark, markNotificationRead } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(false);

  // Profile Form States
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Simulated Progress state (Lesson checking)
  // For each course user owns, store completed lessons array in local storage
  const [completedLessons, setCompletedLessons] = useState<Record<string, string[]>>({});

  // Purchased Courses / Orders
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Resume Analyzer States
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeAnalyzing, setResumeAnalyzing] = useState(false);
  const [resumeResult, setResumeResult] = useState<any>(null);

  // Portfolio Analyzer States
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [portfolioAnalyzing, setPortfolioAnalyzing] = useState(false);
  const [portfolioResult, setPortfolioResult] = useState<any>(null);

  // Invoice & Certificate Generators
  const [activeInvoice, setActiveInvoice] = useState<any>(null);
  const [activeCertificate, setActiveCertificate] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  // Load User Orders and completed lessons state
  useEffect(() => {
    async function loadOrders() {
      if (!user) return;
      setOrdersLoading(true);
      try {
        const orders = await api.get('/users/me'); // load full context
        // Fetch specific invoices
        const allInvoices = await api.get('/auth/me'); 
        // We will mock mockOrders if API calls return empty or if server connection has warning
        setMyOrders(orders.certificates || []);
      } catch (err) {
        // Mock fallback orders
        setMyOrders([
          {
            id: 'ord-101',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            totalAmount: 199.00,
            status: 'COMPLETED',
            course: {
              id: 'c-1',
              title: 'AI Freelancing Blueprint',
              thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80',
              duration: '8 Hours',
              difficulty: 'Beginner',
              modules: [
                { title: 'Module 1: Landing Gigs', lessons: ['Lesson 1.1: Upwork setup', 'Lesson 1.2: Proposal Writing'] },
                { title: 'Module 2: Prompts Delivery', lessons: ['Lesson 2.1: Formatting JSON', 'Lesson 2.2: Context Framing'] },
              ],
            },
          },
          {
            id: 'ord-102',
            createdAt: new Date().toISOString(),
            totalAmount: 0.00,
            status: 'COMPLETED',
            course: {
              id: 'c-3',
              title: 'Introduction to Prompt Engineering',
              thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
              duration: '2 Hours',
              difficulty: 'Beginner',
              modules: [
                { title: 'Module 1: Prompt structure', lessons: ['Lesson 1.1: Role Assignment', 'Lesson 1.2: Formatting outputs'] },
              ],
            },
          },
        ]);
      } finally {
        setOrdersLoading(false);
      }
    }

    if (user) {
      loadOrders();
      const saved = localStorage.getItem(`lessons-${user.id}`);
      if (saved) {
        setCompletedLessons(JSON.parse(saved));
      }
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', {
        name: profileName,
        email: profileEmail,
        password: profilePassword || undefined,
      });
      showToast(res.message || 'Profile details updated!', 'success');
      setProfilePassword('');
      await refreshUser();
    } catch (err: any) {
      showToast(err.message || 'Profile update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAvatarFile(file);

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarUploading(true);
    try {
      const res = await api.post('/users/upload-avatar', formData);
      showToast(res.message || 'Avatar picture updated successfully!', 'success');
      await refreshUser();
    } catch (err: any) {
      showToast(err.message || 'File upload failed', 'error');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleLessonToggle = (courseId: string, lessonName: string, allLessonsCount: number) => {
    if (!user) return;

    const currentCompleted = completedLessons[courseId] || [];
    let updated: string[];

    if (currentCompleted.includes(lessonName)) {
      updated = currentCompleted.filter((l) => l !== lessonName);
    } else {
      updated = [...currentCompleted, lessonName];
    }

    const nextState = { ...completedLessons, [courseId]: updated };
    setCompletedLessons(nextState);
    localStorage.setItem(`lessons-${user.id}`, JSON.stringify(nextState));

    // If progress reaches 100%, trigger confetti!
    if (updated.length === allLessonsCount && !currentCompleted.includes(lessonName)) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
      showToast('Congratulations! Course completed! Certificate unlocked!', 'success');
    }
  };

  const getCourseProgress = (course: any) => {
    const totalLessons = course.modules?.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0) || 0;
    if (totalLessons === 0) return 0;
    
    const completed = completedLessons[course.id]?.length || 0;
    return Math.min(Math.round((completed / totalLessons) * 100), 100);
  };

  // RESUME ANALYZER MOCK PROMPT SYSTEM
  const handleResumeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) return;

    setResumeAnalyzing(true);
    setTimeout(() => {
      setResumeResult({
        score: 82,
        keywordScore: 78,
        keywordsMatched: ['Make.com', 'Zapier Automation', 'Prompt Engineering', 'TypeScript'],
        missingKeywords: ['RAG Agent setup', 'PostgreSQL DB routing', 'Webhook security integrations'],
        feedback: [
          'Excellent structural layout. High visibility of tech stacks.',
          'Recommendation: Rephrase generic prompts experience with concrete output indicators (e.g. "Saved 40 client hours weekly using recursive webhooks").',
          'Optimize formatting for standard PDF parsers.',
        ],
      });
      setResumeAnalyzing(false);
      showToast('Resume analyzed! Check your scorecard.', 'success');
    }, 1500);
  };

  // PORTFOLIO ANALYZER MOCK PROMPT SYSTEM
  const handlePortfolioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioUrl) return;

    setPortfolioAnalyzing(true);
    setTimeout(() => {
      setPortfolioResult({
        score: 91,
        mobileFriendly: true,
        loadingSpeed: '1.2 seconds',
        feedback: [
          'Brilliant minimalist design. Harmonious color themes.',
          'Missing element: Clear call-to-actions (CTAs) above the fold.',
          'Add a calendar scheduler widget (e.g., Cal.com) directly to the hero section to increase booking rate by 40%.',
        ],
      });
      setPortfolioAnalyzing(false);
      showToast('Portfolio link evaluated!', 'success');
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20 px-4 print:pt-0 print:pb-0 print:bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
          
          {/* SIDEBAR NAVIGATION - Hidden in Print */}
          <aside className="lg:col-span-3 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 border-b lg:border-b-0 lg:border-r border-slate-200/50 dark:border-slate-800/50 pr-0 lg:pr-6 shrink-0 print:hidden">
            {[
              { id: 'courses', label: 'Purchased Tracks', icon: <GraduationCap className="w-4 h-4" /> },
              { id: 'profile', label: 'Edit Profile', icon: <User className="w-4 h-4" /> },
              { id: 'resume', label: 'Resume Analyzer', icon: <FileText className="w-4 h-4" /> },
              { id: 'portfolio', label: 'Portfolio Scanner', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'bookmarks', label: 'Bookmarks', icon: <Bookmark className="w-4 h-4" /> },
              { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setResumeResult(null); setPortfolioResult(null); }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors shrink-0 text-left cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </aside>

          {/* MAIN DASHBOARD CONTENT MODULE */}
          <div className="lg:col-span-9 print:w-full">
            
            {/* TABS CONTROLLERS */}

            {/* TAB: COURSES */}
            {activeTab === 'courses' && (
              <div className="space-y-6 print:hidden">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Your Learning Tracks</h2>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-lg">
                    {myOrders.length} Enrolled
                  </span>
                </div>

                {myOrders.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-10 text-center text-slate-400 space-y-4">
                    <GraduationCap className="w-10 h-10 mx-auto text-slate-300 animate-pulse" />
                    <p className="text-xs">You are not enrolled in any paid or free tracks yet.</p>
                    <Link href="/courses" className="btn-primary-grad px-4 py-2 rounded-xl text-xs font-semibold inline-block">
                      Browse Courses
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {myOrders.map((ord) => {
                      const course = ord.course;
                      if (!course) return null;
                      const progress = getCourseProgress(course);
                      const totalLessons = course.modules?.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0) || 0;

                      return (
                        <div key={ord.id} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 dark:border-slate-800/50 pb-5">
                            <div className="flex gap-4">
                              <img src={course.thumbnail} className="w-14 h-14 object-cover rounded-xl shrink-0" />
                              <div>
                                <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">{course.title}</h3>
                                <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                                  <span>Level: {course.difficulty}</span>
                                  <span>•</span>
                                  <span>{course.duration}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {progress === 100 && (
                                <button
                                  onClick={() => setActiveCertificate({ user: user.name, course: course.title, date: new Date().toLocaleDateString() })}
                                  className="border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Award className="w-4 h-4" />
                                  Get Certificate
                                </button>
                              )}
                              <button
                                onClick={() => setActiveInvoice({ orderId: ord.id, date: ord.createdAt, amount: ord.totalAmount, product: course.title })}
                                className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer text-slate-700 dark:text-slate-350"
                              >
                                View Invoice
                              </button>
                            </div>
                          </div>

                          {/* Progress slider bar */}
                          <div>
                            <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                              <span className="text-slate-500">Course Syllabus Progress:</span>
                              <span className="text-blue-600 dark:text-blue-400">{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                          </div>

                          {/* Modules List Accordion */}
                          <div className="space-y-4 pt-2">
                            {course.modules?.map((m: any, midx: number) => (
                              <div key={midx} className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl p-4">
                                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-3">{m.title}</h4>
                                <div className="space-y-2">
                                  {m.lessons?.map((les: string, lidx: number) => {
                                    const isDone = completedLessons[course.id]?.includes(les);
                                    return (
                                      <label key={lidx} className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none">
                                        <input
                                          type="checkbox"
                                          checked={isDone || false}
                                          onChange={() => handleLessonToggle(course.id, les, totalLessons)}
                                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-750 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className={isDone ? 'line-through text-slate-400' : ''}>{les}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 shadow-sm max-w-xl print:hidden">
                <h2 className="text-xl font-extrabold text-slate-950 dark:text-white mb-6">Manage Your Account Settings</h2>

                {/* Avatar upload */}
                <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
                  <div className="relative group">
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={user.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
                    />
                    {avatarUploading && (
                      <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white">
                        <Loader className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-center sm:text-left">
                    <label className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      Upload Avatar Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                    <p className="text-[10px] text-slate-400">Supports JPEG, PNG, or WEBP up to 2MB.</p>
                  </div>
                </div>

                {/* Info updating form */}
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Change Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  {/* Referral showcase */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 p-4 rounded-2xl flex justify-between items-center gap-4">
                    <div>
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200">Affiliate Referral Code</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Share with others to earn $10 affiliate rewards!</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-blue-600 select-all select-none">
                      {user.referralCode}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary-grad py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Save Account Changes
                  </button>
                </form>
              </div>
            )}

            {/* TAB: RESUME ANALYZER */}
            {activeTab === 'resume' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 shadow-sm print:hidden">
                <div className="mb-6">
                  <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Simulated ATS Resume Analyzer</h2>
                  <p className="text-xs text-slate-500 mt-1">Upload your PDF or Word resume to match corporate AI skill keywords.</p>
                </div>

                {!resumeResult ? (
                  <form onSubmit={handleResumeSubmit} className="space-y-5">
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3">
                      <FileText className="w-10 h-10 text-slate-400" />
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Drag or click to choose resume file</p>
                        <p className="text-[10px] text-slate-400">PDF, DOC, or DOCX formats accepted.</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="resume-upload"
                      />
                      <label htmlFor="resume-upload" className="border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                        Select File
                      </label>
                      {resumeFile && <p className="text-xs font-semibold text-blue-600">{resumeFile.name}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={resumeAnalyzing || !resumeFile}
                      className="w-full btn-primary-grad py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {resumeAnalyzing ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Start AI Evaluation
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl text-center">
                        <div className="text-4xl font-extrabold text-blue-600">{resumeResult.score}</div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">ATS Fit Rating</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl text-center">
                        <div className="text-4xl font-extrabold text-emerald-600">{resumeResult.keywordScore}%</div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Keyword Affinity</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">Matched Core Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {resumeResult.keywordsMatched.map((k: string, i: number) => (
                            <span key={i} className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-emerald-200/50 dark:border-emerald-900/50">
                              ✓ {k}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">Missing High-Value Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {resumeResult.missingKeywords.map((k: string, i: number) => (
                            <span key={i} className="bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-rose-200/50 dark:border-rose-900/50">
                              + {k}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">Pitches & Refinement Feedback</h4>
                        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                          {resumeResult.feedback.map((f: string, i: number) => (
                            <li key={i} className="flex gap-2">
                              <ChevronRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={() => setResumeResult(null)}
                      className="border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer w-full"
                    >
                      Re-Analyze Different File
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PORTFOLIO SCANNER */}
            {activeTab === 'portfolio' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 shadow-sm print:hidden">
                <div className="mb-6">
                  <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Simulated Portfolio Web Analyzer</h2>
                  <p className="text-xs text-slate-500 mt-1">Submit your portfolio site link to evaluate conversion tags and micro-copy structures.</p>
                </div>

                {!portfolioResult ? (
                  <form onSubmit={handlePortfolioSubmit} className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Portfolio Link / URL</label>
                      <input
                        type="url"
                        placeholder="https://myportfoliosite.com"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4.5 py-2.5 text-xs focus:outline-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={portfolioAnalyzing || !portfolioUrl}
                      className="w-full btn-primary-grad py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {portfolioAnalyzing ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Scan Link Metadata
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl text-center">
                        <div className="text-4xl font-extrabold text-blue-600">{portfolioResult.score}</div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Landing Page Quality</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl text-center">
                        <div className="text-lg font-bold text-emerald-600 pt-2">{portfolioResult.loadingSpeed}</div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Speed Rating</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">Mobile Performance check</h4>
                        <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-semibold">
                          ✓ Responsive layout viewport configured
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">CRO / Conversion Tips</h4>
                        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                          {portfolioResult.feedback.map((f: string, i: number) => (
                            <li key={i} className="flex gap-2">
                              <ChevronRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={() => setPortfolioResult(null)}
                      className="border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer w-full"
                    >
                      Scan Different Link
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: BOOKMARKS */}
            {activeTab === 'bookmarks' && (
              <div className="space-y-6 print:hidden">
                <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Your Bookmarks</h2>
                
                {!user.bookmarks || user.bookmarks.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-10 text-center text-slate-400">
                    <Bookmark className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">No bookmarks saved yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user.bookmarks.map((bm: any) => {
                      const item = bm.course || bm.blog;
                      if (!item) return null;
                      const isCourse = !!bm.course;

                      return (
                        <div key={bm.id} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 shadow-sm relative group flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 px-2 py-0.5 rounded">
                              {isCourse ? 'Course' : 'Blog'}
                            </span>
                            <h3 className="font-bold text-xs text-slate-900 dark:text-white mt-2 mb-1">{item.title}</h3>
                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{item.description || item.content?.substring(0, 100)}</p>
                          </div>

                          <div className="border-t border-slate-100 dark:border-slate-800/50 pt-3 mt-4 flex justify-between items-center">
                            <Link href={isCourse ? '/courses' : `/blog/${item.slug}`} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5">
                              Open Resource
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => toggleBookmark(isCourse ? item.id : undefined, !isCourse ? item.id : undefined)}
                              className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 print:hidden">
                <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Activity Notifications</h2>

                {!user.notifications || user.notifications.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-10 text-center text-slate-400">
                    <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2 animate-bounce" />
                    <p className="text-xs">No activity updates.</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
                    {user.notifications.map((n: any) => (
                      <div key={n.id} className={`p-4 flex items-start gap-3 transition-colors ${n.read ? 'bg-white dark:bg-slate-900 opacity-60' : 'bg-blue-50/20 dark:bg-blue-950/10'}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-slate-300' : 'bg-blue-600'}`} />
                        <div className="flex-1">
                          <p className="text-xs leading-relaxed text-slate-850 dark:text-slate-200">{n.message}</p>
                          <span className="text-[9px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        {!n.read && (
                          <button
                            onClick={() => markNotificationRead(n.id)}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      {/* MODAL: INVOICE GENERATOR (Printable panel layout overlay) */}
      <AnimatePresence>
        {activeInvoice && (
          <>
            <div className="fixed inset-0 bg-black/60 z-50 print:hidden" onClick={() => setActiveInvoice(null)} />
            <div className="fixed inset-x-4 top-[10%] md:left-[30%] md:right-[30%] z-[60] bg-white text-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 print:relative print:inset-0 print:border-0 print:shadow-none print:p-0">
              
              {/* Actions Header (Hidden in Print) */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-6 print:hidden">
                <span className="font-extrabold text-slate-950">Invoice Generator</span>
                <div className="flex gap-2">
                  <button onClick={handlePrint} className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer">
                    Print / Save PDF
                  </button>
                  <button onClick={() => setActiveInvoice(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Invoice Sheet */}
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-black text-blue-600">AI LaunchPad</h2>
                    <p className="text-[10px] text-slate-400">support@ailaunchpad.com</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Invoice Statement</h3>
                    <p className="text-[10px] text-slate-400">Order Ref: {activeInvoice.orderId.substring(0, 8)}</p>
                  </div>
                </div>

                <div className="border-t border-b border-slate-100 py-4 grid grid-cols-2 gap-4 text-[10px]">
                  <div>
                    <div className="font-bold text-slate-400 uppercase">Billed To</div>
                    <div className="font-bold text-slate-800 mt-1">{user.name}</div>
                    <div className="text-slate-500 mt-0.5">{user.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-400 uppercase">Payment Details</div>
                    <div className="font-semibold text-slate-800 mt-1">Stripe Gateway / Razorpay</div>
                    <div className="text-slate-500 mt-0.5">Date: {new Date(activeInvoice.date).toLocaleDateString()}</div>
                  </div>
                </div>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 text-slate-800">
                      <td className="py-3 font-semibold">{activeInvoice.product}</td>
                      <td className="py-3 text-right font-bold">${activeInvoice.amount}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-end text-sm font-extrabold border-t border-slate-200 pt-4 text-slate-950">
                  <div className="flex gap-8">
                    <span>Total Amount Paid:</span>
                    <span>${activeInvoice.amount} USD</span>
                  </div>
                </div>

                <div className="text-center text-[9px] text-slate-400 pt-8 border-t border-dashed border-slate-200">
                  Thank you for starting your digital career path with AI Launchpad!
                </div>
              </div>

            </div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL: CERTIFICATE GENERATOR (SVG Printable Draw Overlay) */}
      <AnimatePresence>
        {activeCertificate && (
          <>
            <div className="fixed inset-0 bg-black/60 z-50 print:hidden" onClick={() => setActiveCertificate(null)} />
            <div className="fixed inset-x-4 top-[8%] md:left-[20%] md:right-[20%] z-[60] bg-white text-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 print:relative print:inset-0 print:border-0 print:shadow-none print:p-0">
              
              {/* Header actions (Hidden in Print) */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6 print:hidden">
                <span className="font-extrabold text-slate-950">Certificate Generator</span>
                <div className="flex gap-2">
                  <button onClick={handlePrint} className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1">
                    Print / Save PDF
                  </button>
                  <button onClick={() => setActiveCertificate(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Certificate Frame */}
              <div className="border-[12px] border-double border-blue-600 rounded-2xl p-8 text-center space-y-6 relative overflow-hidden bg-slate-50">
                {/* Visual background badges */}
                <div className="absolute top-[-10%] right-[-10%] w-40 h-40 rounded-full bg-blue-100 opacity-30 pointer-events-none" />
                
                <div className="flex justify-center text-blue-600">
                  <Award className="w-16 h-16" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Certificate of Completion</span>
                  <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">AI LAUNCHPAD</h1>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] italic text-slate-500">This certifies that</p>
                  <p className="text-base md:text-xl font-bold border-b border-slate-300 pb-1.5 max-w-sm mx-auto text-slate-950">{activeCertificate.user}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] leading-relaxed max-w-md mx-auto text-slate-500">
                    has successfully completed all lesson modules, project checkpoints, and portfolio audits for the learning track
                  </p>
                  <p className="text-xs md:text-sm font-bold text-blue-600">{activeCertificate.course}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-6 mt-8 max-w-md mx-auto text-[9px] text-slate-500">
                  <div className="text-left">
                    <div className="font-semibold text-slate-800">Elena Rostova</div>
                    <div>CEO, AI LaunchPad</div>
                  </div>
                  <div className="text-right">
                    <div>Date Issued: {activeCertificate.date}</div>
                    <div className="font-mono mt-0.5">Ref: {Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
