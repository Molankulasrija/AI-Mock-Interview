import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ArrowLeft, Mic, Volume2, Cpu, Terminal } from 'lucide-react';

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Stage */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-zinc-200 p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Mic size={40} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-4">Ready for your Session?</h1>
            <p className="text-zinc-500 mb-8 max-w-md">
              The AI Agent has analyzed your resume. Ensure you are in a quiet environment. The session will simulate a technical screening.
            </p>
            <button className="bg-green-600 text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg">
              Initialize Voice Agent
            </button>
          </div>

          {/* Side Panel: Context & Hardware */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
              <h3 className="font-semibold text-zinc-900 mb-4">Target Stack</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-xs font-medium flex items-center gap-1"><Cpu size={12}/> Embedded Systems</span>
                <span className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-xs font-medium flex items-center gap-1"><Terminal size={12}/> C/C++</span>
                <span className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-xs font-medium">DevOps (Docker/K8s)</span>
                <span className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-xs font-medium">System Design</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
              <h3 className="font-semibold text-zinc-900 mb-4">System Check</h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-zinc-600"><Mic size={16} /> Microphone</span>
                  <span className="text-green-600 font-medium">Detected</span>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-zinc-600"><Volume2 size={16} /> Speaker</span>
                  <span className="text-green-600 font-medium">Detected</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}