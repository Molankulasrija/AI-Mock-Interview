import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
      <Loader2 className="animate-spin text-zinc-500 mb-4" size={40} />
      <p className="text-zinc-500 font-medium">Verifying session...</p>
    </div>
  );
}