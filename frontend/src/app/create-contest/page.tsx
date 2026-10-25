"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  AlertCircle,
  Users,
  GraduationCap,
  Eye,
  Check,
  Send,
  Layers,
  BookOpen,
  Award,
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
  const [previewMode, setPreviewMode] = useState<"organizer" | "student">("organizer");

  // Step 1: School / University Host & Essentials
  const [schoolName, setSchoolName] = useState("Stanford University");
  const [department, setDepartment] = useState("Department of Physics & SLAC");
  const [schoolDomain, setSchoolDomain] = useState("stanford.edu");
  const [facultyAdvisor, setFacultyAdvisor] = useState("Prof. Robert Thorne, PhD");
  const [title, setTitle] = useState("National Youth Physics Olympiad 2026 - Semi-Finals");
  const [category, setCategory] = useState<"physics" | "mathematics" | "coding" | "chemistry" | "astronomy" | "biology">("physics");
  const [difficulty, setDifficulty] = useState<"School Level" | "Regional Olympiad" | "National Olympiad" | "International">("National Olympiad");
  const [description, setDescription] = useState("The premier nationwide theoretical and experimental problem-solving Olympiad for senior high school and undergraduate students.");
  const [bannerGradient, setBannerGradient] = useState("from-purple-600 via-indigo-600 to-blue-800");

  // Step 2: Student Eligibility, Schedule & Scoring
  const [targetStudentLevels, setTargetStudentLevels] = useState<string[]>(["Senior High School", "Freshman Undergraduate"]);
  const [minRating, setMinRating] = useState(1200);
  const [maxCapacity, setMaxCapacity] = useState(2500);
  const [geography, setGeography] = useState<"Global Open" | "Regional Partner Schools" | "Invited Institutions">("Global Open");
  const [contestDate, setContestDate] = useState("2026-12-18");
  const [contestTime, setContestTime] = useState("14:00 UTC");
  const [registrationDeadline, setRegistrationDeadline] = useState("2026-12-12");
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [pointsAwarded, setPointsAwarded] = useState(1500);
  const [prizes, setPrizes] = useState("Gold, Silver & Bronze Medals + $5,000 Academic Fellowship");

  // Step 3: Question Builder
  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: "q-1",
      prompt: "A photon collides elastically with a stationary electron at rest. If the scattering angle is 90°, calculate the Compton shift in wavelength Δλ.",
      type: "mcq",
      options: ["h / (m_e · c)", "2h / (m_e · c)", "h / (2m_e · c)", "Zero"],
      correctOption: 0,
      points: 25,
    },
    {
      id: "q-2",
      prompt: "Derive the Lagrangian equation of motion for a double pendulum with equal lengths L and masses m undergoing small planar oscillations.",
      type: "theoretical",
      options: [],
      correctOption: 0,
      points: 50,
    },
  ]);

  const toggleStudentLevel = (level: string) => {
    if (targetStudentLevels.includes(level)) {
      setTargetStudentLevels(targetStudentLevels.filter((l) => l !== level));
    } else {
      setTargetStudentLevels([...targetStudentLevels, level]);
    }
  };

  const addQuestion = (type: "mcq" | "theoretical") => {
    const newQ: QuestionItem = {
      id: `q-${Date.now()}`,
      prompt: type === "mcq" ? "Enter question statement..." : "Enter theoretical problem statement, derivation prompt, and proof criteria...",
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

  const updateCorrectOption = (qId: string, optIdx: number) => {
    setQuestions(questions.map((q) => (q.id === qId ? { ...q, correctOption: optIdx } : q)));
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
      title: title || "Custom Academic Olympiad 2026",
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
        name: `${schoolName} (${department})`,
        domain: schoolDomain,
        isVerified: true,
        type: "University",
      },
      schoolInfo: {
        schoolName,
        department,
        domain: schoolDomain,
        facultyAdvisor,
      },
      studentEligibility: {
        targetLevels: targetStudentLevels,
        minRating: Number(minRating),
        maxCapacity: Number(maxCapacity),
        geography,
      },
    });

    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/admin");
    }, 1200);
  };

  const steps = [
    { num: 1, title: "School Host & Essentials" },
    { num: 2, title: "Student Eligibility & Schedule" },
    { num: 3, title: "Problem Set Builder" },
    { num: 4, title: "Review & Submit to Admin" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-900 relative">
      <Navbar currentRole="organizer" />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* Wizard Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>School & University Host Console</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Olympiad Contest Creation Wizard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure competition logistics, target student eligibility, and problem sets for administrative accreditation.
            </p>
          </div>

          <Link
            href="/"
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors self-start sm:self-auto flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </Link>
        </div>

        {/* 4-Step Progress Pill Indicator with Depth */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {steps.map((st) => (
              <div
                key={st.num}
                onClick={() => setCurrentStep(st.num)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                  currentStep === st.num
                    ? "bg-purple-50 border border-purple-200 text-purple-950 font-extrabold shadow-2xs"
                    : currentStep > st.num
                    ? "text-emerald-700 bg-emerald-50/60 font-semibold"
                    : "text-slate-400 hover:text-slate-600 font-medium"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-black flex items-center justify-center shrink-0 ${
                    currentStep === st.num
                      ? "bg-purple-600 text-white shadow-xs"
                      : currentStep > st.num
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {currentStep > st.num ? <Check className="w-3.5 h-3.5" /> : st.num}
                </div>
                <span className="text-xs truncate">{st.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Form Workspace Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] p-6 sm:p-8 space-y-8">
          
          {/* STEP 1: School Host & Contest Essentials */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-lg text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Step 1: School / University Host & Contest Essentials
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Identify your accredited academic institution and set high-level Olympiad metadata.
                </p>
              </div>

              {/* School Host Credentials Box */}
              <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-700" />
                  <h4 className="font-extrabold text-sm text-purple-950">
                    Host School / University Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Academic Institution / University
                    </label>
                    <input
                      type="text"
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. Stanford University"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department / Olympiad Circle
                    </label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Department of Physics"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official Institutional Domain (.edu / .ac)
                    </label>
                    <input
                      type="text"
                      required
                      value={schoolDomain}
                      onChange={(e) => setSchoolDomain(e.target.value)}
                      placeholder="e.g. stanford.edu"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Faculty Advisor / Lead Professor
                    </label>
                    <input
                      type="text"
                      required
                      value={facultyAdvisor}
                      onChange={(e) => setFacultyAdvisor(e.target.value)}
                      placeholder="e.g. Prof. Robert Thorne, PhD"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* Contest Title */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Official Contest Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. National Youth Physics Olympiad 2026 - Semi-Finals"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Category & Difficulty Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Scientific Discipline / Subject
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="physics">Physics & Mechanics</option>
                    <option value="mathematics">Pure & Applied Mathematics</option>
                    <option value="coding">Informatics & Algorithms</option>
                    <option value="chemistry">Chemistry & Molecular Science</option>
                    <option value="astronomy">Astronomy & Astrophysics</option>
                    <option value="biology">Biology & Life Sciences</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Accreditation Difficulty Tier
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="School Level">School Level (Introductory)</option>
                    <option value="Regional Olympiad">Regional Olympiad (Competitive)</option>
                    <option value="National Olympiad">National Olympiad (High Stakes)</option>
                    <option value="International">International (World Class)</option>
                  </select>
                </div>
              </div>

              {/* Description & Syllabus */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Contest Overview & Academic Syllabus
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline topics covered, target knowledge prerequisites, and competition structure..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Banner Gradient Themes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Header Card Banner Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Royal Purple", value: "from-purple-600 via-indigo-600 to-blue-800" },
                    { label: "Deep Cobalt", value: "from-blue-600 via-indigo-700 to-purple-900" },
                    { label: "Emerald Tech", value: "from-emerald-600 via-teal-700 to-blue-900" },
                    { label: "Amber Cosmic", value: "from-amber-500 via-orange-600 to-red-800" },
                  ].map((bg) => (
                    <button
                      type="button"
                      key={bg.value}
                      onClick={() => setBannerGradient(bg.value)}
                      className={`h-14 rounded-xl bg-gradient-to-r ${bg.value} relative p-2 text-left cursor-pointer border-2 transition-all ${
                        bannerGradient === bg.value ? "border-purple-600 ring-2 ring-purple-600/30 scale-102" : "border-transparent opacity-85 hover:opacity-100"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-white drop-shadow-sm">
                        {bg.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Student Eligibility, Schedule & Scoring */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-lg text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Step 2: Student Eligibility, Scheduling & Scoring
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define which students can enroll and establish scoring rules.
                </p>
              </div>

              {/* Student Eligibility Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Target Student Eligibility & Qualifications
                  </h4>
                </div>

                {/* Target Level Pills */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Eligible Academic Grade Levels:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Middle School", "Junior High School", "Senior High School", "Freshman Undergraduate", "Open University"].map((lvl) => {
                      const isChecked = targetStudentLevels.includes(lvl);
                      return (
                        <button
                          type="button"
                          key={lvl}
                          onClick={() => toggleStudentLevel(lvl)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isChecked
                              ? "bg-purple-600 text-white shadow-xs"
                              : "bg-white text-slate-700 border border-slate-300 hover:border-purple-300"
                          }`}
                        >
                          {isChecked ? `✓ ${lvl}` : `+ ${lvl}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cap & Minimum Rating */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Max Student Capacity
                    </label>
                    <input
                      type="number"
                      value={maxCapacity}
                      onChange={(e: any) => setMaxCapacity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Min Prerequisite Elo Rating
                    </label>
                    <input
                      type="number"
                      value={minRating}
                      onChange={(e: any) => setMinRating(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Geographic Eligibility
                    </label>
                    <select
                      value={geography}
                      onChange={(e: any) => setGeography(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold"
                    >
                      <option value="Global Open">Global Open (Worldwide)</option>
                      <option value="Regional Partner Schools">Regional Partner Schools</option>
                      <option value="Invited Institutions">Invited Institutions Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Schedule Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Contest Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={contestDate}
                    onChange={(e) => setContestDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Registration Closes
                  </label>
                  <input
                    type="date"
                    required
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Exam Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    required
                    value={durationMinutes}
                    onChange={(e: any) => setDurationMinutes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Scoring & Awards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Base Rating Points Awarded
                  </label>
                  <input
                    type="number"
                    required
                    value={pointsAwarded}
                    onChange={(e: any) => setPointsAwarded(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Medals & Awards Description
                  </label>
                  <input
                    type="text"
                    required
                    value={prizes}
                    onChange={(e) => setPrizes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Problem Set Builder */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Step 3: Problem Set & Exam Configuration
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add multiple-choice and theoretical derivation problems ({questions.length} Questions Configured).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addQuestion("mcq")}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add MCQ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addQuestion("theoretical")}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Theoretical</span>
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-mono text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          {q.type === "mcq" ? "Multiple Choice Problem" : "Theoretical / Long-Form Problem"}
                        </span>
                        <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                          {q.points} Pts
                        </span>
                      </div>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(q.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Problem Statement & Prompt:
                      </label>
                      <textarea
                        rows={2}
                        value={q.prompt}
                        onChange={(e) => updateQuestionPrompt(q.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    {/* MCQ Options editor */}
                    {q.type === "mcq" && (
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-slate-700 block">
                          Options & Correct Answer Key:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateCorrectOption(q.id, optIdx)}
                                className={`w-7 h-7 rounded-lg font-mono text-xs font-bold shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                                  q.correctOption === optIdx
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                }`}
                                title="Click to mark as correct answer"
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </button>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateOptionText(q.id, optIdx, e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-900"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4: Review, Live Student View Preview & Submit */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Step 4: Review & Live Student View Preview
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Inspect contest details and toggle between Organizer View and Student View before submitting to Admin.
                  </p>
                </div>

                {/* Organizer vs Student View Toggle */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("organizer")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      previewMode === "organizer"
                        ? "bg-white text-purple-700 shadow-2xs border border-slate-200"
                        : "text-slate-600"
                    }`}
                  >
                    Organizer Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("student")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      previewMode === "student"
                        ? "bg-purple-600 text-white shadow-2xs"
                        : "text-slate-600"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Student View Preview</span>
                  </button>
                </div>
              </div>

              {/* Student View Live Preview */}
              {previewMode === "student" ? (
                <div className="p-6 rounded-3xl bg-slate-50 border-2 border-purple-200 space-y-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-100/70 px-3 py-1 rounded-full w-fit">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Live Student Perspective: How competitors will discover & register for your contest</span>
                  </div>

                  {/* Student View Card Preview */}
                  <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                    <div className={`h-36 bg-gradient-to-r ${bannerGradient} p-4 flex flex-col justify-between text-white relative`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs">
                          {difficulty}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                          Registration Open
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md">
                          <Trophy className="w-3 h-3 text-amber-300" />
                          +{pointsAwarded} Points
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-bold text-purple-700 uppercase">{category}</span>
                        <span>{schoolName}</span>
                      </div>
                      <h4 className="font-extrabold text-base text-slate-900">{title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{description}</p>
                      
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">{durationMinutes} mins • {questions.length} problems</span>
                        <span className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs">
                          Register Free
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Organizer Review Mode */
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-bold text-purple-900 block">Host Institution:</span>
                      <p className="font-extrabold text-sm text-slate-900">{schoolName}</p>
                      <p className="text-xs text-slate-600">{department} ({schoolDomain})</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-purple-900 block">Faculty Advisor:</span>
                      <p className="font-extrabold text-sm text-slate-900">{facultyAdvisor}</p>
                      <p className="text-xs text-slate-600">Verified Institutional Authority</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                      <span className="font-bold text-slate-900">{category}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Difficulty</span>
                      <span className="font-bold text-slate-900">{difficulty}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration</span>
                      <span className="font-bold text-slate-900">{durationMinutes} min</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Question Count</span>
                      <span className="font-bold text-purple-700">{questions.length} Problems</span>
                    </div>
                  </div>

                  {/* Submission Audit Disclaimer */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-950 font-bold mb-0.5">
                        Mandatory Administrative Accreditation Audit
                      </strong>
                      Contests submitted by verified School and University hosts are inspected by the Olympido Academic Moderation Committee before appearing on the public catalog. Review turnaround is typically within 24 hours.
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Wizard Navigation Footer */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
            >
              Back
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-purple-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "Submitting..." : "Submit to Admin for Review"}</span>
              </button>
            )}
          </div>
        </form>

      </main>

      <Footer />
    </div>
  );
}
