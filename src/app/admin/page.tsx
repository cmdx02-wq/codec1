'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Loader,
  Users,
  GraduationCap,
  Briefcase,
  FileText,
  DollarSign,
  Download,
  Trash,
  Plus,
  Edit,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/Navbar';

export default function AdminPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');

  // Analytics Metrics
  const [metrics, setMetrics] = useState<any>({
    totalUsers: 0,
    totalCourses: 0,
    totalServices: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [latestOrders, setLatestOrders] = useState<any[]>([]);
  const [registrationsByDay, setRegistrationsByDay] = useState<any[]>([]);
  const [revenueByDay, setRevenueByDay] = useState<any[]>([]);

  // CRUD Tables
  const [userList, setUserList] = useState<any[]>([]);
  const [courseList, setCourseList] = useState<any[]>([]);
  const [serviceList, setServiceList] = useState<any[]>([]);
  const [blogList, setBlogList] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Form Modals states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    id: '',
    title: '',
    description: '',
    thumbnail: '',
    price: 0,
    difficulty: 'Beginner',
    duration: '2 Hours',
  });

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    id: '',
    name: '',
    description: '',
    image: '',
    price: 0,
    active: true,
  });

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'ADMIN') {
      showToast('Access denied. Administrator privileges required.', 'error');
      router.push('/dashboard');
      return;
    }
    if (user && user.role === 'ADMIN') {
      setAuthorized(true);
      loadAdminData();
    }
  }, [user, token, router, showToast]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Analytics data fetch
      const stats = await api.get('/admin/analytics');
      setMetrics(stats.metrics);
      setLatestOrders(stats.latestOrders || []);
      setRegistrationsByDay(stats.registrationsByDay || []);
      setRevenueByDay(stats.revenueByDay || []);

      // CRUD collections
      const u = await api.get('/admin/users');
      setUserList(u);

      const c = await api.get('/courses');
      setCourseList(c);

      const s = await api.get('/services');
      setServiceList(s);

      const b = await api.get('/blogs');
      setBlogList(b);
    } catch (err: any) {
      showToast('Error loading database admin records. Loading mock data.', 'warning');
      // Mock static collections
      setMetrics({
        totalUsers: 142,
        totalCourses: 3,
        totalServices: 4,
        totalOrders: 64,
        totalRevenue: 12450.0,
      });
      setRegistrationsByDay([
        { day: 'Mon', count: 12 },
        { day: 'Tue', count: 19 },
        { day: 'Wed', count: 15 },
        { day: 'Thu', count: 22 },
        { day: 'Fri', count: 30 },
        { day: 'Sat', count: 25 },
        { day: 'Sun', count: 35 },
      ]);
      setRevenueByDay([
        { day: 'Mon', amount: 450 },
        { day: 'Tue', amount: 890 },
        { day: 'Wed', amount: 620 },
        { day: 'Thu', amount: 1200 },
        { day: 'Fri', amount: 1500 },
        { day: 'Sat', amount: 980 },
        { day: 'Sun', amount: 1850 },
      ]);
      setUserList([
        { id: 'u-1', name: 'Alex Mercer', email: 'alex@company.com', role: 'USER', affiliateBalance: 10.0, createdAt: new Date().toISOString() },
        { id: 'u-2', name: 'Sarah Jenkins', email: 'sarah@integrator.io', role: 'USER', affiliateBalance: 30.0, createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // CSV DOWNLOAD TRIGGER
  const handleExportCSV = async () => {
    try {
      const csvData = await api.get('/admin/export/orders');
      
      // Local file download setup
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ailaunchpad-orders-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('CSV export initialized!', 'success');
    } catch (err: any) {
      showToast('CSV download unavailable in simulation fallback.', 'warning');
    }
  };

  // COURSE CRUD
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (courseForm.id) {
        // Edit
        await api.put(`/admin/courses/${courseForm.id}`, courseForm);
        showToast('Course details modified!', 'success');
      } else {
        // Create
        await api.post('/admin/courses', courseForm);
        showToast('New course published!', 'success');
      }
      setShowCourseModal(false);
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Course saving failed', 'error');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      showToast('Course removed!', 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Deletion failed', 'error');
    }
  };

  // SERVICE CRUD
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (serviceForm.id) {
        await api.put(`/admin/services/${serviceForm.id}`, serviceForm);
        showToast('Service package updated!', 'success');
      } else {
        await api.post('/admin/services', serviceForm);
        showToast('New service published!', 'success');
      }
      setShowServiceModal(false);
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Service saving failed', 'error');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/admin/services/${id}`);
      showToast('Service removed!', 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Deletion failed', 'error');
    }
  };

  if (!authorized) return null;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Admin Navigation Menu */}
          <aside className="lg:col-span-3 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 border-b lg:border-b-0 lg:border-r border-slate-200/50 dark:border-slate-800/50 pr-0 lg:pr-6 shrink-0">
            {[
              { id: 'analytics', label: 'Metrics Analytics', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'users', label: 'User Operations', icon: <Users className="w-4 h-4" /> },
              { id: 'courses', label: 'Courses CRUD', icon: <GraduationCap className="w-4 h-4" /> },
              { id: 'services', label: 'Services CRUD', icon: <Briefcase className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

          {/* Core Panel Content */}
          <div className="lg:col-span-9 space-y-6">
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {/* TAB: METRIC ANALYTICS */}
                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    {/* Top Ribbon */}
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Analytical Statistics</h2>
                      <button
                        onClick={handleExportCSV}
                        className="btn-primary-grad px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Export Sales (CSV)
                      </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Revenue', value: `$${metrics.totalRevenue}`, icon: <DollarSign className="w-4 h-4 text-emerald-500" /> },
                        { label: 'Registered Accounts', value: metrics.totalUsers, icon: <Users className="w-4 h-4 text-blue-500" /> },
                        { label: 'Completed Purchases', value: metrics.totalOrders, icon: <CheckCircle className="w-4 h-4 text-purple-500" /> },
                        { label: 'Courses Active', value: metrics.totalCourses, icon: <GraduationCap className="w-4 h-4 text-orange-500" /> },
                      ].map((item, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-2xl flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center shrink-0">
                            {item.icon}
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.label}</div>
                            <div className="text-lg font-black text-slate-950 dark:text-white mt-0.5">{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* SVG Analytics Charts (Clean loading, responsive styling) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Signup Chart */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs mb-4 uppercase tracking-wider text-slate-400">Account Registrations (Last 7 Days)</h3>
                        <div className="h-44 flex items-end justify-between gap-2 pt-6">
                          {registrationsByDay.map((d, i) => {
                            const percentHeight = Math.max((d.count / 40) * 100, 10);
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                <div className="text-[10px] font-bold text-blue-600">{d.count}</div>
                                <div className="w-full bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg transition-all" style={{ height: `${percentHeight}%` }} />
                                <div className="text-[9px] font-bold text-slate-450 uppercase">{d.day}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Revenue Chart */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs mb-4 uppercase tracking-wider text-slate-400">Daily Revenue Summary (USD)</h3>
                        <div className="h-44 flex items-end justify-between gap-2 pt-6">
                          {revenueByDay.map((d, i) => {
                            const percentHeight = Math.max((d.amount / 2000) * 100, 10);
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                <div className="text-[9px] font-bold text-emerald-650">${d.amount}</div>
                                <div className="w-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-all" style={{ height: `${percentHeight}%` }} />
                                <div className="text-[9px] font-bold text-slate-450 uppercase">{d.day}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB: USER MANAGEMENT */}
                {activeTab === 'users' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Active Accounts Dashboard</h2>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-250/20 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="p-4">Customer Details</th>
                            <th className="p-4">Role System</th>
                            <th className="p-4">Affiliate Bal.</th>
                            <th className="p-4 text-right">Registered</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {userList.map((u) => (
                            <tr key={u.id} className="text-slate-800 dark:text-slate-200">
                              <td className="p-4">
                                <div className="font-bold">{u.name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{u.email}</div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-4 font-bold text-slate-700 dark:text-slate-300">${u.affiliateBalance}</td>
                              <td className="p-4 text-right text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB: COURSE CRUD */}
                {activeTab === 'courses' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Manage Academy Courses</h2>
                      <button
                        onClick={() => {
                          setCourseForm({ id: '', title: '', description: '', thumbnail: '', price: 0, difficulty: 'Beginner', duration: '2 Hours' });
                          setShowCourseModal(true);
                        }}
                        className="btn-primary-grad px-4.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Create Course
                      </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/50 text-slate-400 font-bold uppercase">
                            <th className="p-4">Track Title</th>
                            <th className="p-4">Difficulty Level</th>
                            <th className="p-4">Cost Price</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {courseList.map((c) => (
                            <tr key={c.id}>
                              <td className="p-4 font-bold text-slate-900 dark:text-white">{c.title}</td>
                              <td className="p-4">
                                <span className="bg-blue-55 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                  {c.difficulty}
                                </span>
                              </td>
                              <td className="p-4 font-black">${c.price}</td>
                              <td className="p-4 text-right flex justify-end gap-2">
                                <button
                                  onClick={() => { setCourseForm(c); setShowCourseModal(true); }}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCourse(c.id)}
                                  className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB: SERVICES CRUD */}
                {activeTab === 'services' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Manage Consulting Packages</h2>
                      <button
                        onClick={() => {
                          setServiceForm({ id: '', name: '', description: '', image: '', price: 0, active: true });
                          setShowServiceModal(true);
                        }}
                        className="btn-primary-grad px-4.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Create Service
                      </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/50 text-slate-400 font-bold uppercase">
                            <th className="p-4">Package Service Name</th>
                            <th className="p-4">Base Cost</th>
                            <th className="p-4">Status active</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {serviceList.map((s) => (
                            <tr key={s.id}>
                              <td className="p-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                              <td className="p-4 font-black">${s.price}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                                  {s.active ? 'Active' : 'Draft'}
                                </span>
                              </td>
                              <td className="p-4 text-right flex justify-end gap-2">
                                <button
                                  onClick={() => { setServiceForm(s); setShowServiceModal(true); }}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteService(s.id)}
                                  className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </main>

      {/* COURSE FORM DRAWER MODAL */}
      <AnimatePresence>
        {showCourseModal && (
          <>
            <div className="fixed inset-0 bg-black/60 z-50 cursor-pointer" onClick={() => setShowCourseModal(false)} />
            <div className="fixed inset-y-4 right-4 left-4 md:left-[35%] md:right-[35%] bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-[60] flex flex-col justify-between overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Publish Course Blueprint</h3>
                <button onClick={() => setShowCourseModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCourse} className="space-y-4 flex-1">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Course Title</label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description Outline</label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Price Cost ($)</label>
                    <input
                      type="number"
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Difficulty Level</label>
                    <select
                      value={courseForm.difficulty}
                      onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Duration (Hours)</label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Thumbnail URL Link</label>
                  <input
                    type="url"
                    value={courseForm.thumbnail}
                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>

                <button type="submit" className="w-full btn-primary-grad py-3 rounded-xl text-xs font-semibold cursor-pointer">
                  Save Platform Course
                </button>
              </form>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* SERVICE FORM DRAWER MODAL */}
      <AnimatePresence>
        {showServiceModal && (
          <>
            <div className="fixed inset-0 bg-black/60 z-50 cursor-pointer" onClick={() => setShowServiceModal(false)} />
            <div className="fixed inset-y-4 right-4 left-4 md:left-[35%] md:right-[35%] bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-[60] flex flex-col justify-between overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Publish Consulting Package</h3>
                <button onClick={() => setShowServiceModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="space-y-4 flex-1">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Service Package Name</label>
                  <input
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description Outline</label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Pricing Cost ($)</label>
                    <input
                      type="number"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Active Status</label>
                    <select
                      value={serviceForm.active ? 'true' : 'false'}
                      onChange={(e) => setServiceForm({ ...serviceForm, active: e.target.value === 'true' })}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    >
                      <option value="true">Active (Publish)</option>
                      <option value="false">Draft (Hide)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Featured Image Link</label>
                  <input
                    type="url"
                    value={serviceForm.image}
                    onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>

                <button type="submit" className="w-full btn-primary-grad py-3 rounded-xl text-xs font-semibold cursor-pointer">
                  Save Consulting Package
                </button>
              </form>
            </div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
