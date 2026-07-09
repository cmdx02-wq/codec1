import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import AiChatAssistant from '../components/AiChatAssistant';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI LaunchPad - Launch Your AI Career in 14 Days',
  description: 'Learn AI freelancing, integrate automations, and build high-ticket client portfolios. Start earning online with AI services today.',
  keywords: ['AI Freelancing', 'Make.com', 'Zapier Automation', 'Prompt Engineering', 'AI Chatbots', 'Portfolio Rebuild'],
  openGraph: {
    title: 'AI LaunchPad - Launch Your AI Career in 14 Days',
    description: 'Learn AI freelancing, integrate automations, and build high-ticket client portfolios.',
    type: 'website',
    url: 'https://ailaunchpad.com',
    images: [{ url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&h=630&q=80' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300`}>
        <ToastProvider>
          <AuthProvider>
            <ThemeProvider>
              {children}
              <AiChatAssistant />
            </ThemeProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

