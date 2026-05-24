'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';

// Define the TypeScript shape based on our Go prompt
interface AnalyticsData {
  overall_score: number;
  strengths: string[];
  improvements: string[];
  feedback: {
    question: string;
    score: number;
    analysis: string;
  }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/evaluate-interview");
        const json = await res.json();
        
        if (json.status === "success") {
          setData(json.analytics);
        } else {
          setError(json.error || "Failed to load analytics.");
        }
      } catch (err) {
        setError("Could not connect to the grading server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-zinc-900">AI is Analyzing Your Performance</h2>
        <p className="text-zinc-500 mt-2">Evaluating technical depth, accuracy, and clarity...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 text-center flex flex-col items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Analysis Failed</h2>
        <p className="text-zinc-500 mb-6">{error}</p>
        <Link href="/dashboard" className="bg-zinc-900 text-white px-6 py-2 rounded-md hover:bg-zinc-800 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 transition-colors">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">Interview Results</h1>
        </div>

        {/* Top Section: Score & Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Score Card */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8 flex flex-col items-center justify-center text-center">
            <h3 className="text-zinc-500 font-medium mb-4">OVERALL SCORE</h3>
            <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-zinc-50">
              {/* Dynamic ring color based on score */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" 
                  className={data.overall_score >= 80 ? 'text-green-500' : data.overall_score >= 60 ? 'text-yellow-500' : 'text-red-500'}
                  strokeDasharray={`${(data.overall_score / 100) * 289} 289`}
                />
              </svg>
              <span className="text-4xl font-black text-zinc-900">{data.overall_score}</span>
            </div>
            <p className="mt-4 font-medium text-zinc-700">
              {data.overall_score >= 80 ? "Excellent Performance!" : data.overall_score >= 60 ? "Good, but needs review." : "Requires substantial practice."}
            </p>
          </div>

          {/* Strengths & Improvements */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 bg-gradient-to-b from-green-50/50 to-white">
              <div className="flex items-center gap-2 text-green-700 font-bold mb-4">
                <CheckCircle2 size={20} /> Key Strengths
              </div>
              <ul className="space-y-3">
                {data.strengths.map((str, i) => (
                  <li key={i} className="text-zinc-700 text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span> {str}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 bg-gradient-to-b from-orange-50/50 to-white">
              <div className="flex items-center gap-2 text-orange-700 font-bold mb-4">
                <TrendingUp size={20} /> Areas to Improve
              </div>
              <ul className="space-y-3">
                {data.improvements.map((imp, i) => (
                  <li key={i} className="text-zinc-700 text-sm flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span> {imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Detailed Feedback Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="bg-zinc-900 px-6 py-4">
            <h2 className="text-white font-semibold tracking-wide">Detailed Question Breakdown</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {data.feedback.map((item, index) => (
              <div key={index} className="p-6 hover:bg-zinc-50 transition-colors">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="font-semibold text-zinc-900 flex-1">
                    <span className="text-zinc-400 mr-2">Q{index + 1}.</span> 
                    {item.question}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold shrink-0 ${
                    item.score >= 8 ? 'bg-green-100 text-green-700' : item.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.score} / 10
                  </div>
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed bg-white border border-zinc-100 rounded-md p-4 shadow-sm">
                  {item.analysis}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}