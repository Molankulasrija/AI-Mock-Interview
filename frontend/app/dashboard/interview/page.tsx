import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import InterviewRoom from './InterviewRoom';

export default async function InterviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <InterviewRoom />;
}