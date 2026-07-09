'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendation?: {
    title: string;
    href: string;
    price: string;
  };
}

export default function AiChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hi there! I am your AI LaunchPad Career Scout. Ask me anything about prompts, freelance skills, automations, or select an option below!',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: Message = { id: userMsgId, sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Mock AI response delay
    setTimeout(() => {
      let aiResponseText = "That's an interesting question! I recommend looking into Make.com workflow building and prompting. What level of experience do you have?";
      let recommendation;

      const lower = textToSend.toLowerCase();
      if (lower.includes('recommend') || lower.includes('course') || lower.includes('learn')) {
        aiResponseText = "Based on your interest, I highly recommend our flagship course: **AI Freelancing Blueprint**. It takes you from setting up Upwork profiles to prompt engineering and building automations.";
        recommendation = {
          title: 'AI Freelancing Blueprint',
          href: '/courses',
          price: '$199.00',
        };
      } else if (lower.includes('automation') || lower.includes('make') || lower.includes('zapier')) {
        aiResponseText = "Automating manual business operations is the #1 freelance skill in 2026. Master logical trees, JSON mapping, and webhooks in our course:";
        recommendation = {
          title: 'Advanced AI Automations',
          href: '/courses',
          price: '$299.00',
        };
      } else if (lower.includes('free') || lower.includes('beginner')) {
        aiResponseText = "If you're just starting out, get familiar with foundational prompt formatting, few-shot prompting, and tone control with this free track:";
        recommendation = {
          title: 'Introduction to Prompt Engineering',
          href: '/courses',
          price: 'Free',
        };
      } else if (lower.includes('chatbot') || lower.includes('website')) {
        aiResponseText = "Businesses are paying high fees for chatbot deployments. You can learn custom LLM integration workflows or book our direct setup services here:";
        recommendation = {
          title: 'Custom AI Chatbots Service',
          href: '/services',
          price: '$399.00',
        };
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        recommendation,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 1000);
  };

  const handleQuickAction = (topic: string) => {
    handleSend(topic);
  };

  return (
    <div className="fixed bottom-5 left-5 z-40">
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg cursor-pointer"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 animate-pulse" />}
      </motion.button>

      {/* Expanded Chat Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="absolute bottom-18 left-0 w-80 sm:w-96 h-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xs">AI Launchpad Scout</h3>
                  <span className="text-[9px] text-blue-100 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Online & Ready
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Screen */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/20">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {m.text}

                    {m.recommendation && (
                      <div className="mt-3 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex flex-col gap-1.5">
                        <div>
                          <div className="font-bold text-[10px] text-blue-800 dark:text-blue-200">Recommended resource:</div>
                          <div className="font-semibold text-xs text-slate-800 dark:text-slate-100">{m.recommendation.title}</div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{m.recommendation.price}</span>
                          <Link
                            href={m.recommendation.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Go View
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-400 p-3 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            {messages.length === 1 && (
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap gap-1.5 shrink-0 justify-center">
                <button
                  onClick={() => handleQuickAction('Recommend a Course')}
                  className="bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/20 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors"
                >
                  🎓 Recommend Course
                </button>
                <button
                  onClick={() => handleQuickAction('Explain Make.com workflow')}
                  className="bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/20 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors"
                >
                  ⚡ Automations tips
                </button>
                <button
                  onClick={() => handleQuickAction('Chatbots training')}
                  className="bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/20 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors"
                >
                  🤖 Chatbot builder
                </button>
              </div>
            )}

            {/* Typing Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder="Ask me a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              />
              <button type="submit" className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
