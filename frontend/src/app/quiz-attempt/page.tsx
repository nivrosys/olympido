"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { 
  Clock, 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Bookmark, 
  Flame, 
  Award,
  QrCode,
  Share2,
  X
} from "lucide-react";

interface ExamQuestion {
  id: number;
  prompt: string;
  category: string;
  options: string[];
  points: number;
}

export default function QuizAttemptPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(7140); // 119 mins in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sampleQuestions: ExamQuestion[] = [
    {
      id: 1,
      prompt: "A photon collides elastically with a stationary electron at rest. If the scattering angle is 90 degrees, what is the Compton shift in wavelength Δλ?",
      category: "Quantum Mechanics",
      options: [
        "h / (m_e * c)",
        "2h / (m_e * c)",
        "h / (2 * m_e * c)",
        "Zero"
      ],
      points: 25,
    },
    {
      id: 2,
      prompt: "Consider an infinite ladder network of identical 2Ω resistors and 1Ω series resistors. What is the equivalent resistance between input terminals A and B?",
      category: "Electromagnetism",
      options: [
        "2.0 Ω",
        "2.73 Ω",
        "1.41 Ω",
        "3.14 Ω"
      ],
      points: 30,
    },
    {
      id: 3,
      prompt: "A uniform solid cylinder of mass M and radius R rolls without slipping down an incline of angle θ. What is its linear acceleration a along the plane?",
      category: "Classical Mechanics",
      options: [
        "(2/3) g sin(θ)",
        "(1/2) g sin(θ)",
        "(3/4) g sin(θ)",
        "g sin(θ)"
      ],
      points: 25,
    },
    {
      id: 4,
      prompt: "In thermodynamics, what is the maximum theoretical Carnot efficiency of a heat engine operating between 600K and 300K reservoirs?",
      category: "Thermodynamics",
      options: [
        "50%",
        "66.7%",
        "33.3%",
        "75%"
      ],
      points: 20,
    },
    {
      id: 5,
      prompt: "What is the Schwarzschild radius of a non-rotating black hole having twice the mass of the Sun (M = 2 M_sun)?",
      category: "Astrophysics & Relativity",
      options: [
        "~ 5.9 km",
        "~ 11.8 km",
        "~ 2.95 km",
        "~ 29.5 km"
      ],
      points: 35,
    },
  ];

  // Timer tick
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (optIdx: number) => {
    setAnswers({ ...answers, [currentIdx]: optIdx });
  };

  const toggleFlag = () => {
    setFlagged({ ...flagged, [currentIdx]: !flagged[currentIdx] });
  };

  const q = sampleQuestions[currentIdx];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      
      {/* Contest Top Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-xs font-semibold">
              <ArrowLeft className="w-4 h-4" /> Exit
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-gray-900 truncate max-w-xs sm:max-w-md">
                National Youth Physics Olympiad 2026 • Live Arena
              </h1>
              <span className="text-[11px] text-purple-700 font-semibold">
                Division 1 • Verified Institutional Proctoring
              </span>
            </div>
          </div>

          {/* Real-time Timer Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-mono font-bold text-sm sm:text-base">
              <Clock className="w-4 h-4 text-purple-600 animate-pulse" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            <button
              onClick={() => setIsSubmitted(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition-colors shadow-xs"
            >
              Finish & Submit
            </button>
          </div>

        </div>
      </header>

      {/* Main Arena Layout */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Question Pane */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-xs font-bold font-mono">
                  Question {currentIdx + 1} of {sampleQuestions.length}
                </span>
                <span className="text-xs text-gray-400 font-medium">({q.category})</span>
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                +{q.points} Points
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-relaxed mb-6">
              {q.prompt}
            </h2>

            {/* Multiple Choice Options */}
            <div className="space-y-3">
              {q.options.map((opt, idx) => {
                const isSelected = answers[currentIdx] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "border-purple-600 bg-purple-50/60 text-purple-950 font-bold shadow-xs scale-[1.01]"
                        : "border-gray-200 hover:border-purple-200 hover:bg-gray-50/60 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center font-mono ${
                        isSelected ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-3">
            <button
              onClick={toggleFlag}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                flagged[currentIdx]
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{flagged[currentIdx] ? "Review Later (Flagged)" : "Flag for Review"}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-40 text-xs font-semibold text-gray-700"
              >
                Previous
              </button>
              <button
                disabled={currentIdx === sampleQuestions.length - 1}
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <span>Save & Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Question Navigation Matrix */}
        <div className="w-full lg:w-80 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 shadow-xs">
            <h3 className="font-extrabold text-sm text-gray-900 mb-3">
              Problem Palette ({answeredCount}/{sampleQuestions.length} Answered)
            </h3>

            <div className="grid grid-cols-5 gap-2.5 mb-5">
              {sampleQuestions.map((item, idx) => {
                const isAnswered = answers[idx] !== undefined;
                const isCurrent = currentIdx === idx;
                const isFlagged = flagged[idx];

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-10 rounded-xl text-xs font-bold font-mono transition-all relative ${
                      isCurrent
                        ? "ring-2 ring-purple-600 bg-purple-600 text-white shadow-xs"
                        : isAnswered
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-[11px] text-gray-500 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-purple-600" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-amber-400" />
                <span>Marked for Review</span>
              </div>
            </div>
          </div>

          {/* Fair Play Notice */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Olympiad integrity proctoring active. Do not switch tabs or open auxiliary windows. Results are evaluated automatically at submission.
            </p>
          </div>
        </div>

      </main>

      {/* Completion & Instant Scorecard Modal */}
      {isSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border-2 border-purple-200 animate-in zoom-in-95">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">
                Olympiad Completed!
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Your submission has been evaluated. Your official score and rating delta are generated.
              </p>
            </div>

            {/* Scorecard Preview */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-purple-700 font-semibold">
                <span>HASH: 0x4a9b...7e21</span>
                <span className="text-emerald-700 font-bold">✓ Official Scorecard</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-white rounded-xl shadow-2xs">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Accuracy</span>
                  <span className="text-lg font-extrabold text-gray-900">100%</span>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-2xs">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Points Won</span>
                  <span className="text-lg font-extrabold text-amber-600">+1,500</span>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-2xs">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Rating Delta</span>
                  <span className="text-lg font-extrabold text-emerald-600">+92</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-white rounded-xl">
                <QrCode className="w-10 h-10 text-gray-700" />
                <div className="text-[11px] text-gray-500">
                  <strong className="text-gray-900 block">QR Cryptographic Verification</strong>
                  Public verification link active on Olympido Registry.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs text-center transition-colors shadow-md"
              >
                Return to Arena & Leaderboards
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
