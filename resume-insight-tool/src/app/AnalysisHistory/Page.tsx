"use client";

import React, { useState, useEffect } from "react";
import SummaryCard from "../../components/SummaryCard";

interface AnalysisItem {
  id: string;
  fileName: string;
  uploadDate: string;
  insightType: string;
  summary?: string;
  recommendation?: string;
  topWords?: string[];
}

export default function AnalysisHistory() {
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysisHistory();
  }, []);

  const fetchAnalysisHistory = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/insights");
      if (!response.ok) {
        throw new Error("Failed to fetch analysis history");
      }
      const data = await response.json();
      setAnalysisHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f9ff] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analysis History</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f9ff] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analysis History</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchAnalysisHistory}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f9ff] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Analysis History</h1>
        <p className="text-gray-600 mb-8">
          View all your previous resume analyses and insights.
        </p>

        {analysisHistory.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l5 5v9a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
            <p className="text-gray-600">
              Upload your first resume to see analysis results here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {analysisHistory.map((item) => (
              <SummaryCard
                key={item.id}
                id={item.id}
                fileName={item.fileName}
                uploadDate={item.uploadDate}
                insightType={item.insightType}
                summary={item.summary}
                recommendation={item.recommendation}
                topWords={item.topWords}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
