'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, User, Eye, Loader, MessageSquare, Newspaper } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string;
  category: string;
  viewCount: number;
  createdAt: string;
  author: {
    name: string;
    avatarUrl: string | null;
  };
}

export default function BlogPage() {
  const { showToast } = useToast();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Freelancing', 'Automation', 'Prompting', 'Business'];

  useEffect(() => {
    async function loadBlogs() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (category !== 'All') queryParams.append('category', category);

        const data = await api.get(`/blogs?${queryParams.toString()}`);
        setBlogs(data);
      } catch (err) {
        showToast('Failed to load blog posts. Loading offline articles.', 'warning');
        // Fallback local mock articles
        setBlogs([
          {
            id: 'b-1',
            title: 'Top 5 AI Skills Clients are Paying for in 2026',
            slug: 'top-5-ai-skills-clients-paying-2026',
            content: 'The landscape of digital freelancing has changed permanently. Clients want efficiency specialists who can integrate artificial intelligence into their businesses...',
            featuredImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
            category: 'Freelancing',
            viewCount: 154,
            createdAt: new Date().toISOString(),
            author: { name: 'Launchpad Admin', avatarUrl: null },
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadBlogs();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, showToast]);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Newspaper className="w-8 h-8 text-blue-600 animate-pulse" />
              AI Freelance Insights & Guides
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto">
              Read step-by-step documentation, tutorial logs, prompts configs, and onboarding walkthroughs compiled by active agency builders.
            </p>
          </div>

          {/* Filters and Searches */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-850 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto shrink-0 overflow-x-auto justify-end">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors shrink-0 cursor-pointer ${
                    category === cat
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800 bg-white/55 dark:bg-slate-900/55 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Blogs display grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-xs">
              No articles found matching search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
                >
                  <Link href={`/blog/${blog.slug}`} className="h-44 overflow-hidden block">
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  </Link>

                  <div className="p-6 flex flex-col flex-1 gap-4">
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mb-2">
                        <span className="bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 px-2 py-0.5 rounded font-bold uppercase">
                          {blog.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(blog.createdAt)}
                        </span>
                      </div>
                      
                      <Link href={`/blog/${blog.slug}`}>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2 group-hover:text-blue-600 transition-colors">
                          {blog.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {blog.content.replace(/[#*`]/g, '')}
                      </p>
                    </div>

                    <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <img
                          src={blog.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={blog.author.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-350">{blog.author.name}</span>
                      </div>

                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {blog.viewCount} Views
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
