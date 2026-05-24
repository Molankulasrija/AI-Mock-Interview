import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import InterviewRoom from './InterviewRoom'; // 🔥 Import the new component

export default async function InterviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 transition-colors">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>

        {/* Render the interactive room here */}
        <InterviewRoom />

      </div>
    </div>
  );
}