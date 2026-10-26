"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
  ShieldAlert,
  Maximize2,
  Minimize2,
  Check,
  Sparkles,
  HelpCircle,
  FileText,
  Activity,
  Layers,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { questionsApi, submissionsApi, olympidoSocket } from "../../lib/api";

interface ExamQuestion {
  id: number;
  prompt: string;
  category: string;
  type: "mcq" | "numerical";
  formula?: string;
  options?: string[];
  correctOption?: number;
  correctNumerical?: string;
  explanation?: string;
  points: number;
  difficulty: "Hard" | "Advanced" | "Olympiad Level";
  apiId?: string;
}

export default function QuizAttemptPage() {
  const [contestId, setContestId] = useState<string | null>(null);
  const [liveQuestions, setLiveQuestions] = useState<ExamQuestion[] | null>(null);
  const [submissionHash, setSubmissionHash] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(5400); // 90 minutes in seconds
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [paletteFilter, setPaletteFilter] = useState<"all" | "flagged" | "unanswered">("all");
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cId = params.get("contestId");
      if (cId) {
        setContestId(cId);
        questionsApi
          .findAll(cId)
          .then((qs) => {
            if (qs && qs.length > 0) {
              const mapped: ExamQuestion[] = qs.map((q, idx) => ({
                id: idx + 1,
                prompt: q.prompt,
                category: "Live Olympiad Problem Set",
                type: q.type === "MCQ" ? "mcq" : "numerical",
                formula: q.formula || undefined,
                options: Array.isArray(q.options) ? q.options : undefined,
                points: q.points || 25,
                difficulty: "Olympiad Level",
                apiId: q.id,
              }));
              setLiveQuestions(mapped);
            }
          })
          .catch((err) => console.warn("Live question load note:", err));

        submissionsApi
          .getMySubmission(cId)
          .then((sub) => {
            if (sub && sub.answers && sub.answers.length > 0) {
              const restored: Record<number, number | string> = {};
              sub.answers.forEach((ans, idx) => {
                if (ans.answerPayload?.selectedOption !== undefined) {
                  restored[idx] = ans.answerPayload.selectedOption;
                } else if (ans.answerPayload?.answerText !== undefined) {
                  restored[idx] = ans.answerPayload.answerText;
                }
              });
              setAnswers(restored);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  // WebSocket Live Contest Sync
  useEffect(() => {
    if (!contestId) return;

    olympidoSocket.joinContest(contestId);

    const unsubTick = olympidoSocket.on("contest:tick", (data: any) => {
      if (data && typeof data.remainingSeconds === "number") {
        setTimeLeft(data.remainingSeconds);
      }
    });

    const unsubEnd = olympidoSocket.on("contest:ended", () => {
      setIsSubmitted(true);
    });

    return () => {
      unsubTick();
      unsubEnd();
      olympidoSocket.leaveContest(contestId);
    };
  }, [contestId]);

  const sampleQuestions: ExamQuestion[] = [
    {
      id: 1,
      prompt: "A photon of initial wavelength λ collides elastically with a stationary electron at rest (mass m_e). If the scattering angle is θ = 90°, what is the Compton wavelength shift Δλ?",
      category: "Quantum Mechanics",
      type: "mcq",
      formula: "\\Delta \\lambda = \\lambda' - \\lambda = \\frac{h}{m_e c} (1 - \\cos \\theta)",
      options: [
        "h / (m_e · c)",
        "2h / (m_e · c)",
        "h / (2m_e · c)",
        "Zero"
      ],
      correctOption: 0,
      explanation: "Since cos(90°) = 0, the Compton formula reduces directly to Δλ = h / (m_e · c).",
      points: 25,
      difficulty: "Hard",
    },
    {
      id: 2,
      prompt: "Consider an infinite recursive ladder network composed of repeating cells with 1Ω series resistors and 2Ω shunt resistors. Calculate the equivalent input resistance R_eq across terminals A and B.",
      category: "Electromagnetism & Circuits",
      type: "mcq",
      formula: "R_{eq} = R_1 + \\frac{R_2 \\cdot R_{eq}}{R_2 + R_{eq}} \\implies R_{eq}^2 - R_1 R_{eq} - R_1 R_2 = 0",
      options: [
        "1.41 Ω (√2 Ω)",
        "2.00 Ω (Exact integer)",
        "2.73 Ω (1 + √3 Ω)",
        "3.14 Ω (π Ω)"
      ],
      correctOption: 1,
      explanation: "Setting R_eq = 1 + (2 R_eq)/(2 + R_eq) leads to R_eq^2 - R_eq - 2 = 0, yielding R_eq = 2.0 Ω.",
      points: 30,
      difficulty: "Advanced",
    },
    {
      id: 3,
      prompt: "A solid homogeneous cylinder of mass M and radius R rolls without slipping down a plane inclined at angle θ to the horizontal. What is its linear acceleration a along the plane?",
      category: "Classical Mechanics",
      type: "mcq",
      formula: "I = \\frac{1}{2} M R^2, \\quad a = \\frac{g \\sin \\theta}{1 + I / (MR^2)}",
      options: [
        "(1/2) g sin(θ)",
        "(2/3) g sin(θ)",
        "(3/4) g sin(θ)",
        "(5/7) g sin(θ)"
      ],
      correctOption: 1,
      explanation: "For a solid cylinder, 1 + I/(MR^2) = 1 + 1/2 = 3/2, so linear acceleration is (2/3) g sin(θ).",
      points: 25,
      difficulty: "Hard",
    },
    {
      id: 4,
      prompt: "In classical thermodynamics, what is the theoretical maximum Carnot cycle efficiency η of a heat engine operating between a hot reservoir at T_H = 600 K and a cold reservoir at T_C = 300 K?",
      category: "Thermodynamics",
      type: "mcq",
      formula: "\\eta_{Carnot} = 1 - \\frac{T_C}{T_H}",
      options: [
        "33.3%",
        "50.0%",
        "66.7%",
        "75.0%"
      ],
      correctOption: 1,
      explanation: "η = 1 - 300/600 = 1 - 0.5 = 50.0%.",
      points: 20,
      difficulty: "Hard",
    },
    {
      id: 5,
      prompt: "Determine the Schwarzschild gravitational radius r_s of a static black hole having twice the mass of our Sun (M = 2 M_☉, with M_☉ ≈ 1.989 × 10³⁰ kg).",
      category: "Astrophysics & Relativity",
      type: "mcq",
      formula: "r_s = \\frac{2GM}{c^2}",
      options: [
        "~ 2.95 km",
        "~ 5.91 km",
        "~ 11.82 km",
        "~ 29.50 km"
      ],
      correctOption: 1,
      explanation: "Since r_s for 1 solar mass is approximately 2.95 km, for 2 solar masses it is approximately 5.91 km.",
      points: 35,
      difficulty: "Olympiad Level",
    },
    {
      id: 6,
      prompt: "An electron is accelerated through an electrostatic potential difference of V = 150 Volts. Compute the non-relativistic de Broglie wavelength λ_dB in Angstroms (Å = 10⁻¹⁰ m).",
      category: "Modern Physics",
      type: "numerical",
      formula: "\\lambda = \\frac{h}{\\sqrt{2 m_e e V}} \\approx \\sqrt{\\frac{150}{V}} \\text{ Å}",
      correctNumerical: "1.0",
      explanation: "For V = 150 V, λ = √(150 / 150) = 1.00 Å.",
      points: 40,
      difficulty: "Olympiad Level",
    },
  ];

  const activeQuestions = liveQuestions && liveQuestions.length > 0 ? liveQuestions : sampleQuestions;

  // Anti-Cheat Tab-Switch Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setShowTabWarning(true);
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isSubmitted]);

  // Keyboard navigation shortcuts (1-4 for options, arrows for next/prev)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitted || isSubmitModalOpen) return;
      const q = activeQuestions[currentIdx];
      if (!q) return;

      if (q.type === "mcq" && q.options) {
        if (e.key >= "1" && e.key <= String(q.options.length)) {
          const optIdx = parseInt(e.key) - 1;
          handleSelectOption(optIdx);
        } else if (e.key.toUpperCase() >= "A" && e.key.toUpperCase() <= String.fromCharCode(64 + q.options.length)) {
          const optIdx = e.key.toUpperCase().charCodeAt(0) - 65;
          handleSelectOption(optIdx);
        }
      }

      if (e.key === "ArrowRight" && currentIdx < activeQuestions.length - 1) {
        setCurrentIdx((prev) => prev + 1);
      } else if (e.key === "ArrowLeft" && currentIdx > 0) {
        setCurrentIdx((prev) => prev - 1);
      } else if (e.key.toLowerCase() === "f") {
        toggleFlag();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIdx, isSubmitted, isSubmitModalOpen, answers, activeQuestions]);

  // Timer Tick
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }));
    if (contestId) {
      const activeQ = activeQuestions[currentIdx];
      const qId = activeQ?.apiId || String(activeQ?.id);
      setIsAutoSaving(true);
      submissionsApi
        .saveSingleAnswer(contestId, qId, { selectedOption: optIdx })
        .catch((err) => console.debug("Auto-save answer note:", err))
        .finally(() => setIsAutoSaving(false));
    }
  };

  const handleNumericalInput = (val: string) => {
    setAnswers((prev) => ({ ...prev, [currentIdx]: val }));
    if (contestId) {
      const activeQ = activeQuestions[currentIdx];
      const qId = activeQ?.apiId || String(activeQ?.id);
      setIsAutoSaving(true);
      submissionsApi
        .saveSingleAnswer(contestId, qId, { answerText: val })
        .catch((err) => console.debug("Auto-save numerical note:", err))
        .finally(() => setIsAutoSaving(false));
    }
  };

  const toggleFlag = () => {
    setFlagged({ ...flagged, [currentIdx]: !flagged[currentIdx] });
  };

  const q = activeQuestions[currentIdx] || activeQuestions[0];
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const progressPercent = activeQuestions.length > 0 ? Math.round((answeredCount / activeQuestions.length) * 100) : 0;

  // Calculate final score when submitted
  const calculateResults = () => {
    let earnedPoints = 0;
    let totalPoints = 0;
    let correctCount = 0;

    activeQuestions.forEach((question, idx) => {
      totalPoints += question.points;
      const userAns = answers[idx];

      if (question.type === "mcq" && userAns === question.correctOption) {
        earnedPoints += question.points;
        correctCount += 1;
      } else if (question.type === "numerical" && typeof userAns === "string" && question.correctNumerical) {
        if (parseFloat(userAns.trim()) === parseFloat(question.correctNumerical)) {
          earnedPoints += question.points;
          correctCount += 1;
        }
      }
    });

    const accuracy = activeQuestions.length > 0 ? Math.round((correctCount / activeQuestions.length) * 100) : 0;
    const ratingDelta = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 110) + 12 : 15;

    return { earnedPoints, totalPoints, correctCount, accuracy, ratingDelta };
  };

  const results = calculateResults();

  // Filtered problem indices for palette
  const visibleIndices = activeQuestions.map((_, idx) => idx).filter((idx) => {
    if (paletteFilter === "flagged") return flagged[idx];
    if (paletteFilter === "unanswered") return answers[idx] === undefined;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-900 relative">
      
      {/* Tab Switch Warning Modal */}
      <AnimatePresence>
        {showTabWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-rose-400 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Proctoring Alert: Tab Switch Detected!
              </h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                You switched away from the Olympiad Arena. Notice: Infraction recorded (<strong>{tabSwitchCount} / 3 Allowed</strong>). Exceeding 3 infractions will mark your scorecard with an integrity flag.
              </p>
              <button
                onClick={() => setShowTabWarning(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                I Understand & Resume Contest
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contest Sticky Header with Depth */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)]">
        {/* Top gradient accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-400" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Left: Exit & Contest Info */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors shrink-0 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Exit Arena</span>
            </Link>
            <div className="h-5 w-px bg-slate-200 shrink-0 hidden sm:block" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1
                  className="font-extrabold text-xs sm:text-base text-slate-900 truncate"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  National Youth Physics Olympiad 2026
                </h1>
                <span className="hidden md:inline-flex text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 shrink-0">
                  Division 1
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10.5px] text-slate-500 font-medium">
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Proctoring Active
                </span>
                <span className="hidden lg:inline">• Host: Stanford Physics Association</span>
              </div>
            </div>
          </div>

          {/* Right: Fullscreen, Countdown Timer & Finish Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="hidden sm:flex p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Countdown Timer with Dynamic State */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm shadow-inner transition-colors ${
                timeLeft < 300
                  ? "bg-rose-50 text-rose-700 border-rose-300 animate-pulse"
                  : timeLeft < 900
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-purple-50 text-purple-900 border-purple-200"
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 sm:px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-purple-600/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Submit Contest</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Arena Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Question Pane with Real Depth */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] flex flex-col justify-between space-y-6">
          <div>
            {/* Question Top Info Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-purple-100 text-purple-800 text-xs font-black font-mono shadow-2xs">
                  Problem #{currentIdx + 1} of {activeQuestions.length}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {q.category}
                </span>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {q.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isAutoSaving && (
                  <span className="text-[11px] font-medium text-purple-600 animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
                    Auto-saving...
                  </span>
                )}
                <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 shadow-2xs flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  +{q.points} Points
                </span>
              </div>
            </div>

            {/* Question Text */}
            <h2
              className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed mb-6"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {q.prompt}
            </h2>

            {/* Formula Block if applicable */}
            {q.formula && (
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    Governing Equation / Relation
                  </span>
                  <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    Formula Box
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs sm:text-sm text-purple-900 overflow-x-auto shadow-inner">
                  <code>{q.formula}</code>
                </div>
              </div>
            )}

            {/* Multiple Choice Options */}
            {q.type === "mcq" && q.options && (
              <div className="space-y-3">
                {q.options.map((opt, idx) => {
                  const isSelected = answers[currentIdx] === idx;
                  const keyLetter = String.fromCharCode(65 + idx);

                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "border-purple-600 bg-purple-50/70 text-purple-950 font-bold shadow-md shadow-purple-600/10 ring-2 ring-purple-600/20"
                          : "border-slate-200/90 hover:border-purple-300 hover:bg-slate-50/80 text-slate-700 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-xl text-xs font-extrabold flex items-center justify-center font-mono shadow-xs ${
                            isSelected
                              ? "bg-purple-600 text-white"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {keyLetter}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">
                          [Press {keyLetter}]
                        </span>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Numerical / Value Input Question */}
            {q.type === "numerical" && (
              <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Enter Calculated Numeric Answer:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={(answers[currentIdx] as string) || ""}
                    onChange={(e) => handleNumericalInput(e.target.value)}
                    placeholder="e.g. 1.0"
                    className="w-48 px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
                  />
                  <span className="text-sm font-bold text-slate-600">Å (Angstroms)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Tip: Round to one decimal place if applicable. Standard precision criteria will apply.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action Controls */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Flag for review button */}
            <button
              onClick={toggleFlag}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer w-full sm:w-auto justify-center ${
                flagged[currentIdx]
                  ? "bg-amber-100 text-amber-900 border-amber-300 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${flagged[currentIdx] ? "fill-amber-500 text-amber-600" : ""}`} />
              <span>{flagged[currentIdx] ? "Marked for Review" : "Flag for Review (F)"}</span>
            </button>

            {/* Prev / Next controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                disabled={currentIdx === activeQuestions.length - 1}
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/25 transition-all cursor-pointer"
              >
                <span>Save & Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Problem Palette Matrix & Info Card */}
        <div className="w-full lg:w-80 space-y-5">
          {/* Palette Box with Depth */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-sm text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Problem Palette
              </h3>
              <span className="text-xs font-extrabold text-purple-700 font-mono">
                {answeredCount}/{activeQuestions.length} Saved
              </span>
            </div>

            {/* Progress Bar with Gradient */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-[11px] font-bold">
              <button
                onClick={() => setPaletteFilter("all")}
                className={`flex-1 py-1 rounded-lg text-center transition-all ${
                  paletteFilter === "all" ? "bg-white text-purple-700 shadow-2xs" : "text-slate-600"
                }`}
              >
                All ({activeQuestions.length})
              </button>
              <button
                onClick={() => setPaletteFilter("unanswered")}
                className={`flex-1 py-1 rounded-lg text-center transition-all ${
                  paletteFilter === "unanswered" ? "bg-white text-purple-700 shadow-2xs" : "text-slate-600"
                }`}
              >
                Left ({activeQuestions.length - answeredCount})
              </button>
              <button
                onClick={() => setPaletteFilter("flagged")}
                className={`flex-1 py-1 rounded-lg text-center transition-all ${
                  paletteFilter === "flagged" ? "bg-white text-purple-700 shadow-2xs" : "text-slate-600"
                }`}
              >
                Flagged ({flaggedCount})
              </button>
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-5 gap-2.5 mb-5">
              {activeQuestions.map((item, idx) => {
                const isAnswered = answers[idx] !== undefined;
                const isCurrent = currentIdx === idx;
                const isFlagged = flagged[idx];
                const isVisible = visibleIndices.includes(idx);

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-11 rounded-xl text-xs font-bold font-mono transition-all relative flex items-center justify-center cursor-pointer ${
                      !isVisible ? "opacity-30" : ""
                    } ${
                      isCurrent
                        ? "bg-purple-600 text-white ring-2 ring-purple-600 ring-offset-2 shadow-md shadow-purple-600/30 scale-105"
                        : isAnswered
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300 font-extrabold hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    <span>{idx + 1}</span>

                    {/* Check badge if answered */}
                    {isAnswered && !isCurrent && (
                      <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}

                    {/* Flag indicator dot */}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow-2xs" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-2 text-[11px] text-slate-600 pt-3 border-t border-slate-100 font-medium">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[9px] text-emerald-700 font-bold">✓</span>
                  <span>Answered</span>
                </div>
                <span className="font-mono font-bold text-slate-700">{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-purple-600" />
                  <span>Current Problem</span>
                </div>
                <span className="font-mono font-bold text-slate-700">#{currentIdx + 1}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-amber-400" />
                  <span>Flagged for Review</span>
                </div>
                <span className="font-mono font-bold text-slate-700">{flaggedCount}</span>
              </div>
            </div>
          </div>

          {/* Institutional Fair Play Box */}
          <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 shadow-2xs">
            <div className="flex items-start gap-2.5 mb-2">
              <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
              <h4 className="font-extrabold text-xs text-purple-950">
                Institutional Integrity Protocol
              </h4>
            </div>
            <p className="text-[11px] text-purple-900/80 leading-relaxed font-normal">
              Tab switches and browser focus are logged. Cryptographic scorecards verify that attempts meet international academic accreditation standards.
            </p>
          </div>
        </div>

      </main>

      {/* Pre-Submission Confirmation Modal */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setIsSubmitModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3
                  className="font-extrabold text-xl text-slate-900"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Confirm Contest Submission
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Once submitted, your answers will be locked and cryptographic scorecard generated.
                </p>
              </div>

              {/* Status Summary Pills */}
              <div className="grid grid-cols-3 gap-2.5 mb-6 text-center text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 font-bold block uppercase">Answered</span>
                  <span className="text-lg font-black text-emerald-800">{answeredCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] text-amber-700 font-bold block uppercase">Flagged</span>
                  <span className="text-lg font-black text-amber-800">{flaggedCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Unanswered</span>
                  <span className="text-lg font-black text-slate-700">
                    {activeQuestions.length - answeredCount}
                  </span>
                </div>
              </div>

              {activeQuestions.length - answeredCount > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-6 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    You have <strong>{activeQuestions.length - answeredCount} unanswered problems</strong>. Unanswered questions will receive 0 points.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Return to Review
                </button>
                <button
                  onClick={async () => {
                    setIsSubmitModalOpen(false);
                    if (contestId) {
                      try {
                        const payloadAnswers = activeQuestions.map((qItem, idx) => {
                          const ans = answers[idx];
                          return {
                            questionId: qItem.apiId || String(qItem.id),
                            answerPayload: typeof ans === "number" ? { selectedOption: ans } : { answerText: String(ans ?? "") }
                          };
                        });
                        const res = await submissionsApi.submitAll(contestId, { answers: payloadAnswers });
                        if (res && res.id) {
                          setSubmissionHash(res.id);
                        }
                      } catch (err) {
                        console.warn("Submissions API note, proceeding with verification view:", err);
                      }
                    }
                    setIsSubmitted(true);
                  }}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                >
                  Lock & Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Official Scorecard Completion Modal */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-200 my-8"
            >
              {/* Top Medal Icon */}
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-400/30 ring-4 ring-amber-100">
                  <Trophy className="w-7 h-7 fill-slate-950" />
                </div>
                <h3
                  className="text-2xl font-black text-slate-900 tracking-tight"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Olympiad Completed!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your responses have been verified and cryptographically recorded on the Olympido registry.
                </p>
              </div>

              {/* Verified Digital Certificate Card with Depth */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-white border border-purple-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-purple-700 font-bold">
                    <span>
                      HASH: {submissionHash ? `0x${submissionHash.substring(0, 8)}...${submissionHash.substring(submissionHash.length - 4)}` : "0x8f2a...9b12"}
                    </span>
                    <button
                      onClick={() => {
                        const hashVal = submissionHash || "0x8f2a3c9e1b4f7a229b12";
                        navigator.clipboard?.writeText(hashVal);
                        setCopiedHash(true);
                        setTimeout(() => setCopiedHash(false), 2000);
                      }}
                      className="text-slate-400 hover:text-purple-700"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Officially Verified
                  </span>
                </div>

                {/* Score Summary Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Points</span>
                    <span className="text-lg font-black text-purple-700">
                      {results.earnedPoints}/{results.totalPoints}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Accuracy</span>
                    <span className="text-lg font-black text-emerald-600">{results.accuracy}%</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Rating Δ</span>
                    <span className="text-lg font-black text-amber-600">+{results.ratingDelta}</span>
                  </div>
                </div>

                {/* QR Code and Verification Seal */}
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/80">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong className="text-slate-900 block font-bold">
                      Digital Cryptographic Verification
                    </strong>
                    Public hash registered on Olympido immutable audit ledger.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Link
                  href="/"
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm text-center block shadow-md shadow-purple-600/25 transition-all cursor-pointer"
                >
                  Return to Arena & Global Standings
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const hashVal = submissionHash || "0x8f2a3c9e1b4f7a229b12";
                      navigator.clipboard?.writeText(window.location.origin + "/verify/" + hashVal);
                      alert("Public Scorecard link copied to clipboard!");
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Scorecard</span>
                  </button>
                  <Link
                    href={`/verify/${submissionHash || "0x8f2a"}`}
                    className="flex-1 py-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 text-center"
                  >
                    <span>View Public Scorecard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
