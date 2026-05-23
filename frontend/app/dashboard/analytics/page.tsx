import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 transition-colors mb-4">
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-zinc-900">Performance Telemetry</h1>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-zinc-200 shadow-sm flex items-center gap-3">
            <span className="text-sm text-zinc-500">Overall Score:</span>
            <span className="text-2xl font-bold text-purple-600">84/100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Mock Metric Cards */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-zinc-700">DSA & Logic</h3>
              <CheckCircle2 className="text-green-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-zinc-900 mb-1">Strong</p>
            <p className="text-sm text-zinc-500">Excellent algorithmic approach.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-zinc-700">Low-Level Concepts</h3>
              <AlertCircle className="text-amber-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-zinc-900 mb-1">Review Needed</p>
            <p className="text-sm text-zinc-500">Brush up on memory allocation in C.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-zinc-700">Communication</h3>
              <TrendingUp className="text-blue-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-zinc-900 mb-1">Improving</p>
            <p className="text-sm text-zinc-500">+12% clarity from last session.</p>
          </div>
        </div>

        {/* Detailed Feedback Section */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">Latest Session Transcript & AI Feedback</h2>
          <div className="space-y-6">
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm font-semibold text-zinc-900 mb-1">Question 1: Explain the difference between Docker and Kubernetes.</p>
              <p className="text-sm text-zinc-600 mb-2">Your Answer: "Docker is for containerizing applications, while Kubernetes is an orchestration tool to manage multiple containers..."</p>
              <div className="bg-purple-50 p-3 rounded-md">
                <p className="text-xs font-semibold text-purple-700">AI Feedback:</p>
                <p className="text-xs text-purple-900 mt-1">Good high-level summary. Next time, mention specific orchestration benefits like self-healing or scaling to demonstrate deeper operational knowledge.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}