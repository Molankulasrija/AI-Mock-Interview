import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ResumeUpload from '../ResumeUpload'; 
import { ArrowLeft, FileCheck } from 'lucide-react';
import Link from 'next/link';

export default async function ResumePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check Supabase Storage to see if a file exists with this user's ID
  const { data: files, error } = await supabase.storage
    .from('resumes')
    .list('', { search: user.id });

  const hasResume = files && files.length > 0;
  const existingFile = hasResume ? files : null;

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 transition-colors">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
            <h1 className="text-2xl font-bold text-zinc-900">Document Parsing</h1>
            <p className="text-sm text-zinc-500 mt-1">Upload your profile to configure the AI system constraints.</p>
          </div>
          <div className="p-6">
            
            {/* CONDITIONAL RENDERING */}
            {hasResume ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center flex flex-col items-center justify-center">
                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <FileCheck size={32} />
                </div>
                <h2 className="text-xl font-bold text-green-900 mb-2">Your PDF is already with us!</h2>
                <p className="text-green-700 mb-6">File stored as: {existingFile?.name}</p>
                <Link href="/dashboard/interview" className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors">
                  Proceed to Interview
                </Link>
              </div>
            ) : (
              <ResumeUpload userId={user.id} />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}