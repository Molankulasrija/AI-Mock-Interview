'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center bg-radial-glow">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin relative z-10" />
        </div>
        <p className="text-zinc-400 font-medium tracking-wide text-sm">Verifying session...</p>
      </motion.div>
    </div>
  );
}