'use client';

import React from 'react';
import { Target, Eye, Rocket, Users, Globe, Smile } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AboutPage() {
  const stats = [
    { icon: <Users className="w-5 h-5 text-blue-600" />, label: 'Active Students', value: '45,000+' },
    { icon: <Globe className="w-5 h-5 text-blue-600" />, label: 'Countries Represented', value: '120+' },
    { icon: <Smile className="w-5 h-5 text-blue-600" />, label: 'Student Ratings', value: '4.9 / 5' },
  ];

  const team = [
    {
      name: 'Elena Rostova',
      role: 'CEO & Founder',
      bio: 'Former prompt pipeline lead at OpenAI. Elena founded AI LaunchPad to make AI automation education accessible globally.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Devon Keats',
      role: 'Head of Integrations',
      bio: 'Workflow architect with 8+ years experience in CRM automation. Expert in Make.com and complex databases synchronization.',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Nisha Pillai',
      role: 'Director of AI Curriculum',
      bio: 'Leading researcher in prompt engineering structures and conversational agent designs. Author of the Prompting Handbook.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    },
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-20">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Democratizing AI Education
            </h1>
            <p className="text-slate-500 leading-relaxed text-sm">
              AI LaunchPad was founded with a clear directive: bridge the gap between prompt scripting ideas and real-world freelance billing. We empower digital creators to build production-ready automations that solve actual enterprise workflow limits.
            </p>
          </div>

          {/* Mission & Vision Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 text-blue-600">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Our Mission</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Provide step-by-step blueprints, visual builders, and contract frameworks that take individuals from zero experience to actively earning with artificial intelligence services in 14 days.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 text-blue-600">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Our Vision</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Create the largest global hub of AI freelancers, where local businesses outsource automation architectures directly to our certified graduates.
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 md:py-12 mb-20 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {stats.map((s, idx) => (
                <div key={idx} className="space-y-2 last:border-0 border-r border-slate-100 dark:border-slate-800">
                  <div className="flex justify-center text-blue-600">{s.icon}</div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{s.value}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Founders Story block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-20">
            <div className="h-80 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                alt="Workspace collaboration"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Built by Agency Experts</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                AI LaunchPad was not built by theorists. It was designed by the founders of Antigravity AI, a San Francisco-based consulting firm that builds workflow integrations for enterprise clients. We realized that local shops couldn&apos;t afford high-end consultancy fees but desperately needed chatbot setups.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                By training freelancers, we solve both problems: we build career tracks for creators, and we provide affordable AI integration experts to small business networks globally.
              </p>
            </div>
          </div>

          {/* Leadership Team Grid */}
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-12">Meet Our Leadership</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm p-6 flex flex-col gap-4 text-center group"
                >
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-24 h-24 rounded-full object-cover border border-slate-200/50 mx-auto group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h4 className="font-bold text-slate-950 dark:text-white text-sm mb-1">{t.name}</h4>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{t.role}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
