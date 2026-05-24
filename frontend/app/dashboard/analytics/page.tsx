'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Award,
  Sparkles,
} from 'lucide-react';

interface AnalyticsData {
  overall_score: number;
  strengths: string[];
  improvements: string[];
  feedback: {
    question: string;
    score: number;
    analysis: string;
  }[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

// Animated counter hook
function useAnimatedCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

// Score Ring Component
function ScoreRing({ score }: { score: number }) {
  const animatedScore = useAnimatedCounter(score);
  const circumference = 2 * Math.PI * 54; // radius=54
  const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;

  const scoreColor =
    score >= 80
      ? { ring: '#10b981', glow: 'rgba(16, 185, 129, 0.3)', label: 'Excellent Performance!' }
      : score >= 60
        ? { ring: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)', label: 'Good, room for growth.' }
        : { ring: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)', label: 'Needs more practice.' };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 sm:w-48 sm:h-48">
        {/* Outer glow */}
        <div
          className="absolute inset-2 rounded-full blur-xl opacity-40"
          style={{ background: scoreColor.glow }}
        />

        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Track */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          {/* Animated ring */}
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="transparent"
            stroke={scoreColor.ring}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            style={{
              filter: `drop-shadow(0 0 8px ${scoreColor.glow})`,
            }}
          />
        </svg>

        {/* Center number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl sm:text-5xl font-black text-white tabular-nums">
            {animatedScore}
          </span>
          <span className="text-xs text-zinc-500 font-medium mt-0.5">out of 100</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-4 flex items-center gap-1.5"
      >
        <Award className="h-4 w-4" style={{ color: scoreColor.ring }} />
        <span className="text-sm font-medium text-zinc-400">{scoreColor.label}</span>
      </motion.div>
    </div>
  );
}

// Accordion Item Component
function AccordionItem({
  item,
  index,
}: {
  item: { question: string; score: number; analysis: string };
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const scoreBadge =
    item.score >= 8
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : item.score >= 5
        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        : 'bg-red-500/10 text-red-400 border-red-500/20';

  return (
    <motion.div
      variants={fadeUp}
      className="border-b border-white/[0.06] last:border-b-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 sm:px-6 py-4 sm:py-5 flex justify-between items-center gap-4 hover:bg-white/[0.02] transition-colors text-left cursor-pointer"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-xs font-mono text-zinc-600 mt-0.5 shrink-0">
            Q{index + 1}
          </span>
          <h3 className="text-sm font-medium text-zinc-300 leading-relaxed truncate">
            {item.question}
          </h3>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${scoreBadge}`}
          >
            {item.score}/10
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="h-4 w-4 text-zinc-600" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-5 pl-10 sm:pl-14">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
                <p className="text-sm text-zinc-400 leading-relaxed">{item.analysis}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Analytics Page ──────────────────────────────────
export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/evaluate-interview');
        const json = await res.json();

        if (json.status === 'success') {
          setData(json.analytics);
        } else {
          setError(json.error || 'Failed to load analytics.');
        }
      } catch (err) {
        setError('Could not connect to the grading server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // ─── Loading State ───
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] bg-radial-glow flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl" />
            <div className="relative h-16 w-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Loader2 className="h-7 w-7 text-blue-400 animate-spin" />
            </div>
          </motion.div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-white mb-1">
              AI is Analyzing Your Performance
            </h2>
            <p className="text-sm text-zinc-500">
              Evaluating technical depth, accuracy, and clarity...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Error State ───
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] bg-radial-glow flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 sm:p-10 text-center max-w-md"
        >
          <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Analysis Failed</h2>
          <p className="text-sm text-zinc-500 mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors border border-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  // ─── Results View ───
  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-grid bg-radial-glow relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[500px] h-[500px] bg-purple-500/[0.05] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/[0.04] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <h1 className="text-lg sm:text-xl font-bold gradient-text">
              Interview Results
            </h1>
          </div>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show">
          {/* Top Section: Score + Summaries */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mb-6">
            {/* Score Ring Card */}
            <motion.div
              variants={fadeUp}
              className="glass-panel p-6 sm:p-8 flex flex-col items-center justify-center"
            >
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-6">
                Overall Score
              </h3>
              <ScoreRing score={data.overall_score} />
            </motion.div>

            {/* Strengths & Improvements */}
            <motion.div
              variants={fadeUp}
              className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              {/* Strengths */}
              <div className="glass-panel p-5 sm:p-6 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at top left, rgba(16, 185, 129, 0.08), transparent 60%)',
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-4">
                    <CheckCircle2 className="h-4 w-4" />
                    Key Strengths
                  </div>
                  <ul className="space-y-3">
                    {data.strengths.map((str, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="text-sm text-zinc-400 flex items-start gap-2.5 leading-relaxed"
                      >
                        <span
                          className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"
                          style={{
                            boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)',
                          }}
                        />
                        {str}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Improvements */}
              <div className="glass-panel p-5 sm:p-6 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at top left, rgba(245, 158, 11, 0.08), transparent 60%)',
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm mb-4">
                    <TrendingUp className="h-4 w-4" />
                    Areas to Improve
                  </div>
                  <ul className="space-y-3">
                    {data.improvements.map((imp, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="text-sm text-zinc-400 flex items-start gap-2.5 leading-relaxed"
                      >
                        <span
                          className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0"
                          style={{
                            boxShadow: '0 0 6px rgba(245, 158, 11, 0.5)',
                          }}
                        />
                        {imp}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Detailed Question Breakdown */}
          <motion.div variants={fadeUp} className="glass-panel overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-zinc-300 tracking-wide">
                Detailed Question Breakdown
              </h2>
            </div>
            <motion.div variants={container}>
              {data.feedback.map((item, index) => (
                <AccordionItem key={index} item={item} index={index} />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}