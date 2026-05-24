'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Send, AlertCircle } from 'lucide-react';

export default function InterviewRoom() {
  const router = useRouter();
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes = 900 seconds

  // Fetch questions when they click start
  const startInterview = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/get-questions");
      const data = await res.json();
      if (data.status === "success") {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(''));
        setIsStarted(true);
      } else {
        alert("Could not load questions. Did you upload your resume?");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend API.");
    }
  };

  // Timer logic
  useEffect(() => {
    if (!isStarted || timeLeft <= 0 || isSubmitting) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submitInterview(); // Auto-submit when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, isSubmitting]);

  const handleNext = () => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = currentAnswer;
    setAnswers(updatedAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer(updatedAnswers[currentIndex + 1] || '');
    }
  };

  const submitInterview = async () => {
    setIsSubmitting(true);
    
    // Save the final answer
    const finalAnswers = [...answers];
    finalAnswers[currentIndex] = currentAnswer;

    try {
      const res = await fetch("http://localhost:8080/api/save-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      
      const data = await res.json();
      if (data.status === "success") {
        alert("Interview complete! Answers saved to server.");
        router.push('/dashboard/analytics'); // Move to phase 3!
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save answers.");
    }
  };

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // State 1: The Waiting Room
  if (!isStarted) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-zinc-900 mb-4">Ready for your Session?</h1>
        <p className="text-zinc-500 mb-8 max-w-md">
          You have 15 minutes to answer 5 technical questions generated from your profile. Once the timer hits zero, your session auto-submits.
        </p>
        <button 
          onClick={startInterview}
          className="bg-green-600 text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-green-700 transition-all shadow-md"
        >
          Begin Technical Screen
        </button>
      </div>
    );
  }

  // State 2: The Interview
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      {/* Header Bar */}
      <div className="bg-zinc-900 px-6 py-4 flex justify-between items-center">
        <span className="text-zinc-300 font-medium tracking-wide text-sm">
          QUESTION {currentIndex + 1} OF {questions.length}
        </span>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-mono font-bold ${timeLeft < 300 ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-300'}`}>
          <Clock size={16} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question Context */}
      <div className="p-8">
        <h2 className="text-xl font-semibold text-zinc-900 mb-6 leading-relaxed">
          {questions[currentIndex]}
        </h2>

        {/* Text Area */}
        <textarea
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full h-48 p-4 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
        />

        {/* Footer Actions */}
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-zinc-400 flex items-center gap-1">
            <AlertCircle size={14}/> Be concise and specific.
          </p>
          
          {currentIndex < questions.length - 1 ? (
            <button 
              onClick={handleNext}
              className="bg-zinc-900 text-white px-6 py-2 rounded-md font-medium hover:bg-zinc-800 transition-colors"
            >
              Next Question
            </button>
          ) : (
            <button 
              onClick={submitInterview}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Send size={16} />
              {isSubmitting ? "Saving..." : "Submit Interview"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}