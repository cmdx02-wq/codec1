'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Tag, Loader, X, ExternalLink, CalendarRange } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface Service {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
}

export default function ServicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Checkout form details
  const [provider, setProvider] = useState<'STRIPE' | 'RAZORPAY'>('STRIPE');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await api.get('/services');
        setServices(data);
      } catch (err) {
        showToast('Failed to load services. Using default values.', 'warning');
        // Fallback mockup local state
        setServices([
          {
            id: 's-1',
            name: 'AI Automation Integration',
            description: 'Streamline corporate workflows using Make.com, Zapier, and custom automation scripts to save time.',
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
            price: 499,
          },
          {
            id: 's-2',
            name: 'AI Website Development',
            description: 'Get a premium responsive portfolio or business landing page designed and published in 48 hours.',
            image: 'https://images.unsplash.com/photo-1547658719-da2b8116c1d0?auto=format&fit=crop&w=800&q=80',
            price: 299,
          },
          {
            id: 's-3',
            name: 'Custom AI Chatbots',
            description: 'Deploy advanced RAG chatbots trained on local knowledge bases to resolve lead questions.',
            image: 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&w=800&q=80',
            price: 399,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, [showToast]);

  const handleBookNow = (service: Service) => {
    if (!user) {
      showToast('Please sign in to order freelance services!', 'info');
      router.push('/login');
      return;
    }
    setSelectedService(service);
    setCouponApplied(false);
    setCouponCode('');
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
    if (!selectedService) return;
    setBookingLoading(true);

    try {
      const data = await api.post('/payments/checkout', {
        serviceId: selectedService.id,
        provider,
        couponCode: couponApplied ? 'LAUNCH50' : undefined,
      });

      setSelectedService(null);

      if (data.checkoutUrl) {
        router.push(data.checkoutUrl);
      } else if (data.success && data.mock) {
        showToast('Booking completed! View orders in your dashboard.', 'success');
        router.push('/dashboard');
      } else if (data.razorpayOrderId) {
        // Razorpay mock verify
        router.push(`/payment-simulation?orderId=${data.orderId}`);
      }
    } catch (err: any) {
      showToast(err.message || 'Checkout failed', 'error');
    } finally {
      setBookingLoading(false);
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
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Professional AI Done-For-You Services
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto">
              Want us to build it for you? Book our vetted agency experts to deploy high-ticket automations, websites, chatbots, and templates.
            </p>
          </div>

          {/* Grid Loading */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-black text-slate-900 dark:text-white">
                      ${service.price}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1 gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{service.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{service.description}</p>
                    </div>

                    <button
                      onClick={() => handleBookNow(service)}
                      className="w-full mt-auto btn-primary-grad py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CalendarRange className="w-4 h-4" />
                      Book Service
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Booking Checkout Drawer Modal */}
      <AnimatePresence>
        {selectedService && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed inset-x-4 top-[15%] md:left-[35%] md:right-[35%] z-[60] bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Confirm Booking Request</h3>
                <button onClick={() => setSelectedService(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                  <img src={selectedService.image} className="w-12 h-12 object-cover rounded-lg" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{selectedService.name}</h4>
                    <span className="text-[10px] text-slate-400">Done-For-You Delivery Package</span>
                  </div>
                </div>

                {/* Gateway Choice */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Payment Provider</label>
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
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 uppercase focus:outline-none"
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
                    {couponApplied && <span className="line-through text-slate-400 text-xs">${selectedService.price}</span>}
                    <span>${getPrice(selectedService.price)}</span>
                  </div>
                </div>

                {/* Checkout Submit */}
                <button
                  onClick={handleCheckoutSubmit}
                  disabled={bookingLoading}
                  className="w-full btn-primary-grad py-2.5 rounded-xl text-xs font-semibold flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {bookingLoading ? <Loader className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Confirm & Initialize Payment
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
