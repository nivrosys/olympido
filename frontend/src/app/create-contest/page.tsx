"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { submitNewContestForApproval } from "../../data/contestStore";
import { 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Trophy, 
  Calendar, 
  Clock, 
  HelpCircle,
  FileText,
  AlertCircle
} from "lucide-react";

interface QuestionItem {
  id: string;
  prompt: string;
  type: "mcq" | "theoretical";
  options: string[];
  correctOption: number;
  points: number;
}

export default function CreateContestPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Essentials
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"physics" | "mathematics" | "coding" | "chemistry" | "astronomy" | "biology">("physics");
  const [difficulty, setDifficulty] = useState<"School Level" | "Regional Olympiad" | "National Olympiad" | "International">("National Olympiad");
  const [description, setDescription] = useState("");
  const [bannerGradient, setBannerGradient] = useState("from-purple-600 via-indigo-600 to-blue-800");

  // Step 2: Schedule & Scoring
  const [contestDate, setContestDate] = useState("2026-12-18");
  const [contestTime, setContestTime] = useState("14:00 UTC");
  const [registrationDeadline, setRegistrationDeadline] = useState("2026-12-12");
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [pointsAwarded, setPointsAwarded] = useState(1200);
  const [prizes, setPrizes] = useState("Gold, Silver & Bronze Medals + $5,000 Research Fellowship");

  // Step 3: Question Builder
  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: "q-1",
      prompt: "A relativistic particle of rest mass m moves with speed 0.8c. What is its relativistic momentum?",
      type: "mcq",
      options: ["(4/3)mc", "(5/3)mc", "(3/4)mc", "2mc"],
      correctOption: 0,
      points: 20,
    },
    {
      id: "q-2",
      prompt: "Derive the oscillation frequency of a coupled pendulum system with spring constant k and length L in the small-angle approximation.",
      type: "theoretical",
      options: [],
      correctOption: 0,
      points: 40,
    },
  ]);

  const addQuestion = (type: "mcq" | "theoretical") => {
    const newQ: QuestionItem = {
      id: `q-${Date.now()}`,
      prompt: type === "mcq" ? "Enter question statement..." : "Enter theoretical problem and proof prompt...",
      type,
      options: type === "mcq" ? ["Option A", "Option B", "Option C", "Option D"] : [],
      correctOption: 0,
      points: type === "mcq" ? 25 : 50,
    };
    setQuestions([...questions, newQ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestionPrompt = (id: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, prompt: text } : q)));
  };

  const updateOptionText = (qId: string, optIdx: number, text: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== qId) return q;
        const newOpts = [...q.options];
        newOpts[optIdx] = text;
        return { ...q, options: newOpts };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const categoryLabels: Record<string, string> = {
      physics: "Physics",
      mathematics: "Mathematics",
      coding: "Informatics & Coding",
      chemistry: "Chemistry",
      astronomy: "Astronomy & Space",
      biology: "Biology & Life Sciences",
    };

    submitNewContestForApproval({
      title: title || "National Olympiad Challenge 2026",
      category,
      categoryLabel: categoryLabels[category],
      difficulty,
      description: description || "Rigorous academic competition organized under institutional supervision.",
      bannerGradient,
      contestDate: `${contestDate} • ${contestTime}`,
      registrationDeadline,
      durationMinutes: Number(durationMinutes),
      pointsAwarded: Number(pointsAwarded),
      prizes,
      questionCount: questions.length,
      organizer: {
        name: "Verified Institutional Organizer",
        domain: "school.edu",
        isVerified: true,
        type: "University",
      },
    });

    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/admin?submitted=true");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar currentRole="organizer" />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-purple-700/50">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Arena
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Create New Olympiad Contest
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 mt-1">
              Organizer Portal • Institutional Verification & Admin Approval Pipeline
            </p>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-purple-100">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Admin Review Mandated</span>
          </div>
        </div>
      </div>

      {/* Wizard Progress Stepper */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between text-xs font-bold">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 py-1 px-3 rounded-lg transition-all ${
              currentStep === 1 ? "bg-purple-600 text-white shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">1</span>
            <span>1. Essentials</span>
          </button>

          <span className="text-gray-300">→</span>

          <button
            onClick={() => setCurrentStep(2)}
            className={`flex items-center gap-2 py-1 px-3 rounded-lg transition-all ${
              currentStep === 2 ? "bg-purple-600 text-white shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">2</span>
            <span>2. Schedule & Rules</span>
          </button>

          <span className="text-gray-300">→</span>

          <button
            onClick={() => setCurrentStep(3)}
            className={`flex items-center gap-2 py-1 px-3 rounded-lg transition-all ${
              currentStep === 3 ? "bg-purple-600 text-white shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">3</span>
            <span>3. Questions ({questions.length})</span>
          </button>

          <span className="text-gray-300">→</span>

          <button
            onClick={() => setCurrentStep(4)}
            className={`flex items-center gap-2 py-1 px-3 rounded-lg transition-all ${
              currentStep === 4 ? "bg-purple-600 text-white shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">4</span>
            <span>4. Review & Submit</span>
          </button>
        </div>
      </div>

      {/* Main Wizard Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: ESSENTIALS */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-extrabold text-gray-900">Step 1: Contest Essentials</h2>
                <p className="text-xs text-gray-500">Define the core subject, title, and academic scope of your Olympiad.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Contest Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. National Youth Physics Olympiad 2026"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Subject / Discipline <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                  >
                    <option value="physics">Physics & Physical Sciences</option>
                    <option value="mathematics">Mathematics & Geometry</option>
                    <option value="coding">Informatics & Algorithms</option>
                    <option value="chemistry">Chemistry & Molecular Sciences</option>
                    <option value="astronomy">Astronomy & Astrophysics</option>
                    <option value="biology">Biology & Life Sciences</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Difficulty Tier <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                  >
                    <option value="School Level">School Level (Introductory)</option>
                    <option value="Regional Olympiad">Regional Olympiad (Intermediate)</option>
                    <option value="National Olympiad">National Olympiad (Advanced)</option>
                    <option value="International">International Invitational (Grandmaster)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Academic Description & Syllabus Overview <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline topics covered, target grade levels, prerequisites, and evaluation methodology..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-normal leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Card Banner Gradient
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Electric Purple", gradient: "from-purple-600 via-indigo-600 to-blue-800" },
                    { label: "Cyber Blue", gradient: "from-blue-600 via-indigo-700 to-purple-900" },
                    { label: "Emerald Code", gradient: "from-emerald-600 via-teal-700 to-slate-900" },
                    { label: "Cosmic Amber", gradient: "from-amber-600 via-orange-700 to-indigo-950" },
                  ].map((bg) => (
                    <button
                      key={bg.gradient}
                      type="button"
                      onClick={() => setBannerGradient(bg.gradient)}
                      className={`h-14 rounded-xl bg-gradient-to-r ${bg.gradient} border-2 transition-all p-2 flex items-end justify-start ${
                        bannerGradient === bg.gradient ? "border-amber-400 scale-[1.03] shadow-md" : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">
                        {bg.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Continue to Schedule</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SCHEDULE & SCORING */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-extrabold text-gray-900">Step 2: Schedule & Scoring Logistics</h2>
                <p className="text-xs text-gray-500">Configure timelines, duration, and the Olympiad points award formula.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Contest Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={contestDate}
                    onChange={(e) => setContestDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Contest Start Time (UTC) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contestTime}
                    onChange={(e) => setContestTime(e.target.value)}
                    placeholder="e.g. 14:00 UTC"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Registration Deadline <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Exam Duration (Minutes) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={360}
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-900 mb-1">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Base Olympiad Points for Top Rankers</span>
                </div>
                <p className="text-xs text-purple-700 mb-3">
                  Points awarded to the 1st place winner. Subsequent rankers receive dynamically scaled points.
                </p>
                <input
                  type="number"
                  step={50}
                  value={pointsAwarded}
                  onChange={(e) => setPointsAwarded(Number(e.target.value))}
                  className="w-48 px-4 py-2.5 rounded-xl border border-purple-200 bg-white text-sm font-extrabold text-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Awards, Medals & Scholarships
                </label>
                <input
                  type="text"
                  value={prizes}
                  onChange={(e) => setPrizes(e.target.value)}
                  placeholder="e.g. Gold, Silver, Bronze Medals + $5,000 Scholar Pool"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 font-semibold text-xs text-gray-700"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Build Question Set</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: QUESTION BUILDER */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900">Step 3: Problem Set & Questions</h2>
                  <p className="text-xs text-gray-500">Add multiple-choice or theoretical proof tasks for the Olympiad arena.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addQuestion("mcq")}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Add MCQ
                  </button>
                  <button
                    type="button"
                    onClick={() => addQuestion("theoretical")}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Add Theoretical
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          q.type === "mcq" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {q.type === "mcq" ? "Multiple Choice" : "Theoretical Proof"}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">({q.points} Points)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(q.id)}
                        className="text-gray-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={q.prompt}
                      onChange={(e) => updateQuestionPrompt(q.id, e.target.value)}
                      placeholder="Question prompt statement..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />

                    {/* MCQ Options */}
                    {q.type === "mcq" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200">
                            <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                              q.correctOption === optIdx ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600"
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateOptionText(q.id, optIdx, e.target.value)}
                              className="w-full text-xs bg-transparent focus:outline-none"
                            />
                            {q.correctOption === optIdx && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 font-semibold text-xs text-gray-700"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Review & Submit to Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SUBMIT FOR ADMIN APPROVAL */}
          {currentStep === 4 && (
            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Administrative Verification Pipeline</span>
                </div>
                <h2 className="text-xl font-extrabold text-gray-900">Step 4: Final Review & Submission</h2>
                <p className="text-xs text-gray-500">
                  Confirm your contest details before transmitting to the Platform Admin Moderation Queue.
                </p>
              </div>

              {/* Preview Summary Card */}
              <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                    {category.toUpperCase()} • {difficulty}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    Pending Admin Approval
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-gray-900">
                  {title || "National Youth Physics Olympiad 2026"}
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {description || "Rigorous problem sets covering classical mechanics, quantum theory, and optics."}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div>
                    <span className="text-gray-400 block">Exam Date:</span>
                    <strong className="text-gray-900">{contestDate} • {contestTime}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Duration & Tasks:</span>
                    <strong className="text-gray-900">{durationMinutes} mins ({questions.length} problems)</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Top Rank Points:</span>
                    <strong className="text-purple-700">+{pointsAwarded} Points</strong>
                  </div>
                </div>
              </div>

              {/* Institutional Compliance Notice */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">What happens after you hit submit?</h4>
                  <p className="text-amber-800 text-[11px] mt-1 leading-relaxed">
                    Your Olympiad submission is routed directly to the <strong>Admin Moderation Desk</strong>. A certified subject inspector will review problem originality, syllabus clarity, and institutional credentials. Once approved, the contest is scheduled on the public website calendar.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 font-semibold text-xs text-gray-700"
                >
                  Back to Questions
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  {isSubmitting ? (
                    <span>Submitting to Admin Queue...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Submit for Admin Approval</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </form>
      </main>

      <Footer />
    </div>
  );
}
