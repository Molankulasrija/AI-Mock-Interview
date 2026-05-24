'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  Send,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Zap,
  Brain,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function InterviewRoom() {
  const router = useRouter();
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  // Fetch questions when they click start
  const startInterview = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/get-questions');
      const data = await res.json();
      if (data.status === 'success') {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(''));
        setIsStarted(true);
      } else {
        alert('Could not load questions. Did you upload your resume?');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to backend API.');
    }
  };

  // Timer logic
  useEffect(() => {
    if (!isStarted || timeLeft <= 0 || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submitInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, timeLeft, isSubmitting]);

  const handleNext = () => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = currentAnswer;
    setAnswers(updatedAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer(updatedAnswers[currentIndex + 1] || '');
    }
  };

  const submitInterview = async () => {
    setIsSubmitting(true);

    const finalAnswers = [...answers];
    finalAnswers[currentIndex] = currentAnswer;

    try {
      const res = await fetch('http://localhost:8080/api/save-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        alert('Interview complete! Answers saved to server.');
        router.push('/dashboard/analytics');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save answers.');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isTimeLow = timeLeft < 300;
  const isTimeCritical = timeLeft < 120;

  // ─── State 1: The Waiting Room ──────────────────────────
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] bg-grid bg-radial-glow relative overflow-hidden flex items-center justify-center p-4">
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/[0.05] rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/[0.05] rounded-full blur-[150px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 glass-panel p-8 sm:p-12 text-center max-w-lg w-full"
        >
          {/* Back link */}
          <div className="absolute top-4 left-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          </div>

          {/* Animated brain icon */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6"
          >
            <Brain className="h-9 w-9 text-emerald-400" />
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
            Ready for your Session?
          </h1>
          <p className="text-zinc-500 text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
            You have <span className="text-zinc-300 font-semibold">15 minutes</span> to
            answer 5 technical questions generated from your profile. Once the timer hits
            zero, your session auto-submits.
          </p>

          <motion.button
            onClick={startInterview}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-500 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:from-emerald-500 hover:to-green-400 transition-all glow-green cursor-pointer"
          >
            <Zap className="h-4 w-4" />
            Begin Technical Screen
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ─── State 2: The Interview (Focus Mode) ──────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Subtle ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/[0.04] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
        </motion.div>

        {/* Top Bar: Progress + Timer */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel p-4 sm:p-5 mb-6"
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>
              {/* Step indicators */}
              <div className="hidden sm:flex gap-1.5">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-6 rounded-full transition-all duration-500 ${
                      i < currentIndex
                        ? 'bg-emerald-500'
                        : i === currentIndex
                          ? 'bg-blue-500'
                          : 'bg-white/[0.08]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <motion.div
              animate={
                isTimeCritical
                  ? { scale: [1, 1.05, 1] }
                  : {}
              }
              transition={
                isTimeCritical
                  ? { duration: 1, repeat: Infinity }
                  : {}
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono font-bold text-sm transition-all duration-700 ${
                isTimeCritical
                  ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                  : isTimeLow
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/15'
                    : 'bg-white/[0.05] text-zinc-400 border border-white/[0.08]'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              {formatTime(timeLeft)}
            </motion.div>
          </div>

          {/* Glowing progress bar */}
          <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)',
              }}
            />
          </div>
        </motion.div>

        {/* Question & Answer Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel overflow-hidden"
          >
            {/* AI Question Section */}
            <div className="p-6 sm:p-8 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"
                >
                  <Brain className="h-4 w-4 text-blue-400" />
                </motion.div>
                <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
                  AI is asking...
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-semibold text-zinc-100 leading-relaxed">
                {questions[currentIndex]}
              </h2>
            </div>

            {/* Answer Area */}
            <div className="p-6 sm:p-8">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-48 sm:h-56 p-4 sm:p-5 bg-white/[0.02] border border-white/[0.08] rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all duration-300 text-sm sm:text-base leading-relaxed"
              />

              {/* Footer actions */}
              <div className="mt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <p className="text-xs text-zinc-600 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Be concise and specific in your response.
                </p>

                {currentIndex < questions.length - 1 ? (
                  <motion.button
                    onClick={handleNext}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 px-6 py-2.5 rounded-xl font-medium text-sm transition-colors border border-white/[0.08] hover:border-white/[0.15] cursor-pointer"
                  >
                    Next Question
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={submitInterview}
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-blue cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Saving...' : 'Submit Interview'}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}