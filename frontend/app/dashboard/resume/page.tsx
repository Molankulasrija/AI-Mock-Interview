'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Upload,
  FileText,
  ArrowLeft,
  Lock,
  Unlock,
  ArrowRight,
  CheckCircle,
  Sparkles,
  X,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function ResumeUpload({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();
  const router = useRouter();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsSuccess(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setIsSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setIsSuccess(false);
    setScanProgress(0);

    // Simulate scan progress
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const [supabaseResult, goApiResult] = await Promise.all([
        supabase.storage.from('resumes').upload(fileName, file),
        fetch('http://localhost:8080/api/analyze-resume', {
          method: 'POST',
          body: formData,
        }),
      ]);

      if (supabaseResult.error) throw supabaseResult.error;

      const aiData = await goApiResult.json();

      clearInterval(progressInterval);
      setScanProgress(100);

      if (aiData.status === 'success') {
        setIsSuccess(true);
      } else {
        alert('Saved to DB, but AI parsing failed: ' + aiData.error);
      }
    } catch (error) {
      console.error('System Error:', error);
      clearInterval(progressInterval);
      alert('An error occurred during processing.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setIsSuccess(false);
    setScanProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-grid bg-radial-glow relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-blue-500/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/[0.06] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back navigation */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
            <Sparkles className="h-3 w-3" />
            AI-Powered Analysis
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            <span className="gradient-text">Upload Your Resume</span>
          </h1>
          <p className="text-zinc-500 text-sm sm:text-base max-w-md mx-auto">
            Drop your PDF below. Our AI will extract key skills and generate
            personalized interview questions.
          </p>
        </motion.div>

        {/* Drop Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`relative glass-panel p-8 sm:p-12 transition-all duration-300 cursor-pointer overflow-hidden ${
              isDragging
                ? 'border-blue-500/50 glow-blue scale-[1.01]'
                : file
                  ? 'border-white/[0.12]'
                  : 'border-dashed border-white/[0.12] hover:border-white/[0.2]'
            }`}
          >
            {/* Scanning Laser Animation */}
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ top: '0%', opacity: 0 }}
                  animate={{ top: ['0%', '100%', '0%'], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 right-0 h-[2px] z-20 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, #3b82f6, transparent)',
                    boxShadow:
                      '0 0 15px rgba(59, 130, 246, 0.6), 0 0 45px rgba(139, 92, 246, 0.3)',
                  }}
                />
              )}
            </AnimatePresence>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center text-center min-h-[200px] sm:min-h-[260px] relative z-10">
              {!file ? (
                <>
                  <motion.div
                    animate={isDragging ? { scale: 1.15, y: -5 } : { scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="h-16 w-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-6"
                  >
                    <Upload className="h-7 w-7 text-zinc-500" />
                  </motion.div>
                  <p className="text-zinc-300 font-medium mb-2">
                    {isDragging ? 'Release to upload' : 'Drag & drop your resume'}
                  </p>
                  <p className="text-xs text-zinc-600">PDF files only — up to 10MB</p>
                </>
              ) : (
                <>
                  {/* File selected state */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-500 ${
                        isSuccess
                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                          : isUploading
                            ? 'bg-blue-500/10 border border-blue-500/20'
                            : 'bg-white/[0.05] border border-white/[0.08]'
                      }`}
                    >
                      {isSuccess ? (
                        <CheckCircle className="h-7 w-7 text-emerald-400" />
                      ) : (
                        <FileText
                          className={`h-7 w-7 ${isUploading ? 'text-blue-400' : 'text-zinc-400'}`}
                        />
                      )}
                    </div>

                    <p className="text-zinc-200 font-medium mb-1">{file.name}</p>
                    <p className="text-xs text-zinc-600 mb-4">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>

                    {/* Progress bar (during scanning) */}
                    {isUploading && (
                      <div className="w-full max-w-xs mb-4">
                        <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                          <span>Scanning document...</span>
                          <span>{Math.round(scanProgress)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${scanProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      {!isUploading && !isSuccess && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}

                      {!isSuccess && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpload();
                          }}
                          disabled={isUploading}
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isUploading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                              />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Analyze Resume
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {isSuccess && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-emerald-400 font-medium mt-2"
                      >
                        ✦ Analysis complete — questions generated!
                      </motion.p>
                    )}
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Proceed Button Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="glass-panel p-6 sm:p-8">
            <p className="text-sm text-zinc-500 mb-5">
              {isSuccess
                ? 'Your personalized session is ready.'
                : 'Upload and analyze your resume to unlock the interview room.'}
            </p>

            <motion.button
              onClick={() => router.push('/dashboard/interview')}
              disabled={!isSuccess}
              whileHover={isSuccess ? { scale: 1.02 } : {}}
              whileTap={isSuccess ? { scale: 0.98 } : {}}
              className={`w-full sm:w-2/3 py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-500 inline-flex items-center justify-center gap-2 cursor-pointer ${
                isSuccess
                  ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white glow-green animate-glow-pulse hover:from-emerald-500 hover:to-green-400'
                  : 'bg-white/[0.03] text-zinc-600 border border-white/[0.06] cursor-not-allowed'
              }`}
            >
              {isSuccess ? (
                <>
                  <Unlock className="h-4 w-4" />
                  Proceed to Interview Room
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Interview Room Locked
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}