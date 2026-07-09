'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, User, Eye, ArrowLeft, Send, MessageSquare, Loader } from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    avatarUrl: string | null;
  };
}

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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const resolvedParams = use(params);

  const [blogData, setBlogData] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [related, setRelated] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Comment Form state
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    async function loadBlogDetails() {
      try {
        const res = await api.get(`/blogs/${resolvedParams.slug}`);
        setBlogData(res.blog);
        setComments(res.blog.comments || []);
        setRelated(res.related || []);
      } catch (err: any) {
        showToast(err.message || 'Article not found.', 'error');
        router.push('/blog');
      } finally {
        setLoading(false);
      }
    }
    loadBlogDetails();
  }, [resolvedParams.slug, router, showToast]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !blogData) return;

    if (!user) {
      showToast('Please log in to post comments!', 'info');
      router.push('/login');
      return;
    }

    setCommentLoading(true);
    try {
      const newComment = await api.post(`/blogs/${blogData.id}/comments`, {
        content: commentInput,
      });
      setComments((prev) => [newComment, ...prev]);
      setCommentInput('');
      showToast('Comment posted successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to post comment', 'error');
    } finally {
      setCommentLoading(false);
    }
  };

  // Custom micro-markdown parser
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2.5">{line.replace('### ', '')}</h3>;
      }
      
      // Bold text formatting **text**
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const match = boldRegex.exec(line);

      // Bullet lists
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const bulletText = line.substring(2);
        return (
          <ul key={idx} className="list-disc pl-5 my-1 text-slate-700 dark:text-slate-350 text-xs">
            <li>{bulletText}</li>
          </ul>
        );
      }

      // Standard paragraphs
      if (line.trim() === '') {
        return <div key={idx} className="h-4" />;
      }

      return (
        <p key={idx} className="text-xs leading-relaxed text-slate-700 dark:text-slate-350 my-2.5">
          {formattedLine}
        </p>
      );
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!blogData) return null;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </Link>

          {/* Article Banner */}
          <div className="relative h-64 md:h-[400px] rounded-3xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-800/50 mb-8">
            <img src={blogData.featuredImage} alt={blogData.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
              <span className="bg-blue-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-md">
                {blogData.category}
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">{blogData.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {blogData.author.name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(blogData.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {blogData.viewCount} Views
                </span>
              </div>
            </div>
          </div>

          {/* Content Block */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 md:p-10 shadow-sm mb-10">
            <div className="prose dark:prose-invert max-w-none">
              {renderMarkdown(blogData.content)}
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 shadow-sm mb-10">
            <h3 className="font-extrabold text-slate-950 dark:text-white text-base mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Community Discussion ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="flex flex-col gap-3 mb-8">
              <textarea
                placeholder="Share your thoughts or ask a question..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 text-xs focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={commentLoading || !commentInput.trim()}
                  className="btn-primary-grad px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Comment
                </button>
              </div>
            </form>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs italic">
                Be the first to share your thoughts on this article!
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comm) => (
                  <div key={comm.id} className="border-b border-slate-100 dark:border-slate-800/50 pb-4 last:border-0 last:pb-0 flex gap-3">
                    <img
                      src={comm.user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={comm.user.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-200">{comm.user.name}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(comm.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">{comm.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Articles */}
          {related.length > 0 && (
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-6">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/blog/${rel.slug}`}
                    className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group"
                  >
                    <img src={rel.featuredImage} className="h-28 w-full object-cover rounded-xl" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 line-clamp-2 transition-colors">
                      {rel.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
