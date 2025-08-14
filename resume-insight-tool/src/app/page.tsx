"use client";

import { useState } from "react";
import { Upload, List } from "lucide-react"; // Lucide icons
import ResumeUploader from "./ResumeUploader/Page";
import AnalysisHistory from "./AnalysisHistory/Page";

export default function Page() {
  const [view, setView] = useState<"upload" | "history">("upload");

  return (
    <div>
      <nav className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <img src="/file.svg" alt="Logo" className="w-8 h-8" />
          <h1 className="text-blue-700 font-bold text-lg">AI-Powered Resume Insight Tool</h1>
        </div>
        <div className="flex items-center space-x-6 text-gray-700">
          <button
            onClick={() => setView("upload")}
            className={`flex items-center space-x-2 cursor-pointer ${
              view === "upload" ? "text-blue-600 font-semibold" : "hover:text-blue-600"
            }`}
          >
            <Upload className="h-5 w-5" />
            <span>Upload</span>
          </button>
          <button
            onClick={() => setView("history")}
            className={`flex items-center space-x-2 cursor-pointer ${
              view === "history" ? "text-blue-600 font-semibold" : "hover:text-blue-600"
            }`}
          >
            <List className="h-5 w-5" />
            <span>History</span>
          </button>
        </div>
      </nav>

      <main>
        {view === "upload" && <ResumeUploader />}
        {view === "history" && <AnalysisHistory />}
      </main>
    </div>
  );
}
