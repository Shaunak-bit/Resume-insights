"use client";

import React from "react";

interface SummaryCardProps {
  id: string;
  fileName: string;
  uploadDate: string;
  insightType: string;
  summary?: string;
  recommendation?: string;
  topWords?: string[];
}

export default function SummaryCard({
  id,
  fileName,
  uploadDate,
  insightType,
  summary,
  recommendation,
  topWords,
}: SummaryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case "AI Summary":
        return "bg-green-100 text-green-800";
      case "Frequent Words":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <svg
            className="w-8 h-8 text-gray-500"
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
          <div>
            <h3 className="font-semibold text-gray-900">{fileName}</h3>
            <p className="text-sm text-gray-500">{formatDate(uploadDate)}</p>
          </div>
        </div>
        <span
          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getInsightTypeColor(
            insightType
          )}`}
        >
          {insightType}
        </span>
      </div>

      {summary && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Summary:</h4>
          <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {recommendation && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Recommendation:</h4>
          <p className="text-gray-700 text-sm leading-relaxed">{recommendation}</p>
        </div>
      )}

      {topWords && topWords.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Top Words:</h4>
          <div className="flex flex-wrap gap-2">
            {topWords.map((word, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => {
            // Navigate to detailed view or open modal
            console.log("View details for:", id);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200 text-sm"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
