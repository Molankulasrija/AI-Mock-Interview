import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { FileText, Mic, BarChart } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-zinc-600">Welcome back, {user.email}</p>
        </header>

        {/* The 3-Option Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Option 1: Upload Resume */}
          <Link href="/dashboard/resume" className="group block bg-white p-6 rounded-xl shadow-sm border border-zinc-200 hover:border-blue-500 hover:shadow-md transition-all">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Upload Resume</h2>
            <p className="text-sm text-zinc-500">Upload your PDF and let our AI parse it to generate custom interview questions.</p>
          </Link>

          {/* Option 2: Start Interview */}
          <Link href="/dashboard/interview" className="group block bg-white p-6 rounded-xl shadow-sm border border-zinc-200 hover:border-green-500 hover:shadow-md transition-all">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mic size={24} />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Start Interview</h2>
            <p className="text-sm text-zinc-500">Connect with the AI voice agent for a real-time mock interview based on your profile.</p>
          </Link>

          {/* Option 3: Analytics */}
          <Link href="/dashboard/analytics" className="group block bg-white p-6 rounded-xl shadow-sm border border-zinc-200 hover:border-purple-500 hover:shadow-md transition-all">
            <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart size={24} />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Analytics</h2>
            <p className="text-sm text-zinc-500">Review your past interview scores, feedback, and skill breakdown charts.</p>
          </Link>

        </div>
      </div>
    </div>
  );
}