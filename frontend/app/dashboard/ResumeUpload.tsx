'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ResumeUpload({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const supabase = createClient();

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      console.log("Sending resume to AI analysis...");

      const goApiResult = await fetch("http://localhost:8080/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const aiData = await goApiResult.json();
      if (aiData.status === "success") {
        console.log("AI analysis complete! Questions generated:", aiData.questions);
        alert("Resume analyzed successfully! Questions: " + aiData.questions.join(", "));
        // Optionally refresh page
        // window.location.reload(); 
      } else {
        alert("AI analysis failed: " + (aiData.error || "Unknown error"));
      }

    } catch (error) {
      console.error("Error:", error);
      alert("Failed to analyze resume. Is the Go server running on localhost:8080?");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-zinc-300 rounded-lg p-10 flex flex-col items-center justify-center text-center">
      <input 
        type="file" 
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mb-4 text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 cursor-pointer"
      />
      <button 
        onClick={handleUpload}
        disabled={isUploading || !file}
        className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? "Processing Parallel Tasks..." : "Analyze Resume & Generate Questions"}
      </button>
    </div>
  );
}