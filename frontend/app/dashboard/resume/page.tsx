'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation'; // 🔥 Import the Next.js router

export default function ResumeUpload({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // 🔥 State to unlock the button
  
  const supabase = createClient();
  const router = useRouter(); // 🔥 Initialize the router

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    setIsUploading(true);
    setIsSuccess(false); // Reset success state on new upload

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    const formData = new FormData();
    formData.append("resume", file);

    try {
      console.log("Starting parallel upload and AI parsing...");

      const [supabaseResult, goApiResult] = await Promise.all([
        supabase.storage.from('resumes').upload(fileName, file),
        fetch("http://localhost:8080/api/analyze-resume", {
          method: "POST",
          body: formData, 
        })
      ]);

      if (supabaseResult.error) throw supabaseResult.error;
      
      const aiData = await goApiResult.json();
      
      if (aiData.status === "success") {
        console.log("Questions generated locally:", aiData.questions);
        alert("Success! The AI has generated and saved your Questions.txt file.");
        
        // 🔥 Unlock the Proceed button instead of reloading the page
        setIsSuccess(true); 
      } else {
        alert("Saved to DB, but AI parsing failed: " + aiData.error);
      }

    } catch (error) {
      console.error("System Error:", error);
      alert("An error occurred during processing.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-zinc-300 rounded-lg p-10 flex flex-col items-center justify-center text-center">
      
      {/* Upload Section */}
      <input 
        type="file" 
        accept=".pdf"
        onChange={(e) => {
          setFile(e.target.files?.[0] || null);
          setIsSuccess(false); // Reset if they pick a new file
        }}
        className="mb-4 text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 cursor-pointer"
      />
      <button 
        onClick={handleUpload}
        disabled={isUploading || !file || isSuccess}
        className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-8"
      >
        {isUploading ? "Processing Parallel Tasks..." : (isSuccess ? "Analysis Complete" : "Analyze Resume & Generate Questions")}
      </button>

      {/* 🔥 The New Conditional Navigation Button 🔥 */}
      <div className="w-full pt-8 border-t border-zinc-200">
        <p className="text-sm font-medium mb-4">
          {isSuccess 
            ? "Ready! The AI has configured your personalized session." 
            : "Upload your resume to unlock the interview room."}
        </p>
        <button 
          onClick={() => router.push('/dashboard/interview')}
          disabled={!isSuccess}
          className={`w-full md:w-2/3 py-3 px-6 rounded-lg font-bold text-lg transition-all
            ${isSuccess 
              ? "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5" 
              : "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200"
            }`}
        >
          Proceed to Interview Room
        </button>
      </div>

    </div>
  );
}