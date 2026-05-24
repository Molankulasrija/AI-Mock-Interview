'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, Mic, BarChart, Sparkles, ArrowRight, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const cards = [
  {
    title: 'Upload Resume',
    description:
      'Upload your PDF and let our AI parse it to generate custom interview questions.',
    href: '/dashboard/resume',
    icon: FileText,
    gradient: 'from-blue-500 to-cyan-400',
    glowColor: 'rgba(59, 130, 246, 0.15)',
    borderHover: 'hover:border-blue-500/40',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    title: 'Start Interview',
    description:
      'Connect with the AI voice agent for a real-time mock interview based on your profile.',
    href: '/dashboard/interview',
    icon: Mic,
    gradient: 'from-emerald-500 to-green-400',
    glowColor: 'rgba(16, 185, 129, 0.15)',
    borderHover: 'hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
  },
  {
    title: 'Analytics',
    description:
      'Review your past interview scores, feedback, and skill breakdown charts.',
    href: '/dashboard/analytics',
    icon: BarChart,
    gradient: 'from-purple-500 to-violet-400',
    glowColor: 'rgba(139, 92, 246, 0.15)',
    borderHover: 'hover:border-purple-500/40',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
  },
];

export default function DashboardClient({ userEmail }: { userEmail: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-grid bg-radial-glow relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/[0.07] rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/[0.07] rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/[0.05] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Top Nav Bar */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-12 sm:mb-16"
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-zinc-300 tracking-wide hidden sm:inline">
              AI MOCK INTERVIEW
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500 hidden sm:inline">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </motion.nav>

        {/* Hero Header */}
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.header variants={fadeUp} className="mb-12 sm:mb-16 text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">
              <span className="gradient-text">AI Mock Interview</span>
            </h1>
            <p className="text-zinc-500 text-base sm:text-lg max-w-xl mx-auto sm:mx-0">
              Sharpen your skills with AI-powered practice sessions. Upload your
              resume, face tailored questions, and get instant analytics.
            </p>
          </motion.header>

          {/* Feature Cards Grid */}
          <motion.div
            variants={container}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
          >
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.href} variants={fadeUp}>
                  <Link href={card.href} className="block group">
                    <motion.div
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className={`glass-panel p-6 sm:p-7 relative overflow-hidden transition-colors duration-300 ${card.borderHover}`}
                      style={{ willChange: 'transform' }}
                    >
                      {/* Hover glow effect */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                        style={{
                          background: `radial-gradient(600px circle at 50% 0%, ${card.glowColor}, transparent 70%)`,
                        }}
                      />

                      <div className="relative z-10">
                        {/* Icon */}
                        <div
                          className={`h-12 w-12 ${card.iconBg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className={`h-5 w-5 ${card.iconColor}`} />
                        </div>

                        {/* Text */}
                        <h2 className="text-lg font-semibold text-zinc-100 mb-2 group-hover:text-white transition-colors">
                          {card.title}
                        </h2>
                        <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                          {card.description}
                        </p>

                        {/* CTA */}
                        <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                          Get Started
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Recent Sessions (past interviews placeholder) */}
          <motion.section variants={fadeUp} className="mt-12 sm:mt-16">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6">
              Recent Sessions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { date: 'Today', score: 87, topic: 'React & System Design' },
                { date: 'Yesterday', score: 72, topic: 'Data Structures' },
                { date: '3 days ago', score: 91, topic: 'Backend Architecture' },
              ].map((session, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  whileHover={{ y: -3 }}
                  className="glass-panel p-5 cursor-pointer group hover:border-white/[0.15] transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs text-zinc-600 font-medium">
                      {session.date}
                    </span>
                    <div
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        session.score >= 80
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : session.score >= 60
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {session.score}%
                    </div>
                  </div>
                  <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                    {session.topic}
                  </p>
                  <div className="mt-3 w-full bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${session.score}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.2, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        session.score >= 80
                          ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                          : session.score >= 60
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                            : 'bg-gradient-to-r from-red-500 to-orange-400'
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}
