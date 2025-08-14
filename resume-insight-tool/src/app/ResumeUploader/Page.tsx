"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function ResumeUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        setError("Only PDF files are accepted");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + Math.random() * 5 : prev));
    }, 200);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload-resume  ", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`);
      }

      const data = await res.json();
      setProgress(100);
      setTimeout(() => setProgress(0), 300);

      const analysisText = `
## Resume Analysis

**File Name:** ${data.fileName}
**Uploaded:** ${new Date(data.uploadDate).toLocaleString()}
**Insight Type:** ${data.insightType}

**Summary:** ${data.summary || "N/A"}
**Recommendation:** ${data.recommendation || "N/A"}
${
  data.topWords && data.topWords.length > 0
    ? "**Top Words:** " + data.topWords.join(", ")
    : ""
}
      `;

      setAnalysis(analysisText);
    } catch (err: any) {
      setError(err.message || "Failed to analyze resume");
    } finally {
      clearInterval(interval);
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysis(null);
    setError(null);
    setProgress(0);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-center shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800">
          AI Resume Analyzer
        </h1>
      </header>

      <div className="min-h-screen bg-gradient-to-b from-[#f0f4ff] to-[#ffffff] py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3 animate-slideInDown">
              Upload Your Resume
            </h2>
            <p className="text-gray-600 text-lg max-w-xl mx-auto leading-relaxed">
              Get instant AI-powered insights on your resume. Upload your PDF to
              receive a comprehensive summary, key skills, and actionable
              recommendations.
            </p>
          </header>

          <section>
            {!file && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 transform max-w-xl mx-auto ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50 scale-105 shadow-lg"
                    : "border-gray-300 hover:border-blue-400 hover:scale-105 hover:shadow-md"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="bg-gray-100 rounded-full p-5 animate-bounce">
                    <svg
                      className="w-12 h-12 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900 text-lg">
                    Upload Resume PDF
                  </p>
                  <p className="text-gray-600 text-base">
                    Drag & drop your PDF or{" "}
                    <span className="text-blue-600 underline cursor-pointer">
                      browse
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Only PDF files are accepted
                  </p>
                </div>
              </div>
            )}

            {file && (
              <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between mb-4 max-w-xl mx-auto shadow-md animate-fadeIn">
                <div className="flex items-center space-x-4">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-700">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200 transform hover:scale-110"
                >
                  Remove
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm text-center max-w-xl mx-auto shadow-sm">
                {error}
              </div>
            )}

            {file && !analysis && (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className={`mt-6 w-full max-w-xl mx-auto py-3 px-6 rounded-lg font-medium text-white transition-all duration-300 transform ${
                    isUploading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-lg"
                  } block`}
                >
                  {isUploading ? "Analyzing..." : "Analyze Resume"}
                </button>

                {isUploading && (
                  <div className="mt-4 w-full max-w-xl mx-auto bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className="h-4 bg-blue-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </>
            )}
          </section>

          {analysis && (
            <section className="mt-12 max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-xl animate-fadeInUp">
              <div
                className="prose max-w-none text-gray-800"
                dangerouslySetInnerHTML={{
                  __html: analysis.replace(/\n/g, "<br />"),
                }}
              />
              <button
                onClick={handleReset}
                className="mt-6 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
              >
                Upload Another Resume
              </button>
            </section>
          )}
        </div>
      </div>
    </>
  );
}