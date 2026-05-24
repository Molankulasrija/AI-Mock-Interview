'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  Brain,
  FileText,
  BarChart3,
  Shield,
  Zap,
  Target,
  ChevronRight,
  Github,
} from 'lucide-react';

// ─── Animation Variants ──────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.8 },
  },
};

// ─── Animated Counter ─────────────────────────────────────
function AnimatedStat({ value, suffix = '' }: { value: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: 'easeOut',
    });
    const unsubscribe = rounded.on('change', (v) => {
      if (ref.current) ref.current.textContent = v + suffix;
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, suffix, count, rounded]);

  return <span ref={ref}>0{suffix}</span>;
}

// ─── Floating Particle ───────────────────────────────────
function FloatingOrb({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.3, 0.6, 0.3],
        y: [0, -30, 0],
        x: [0, 15, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      className={className}
    />
  );
}

// ─── Feature Card ─────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  glowColor,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  glowColor: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="glass-panel p-6 relative overflow-hidden group cursor-default"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(400px circle at 50% 0%, ${glowColor}, transparent 70%)`,
        }}
      />
      <div className="relative z-10">
        <div
          className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-base font-semibold text-zinc-100 mb-2">{title}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// ─── Step Card ────────────────────────────────────────────
function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div variants={fadeUp} className="text-center">
      <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm font-bold text-blue-400 mb-4">
        {step}
      </div>
      <h3 className="text-base font-semibold text-zinc-200 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed max-w-xs mx-auto">
        {description}
      </p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// ─── HOME PAGE ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* ─── Ambient Background ──────────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/[0.07] rounded-full blur-[150px]" />
        <FloatingOrb
          className="absolute top-[20%] left-[10%] w-72 h-72 bg-purple-500/[0.05] rounded-full blur-[100px]"
          delay={0}
        />
        <FloatingOrb
          className="absolute top-[60%] right-[10%] w-64 h-64 bg-cyan-500/[0.04] rounded-full blur-[100px]"
          delay={2}
        />
        <FloatingOrb
          className="absolute bottom-[10%] left-[30%] w-80 h-80 bg-blue-500/[0.04] rounded-full blur-[120px]"
          delay={4}
        />
      </div>

      {/* ─── Navigation ──────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-50 w-full"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-zinc-200 tracking-wide">
              AI Mock Interview
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-medium bg-white/[0.07] hover:bg-white/[0.12] text-zinc-200 px-4 py-2 rounded-lg border border-white/[0.08] hover:border-white/[0.15] transition-all"
            >
              Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero Section ────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20 sm:pb-32">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
              <Zap className="h-3 w-3" />
              AI-Powered Interview Practice
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6"
          >
            <span className="text-white">Ace Every</span>
            <br />
            <span className="gradient-text">Technical Interview</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Upload your resume, face AI-generated interview questions tailored
            to your experience, and get instant performance analytics — all in
            one seamless platform.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-7 py-3.5 rounded-xl font-semibold text-base transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </Link>
            <Link href="/auth/sign-up">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 px-7 py-3.5 rounded-xl font-medium text-base border border-white/[0.08] hover:border-white/[0.15] transition-all cursor-pointer"
              >
                Create Account
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUp}
            className="mt-16 sm:mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { value: 500, suffix: '+', label: 'Questions Generated' },
              { value: 95, suffix: '%', label: 'Accuracy Rate' },
              { value: 10, suffix: 's', label: 'Avg Response Time' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                  <AnimatedStat value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-zinc-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ─── How It Works ────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              How it works
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
              Three Simple Steps
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-[28px] left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

            <StepCard
              step="01"
              title="Upload Resume"
              description="Drop your PDF into our AI scanner. It extracts your skills, experience, and key competencies in seconds."
            />
            <StepCard
              step="02"
              title="Face the Interview"
              description="Answer 5 tailored technical questions in a timed, distraction-free environment that simulates real interviews."
            />
            <StepCard
              step="03"
              title="Get Analytics"
              description="Receive an instant AI-powered score, strengths analysis, improvement areas, and question-by-question feedback."
            />
          </div>
        </motion.div>
      </section>

      {/* ─── Features Grid ───────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
              Everything You Need to Prepare
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={Brain}
              title="AI-Generated Questions"
              description="Questions are tailored to your resume — covering your exact tech stack, projects, and experience level."
              gradient="from-blue-500 to-cyan-400"
              glowColor="rgba(59, 130, 246, 0.12)"
            />
            <FeatureCard
              icon={Target}
              title="Precision Scoring"
              description="Each answer is evaluated for technical accuracy, depth of explanation, and communication clarity."
              gradient="from-purple-500 to-violet-400"
              glowColor="rgba(139, 92, 246, 0.12)"
            />
            <FeatureCard
              icon={BarChart3}
              title="Instant Analytics"
              description="Get a detailed breakdown of strengths, improvement areas, and individual question performance."
              gradient="from-emerald-500 to-green-400"
              glowColor="rgba(16, 185, 129, 0.12)"
            />
            <FeatureCard
              icon={FileText}
              title="Resume Parsing"
              description="Our AI reads your PDF in seconds, extracting skills, technologies, and key experiences automatically."
              gradient="from-orange-500 to-amber-400"
              glowColor="rgba(245, 158, 11, 0.12)"
            />
            <FeatureCard
              icon={Shield}
              title="Secure & Private"
              description="Your data stays yours. Resumes are processed securely and never shared with third parties."
              gradient="from-rose-500 to-pink-400"
              glowColor="rgba(244, 63, 94, 0.12)"
            />
            <FeatureCard
              icon={Zap}
              title="Real-Time Feedback"
              description="No waiting — get your performance results and actionable insights the moment you finish."
              gradient="from-cyan-500 to-blue-400"
              glowColor="rgba(6, 182, 212, 0.12)"
            />
          </div>
        </motion.div>
      </section>

      {/* ─── CTA Section ─────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-panel p-10 sm:p-16 text-center relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/[0.08] rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Ready to{' '}
              <span className="gradient-text">Level Up</span>?
            </h2>
            <p className="text-zinc-500 text-base sm:text-lg max-w-lg mx-auto mb-8">
              Start practicing with AI-generated interview questions today. No
              credit card required — just sign up and go.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Open Dashboard
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </Link>
              <Link href="/auth/sign-up">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 px-8 py-3.5 rounded-xl font-medium text-base border border-white/[0.08] hover:border-white/[0.15] transition-all cursor-pointer"
                >
                  Sign Up Free
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs text-zinc-500">
              AI Mock Interview · Built with Next.js & Supabase
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
