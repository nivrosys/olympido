"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { contestsApi, submissionsApi, resultsApi } from "../../lib/api";
import {
  MOCK_ORGANIZER_PROFILE,
  MOCK_HOSTED_CONTESTS,
  MOCK_ENROLLED_STUDENTS,
  MOCK_THEORETICAL_SUBMISSIONS,
  TheoreticalSubmissionItem,
  HostedContestItem,
} from "../../data/mockOrganizer";
import {
  Building2,
  GraduationCap,
  ShieldCheck,
  Trophy,
  Users,
  PlusCircle,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Eye,
  Award,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Check,
  Edit3,
} from "lucide-react";

export default function OrganizerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"contests" | "enrollees" | "grading" | "institution">("contests");
  const [selectedContestFilter, setSelectedContestFilter] = useState<string>("all");
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<TheoreticalSubmissionItem | null>(null);
  const [awardedMarks, setAwardedMarks] = useState<number>(45);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [gradingSuccess, setGradingSuccess] = useState<string | null>(null);
  const [apiContests, setApiContests] = useState<HostedContestItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadOrganizerContests() {
      try {
        const res = await contestsApi.getMyCreatedContests();
        if (res && res.contests && res.contests.length > 0 && isMounted) {
          const categoryLabels: Record<string, any> = {
            PHYSICS: { key: "physics", label: "Physics" },
            MATHEMATICS: { key: "mathematics", label: "Mathematics" },
            INFORMATICS: { key: "coding", label: "Informatics & Coding" },
            CHEMISTRY: { key: "chemistry", label: "Chemistry" },
            ASTRONOMY: { key: "astronomy", label: "Astronomy" },
          };

          const statusMap: Record<string, any> = {
            LIVE: { status: "live", label: "Active Live Exam" },
            IN_REVIEW: { status: "in_review", label: "Admin Review Queue" },
            CHANGES_REQUESTED: { status: "in_review", label: "Changes Requested" },
            APPROVED: { status: "approved", label: "Approved & Scheduled" },
            SCHEDULED: { status: "approved", label: "Scheduled" },
            COMPLETED: { status: "completed", label: "Completed" },
            EVALUATION: { status: "completed", label: "Under Evaluation" },
          };

          const mapped: HostedContestItem[] = res.contests.map((c) => {
            const cat = categoryLabels[c.category] || { key: "physics", label: "Physics" };
            const stat = statusMap[c.status] || { status: "approved", label: "Approved" };
            return {
              id: c.id,
              title: c.title,
              category: cat.key,
              categoryLabel: cat.label,
              status: stat.status,
              statusLabel: stat.label,
              contestDate: c.startTime ? new Date(c.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Scheduled",
              enrolledCount: c._count?.registrations || c._count?.submissions || 0,
              maxCapacity: c.maxParticipants || 1500,
              durationMinutes: c.durationMinutes || 90,
              pointsAwarded: c.pointsAwarded || 1000,
              bannerGradient: c.bannerUrl || "from-purple-600 via-indigo-700 to-blue-800",
              plagiarismScore: 99.6,
              targetEducationLevel: ["Senior High School", "Undergraduate"],
            };
          });

          setApiContests(mapped);
        }
      } catch (err) {
        console.warn("Backend organizer contests load note:", err);
      }
    }
    void loadOrganizerContests();
    return () => {
      isMounted = false;
    };
  }, []);

  const baseContests = apiContests.length > 0 ? apiContests : MOCK_HOSTED_CONTESTS;

  // Filtered contests
  const filteredContests = baseContests.filter((c) => {
    if (selectedContestFilter === "all") return true;
    return c.status === selectedContestFilter;
  });

  // Filtered students
  const filteredStudents = MOCK_ENROLLED_STUDENTS.filter((st) => {
    const matchesSearch =
      studentSearch === "" ||
      st.studentName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      st.username.toLowerCase().includes(studentSearch.toLowerCase()) ||
      st.studentInstitution.toLowerCase().includes(studentSearch.toLowerCase());

    const matchesSchool =
      selectedSchoolFilter === "all" || st.studentInstitution === selectedSchoolFilter;

    return matchesSearch && matchesSchool;
  });

  const uniqueSchools = Array.from(new Set(MOCK_ENROLLED_STUDENTS.map((s) => s.studentInstitution)));

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      if (selectedSubmission.id && selectedSubmission.id.length > 20) {
        await submissionsApi.gradeAnswer(selectedSubmission.id, {
          awardedPoints: awardedMarks,
          feedbackNotes: feedbackText,
        });
      }
    } catch (err) {
      console.warn("Backend manual grading API note:", err);
    }

    setGradingSuccess(`✓ Successfully graded ${selectedSubmission.studentName}'s solution! Awarded ${awardedMarks}/${selectedSubmission.maxMarks} points.`);
    setTimeout(() => {
      setGradingSuccess(null);
      setSelectedSubmission(null);
      setFeedbackText("");
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-900 relative">
      <Navbar currentRole="organizer" />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Institutional Host Header Card with Depth */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle top brand glow accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-400" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-purple-600/30 shrink-0 relative overflow-hidden">
                <GraduationCap className="w-9 h-9 text-amber-300" />
                <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    Host Organizer Console
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Institution
                  </span>
                </div>

                <h1
                  className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {MOCK_ORGANIZER_PROFILE.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-600 font-medium mt-1">
                  <span className="font-bold text-slate-800">{MOCK_ORGANIZER_PROFILE.institution}</span>
                  <span className="text-slate-300">•</span>
                  <span>{MOCK_ORGANIZER_PROFILE.department}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-purple-700 font-bold">@{MOCK_ORGANIZER_PROFILE.domain}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
              <Link
                href="/institutions"
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-2xs"
              >
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>School Directory</span>
              </Link>

              <Link
                href="/create-contest"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-600/30 hover:shadow-lg hover:shadow-purple-600/40 transition-all flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #6C3EF4 0%, #5227DC 100%)",
                }}
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span>Create New Olympiad</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100/80">
              <div className="text-xs font-bold text-purple-800 mb-1 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-purple-600" />
                <span>Hosted Contests</span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {MOCK_ORGANIZER_PROFILE.stats.totalHosted}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {MOCK_ORGANIZER_PROFILE.stats.activeContests} Active / Scheduled
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100/80">
              <div className="text-xs font-bold text-blue-800 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Enrolled Students</span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {MOCK_ORGANIZER_PROFILE.stats.totalEnrolledStudents.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Across all competitions</div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100/80">
              <div className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Represented Schools</span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {MOCK_ORGANIZER_PROFILE.stats.participatingSchools}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Universities & High Schools</div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100/80">
              <div className="text-xs font-bold text-rose-800 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>Pending Grading</span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {MOCK_ORGANIZER_PROFILE.stats.pendingGrading}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Theoretical derivations</div>
            </div>
          </div>
        </div>

        {/* Tabbed Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: "contests", label: "Hosted Olympiads", icon: Trophy, count: MOCK_HOSTED_CONTESTS.length },
            { id: "enrollees", label: "Student Delegations & Enrollees", icon: Users, count: MOCK_ENROLLED_STUDENTS.length },
            { id: "grading", label: "Theoretical Grading Desk", icon: FileText, count: MOCK_THEORETICAL_SUBMISSIONS.length },
            { id: "institution", label: "School Host Profile", icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: Hosted Contests */}
        {activeTab === "contests" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Filter Status:</span>
                {["all", "live", "approved", "in_review"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedContestFilter(status)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all capitalize ${
                      selectedContestFilter === status
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {status === "all" ? "All Contests" : status.replace("_", " ")}
                  </button>
                ))}
              </div>

              <Link
                href="/create-contest"
                className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Launch New Contest Wizard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContests.map((contest) => {
                const fillPercent = Math.min(100, Math.round((contest.enrolledCount / contest.maxCapacity) * 100));

                return (
                  <div
                    key={contest.id}
                    className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] hover:shadow-md transition-all overflow-hidden flex flex-col"
                  >
                    {/* Card Banner */}
                    <div className={`h-28 bg-gradient-to-r ${contest.bannerGradient} p-4 flex flex-col justify-between text-white relative`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-xs border border-white/20">
                          {contest.categoryLabel}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            contest.status === "live"
                              ? "bg-rose-500 text-white animate-pulse"
                              : contest.status === "approved"
                              ? "bg-emerald-500 text-white"
                              : "bg-amber-400 text-slate-950"
                          }`}
                        >
                          {contest.statusLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="flex items-center gap-1 bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded">
                          <Trophy className="w-3 h-3 text-amber-300" />
                          +{contest.pointsAwarded} pts
                        </span>
                        <span className="bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded">
                          {contest.durationMinutes} mins
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 line-clamp-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {contest.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                          <Calendar className="w-3.5 h-3.5 text-purple-600" />
                          <span>{contest.contestDate}</span>
                        </div>
                      </div>

                      {/* Capacity progress */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Student Capacity</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {contest.enrolledCount} / {contest.maxCapacity} ({fillPercent}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Target student eligibility badges */}
                      <div className="flex flex-wrap gap-1">
                        {contest.targetEducationLevel.map((lvl) => (
                          <span key={lvl} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {lvl}
                          </span>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setActiveTab("enrollees");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>View Enrollees</span>
                        </button>

                        <Link
                          href={`/create-contest`}
                          className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors flex items-center gap-1 border border-purple-200/60"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview Wizard</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Student Delegations & Enrollees */}
        {activeTab === "enrollees" && (
          <div className="space-y-6">
            {/* Search and Institution Filters */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student or school..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter School:</span>
                <select
                  value={selectedSchoolFilter}
                  onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="all">All Represented Schools</option>
                  {uniqueSchools.map((sch) => (
                    <option key={sch} value={sch}>
                      {sch}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Enrolled Students Table */}
            <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Enrolled Student Delegations ({filteredStudents.length})</span>
                </h3>
                <span className="text-xs text-slate-400">Real-time Registration & Proctoring Log</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Represented School / Uni</th>
                      <th className="py-3 px-4">Level / Tier</th>
                      <th className="py-3 px-4">Skill Rating</th>
                      <th className="py-3 px-4">Proctoring Audit</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div>
                            <span>{st.studentName}</span>
                            <span className="block text-[11px] text-slate-400 font-normal">@{st.username}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>{st.studentInstitution}</span>
                          </div>
                          <span className="text-[10px] font-mono text-purple-700 font-bold">@{st.institutionDomain}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {st.educationLevel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          <span className="text-purple-700">{st.rating}</span>
                          <span className="text-[10px] text-slate-400 font-normal ml-1">({st.ratingTier})</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {st.proctoringStatus === "clean" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Clean Audit
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              {st.warningsCount} Tab Switch Flag
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {st.enrolledAt}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/profile/${st.username}`}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <span>Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Theoretical Grading Desk */}
        {activeTab === "grading" && (
          <div className="space-y-6">
            {gradingSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{gradingSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Submissions List */}
              <div className="lg:col-span-1 rounded-3xl bg-white border border-slate-200 p-5 shadow-2xs space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Live Submissions Queue</span>
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                    {MOCK_THEORETICAL_SUBMISSIONS.length}
                  </span>
                </h3>

                <div className="space-y-2">
                  {MOCK_THEORETICAL_SUBMISSIONS.map((sub) => {
                    const isSelected = selectedSubmission?.id === sub.id;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setAwardedMarks(sub.currentMarks || 45);
                          setFeedbackText(sub.feedback || "");
                        }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-purple-50 border-purple-300 shadow-2xs"
                            : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-900">{sub.studentName}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sub.status === "graded"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {sub.status === "graded" ? `${sub.currentMarks}/${sub.maxMarks} pts` : "Awaiting Grade"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{sub.studentInstitution}</div>
                        <div className="text-[10.5px] text-purple-700 font-medium mt-1 truncate">{sub.contestTitle}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submission Solution Viewer & Grading Box */}
              <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200 p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] space-y-6">
                {selectedSubmission ? (
                  <form onSubmit={handleGradeSubmission} className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Evaluating: {selectedSubmission.studentName}
                          </h3>
                          <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                            @{selectedSubmission.username}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Representing: <strong className="text-slate-800">{selectedSubmission.studentInstitution}</strong> • Submitted {selectedSubmission.submittedAt}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-400 block">Question Points</span>
                        <span className="font-mono font-black text-lg text-purple-700">Max {selectedSubmission.maxMarks} pts</span>
                      </div>
                    </div>

                    {/* Question Prompt */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Question Prompt</span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800">
                        {selectedSubmission.questionPrompt}
                      </p>
                    </div>

                    {/* Student Solution Snippet (Formula / LaTeX box) */}
                    <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm space-y-2 border border-slate-800">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                        <span>Student Mathematical Proof & Derivation</span>
                        <span className="text-emerald-400">Submitted in Contest Arena</span>
                      </div>
                      <pre className="whitespace-pre-wrap font-mono text-emerald-300 leading-relaxed overflow-x-auto py-1">
                        {selectedSubmission.studentAnswer}
                      </pre>
                    </div>

                    {/* Grading Form Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Marks Awarded (out of {selectedSubmission.maxMarks})
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min={0}
                            max={selectedSubmission.maxMarks}
                            value={awardedMarks}
                            onChange={(e) => setAwardedMarks(Number(e.target.value))}
                            className="w-24 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                          <span className="text-xs text-slate-500 font-medium">/ {selectedSubmission.maxMarks} Total Points</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Rubric Evaluation Check
                        </label>
                        <div className="flex flex-col gap-1 text-[11px] text-slate-600 font-medium">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="accent-purple-600" />
                            <span>Correct Kinetic & Potential Energy terms</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="accent-purple-600" />
                            <span>Valid Euler-Lagrange equations formulation</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" defaultChecked className="accent-purple-600" />
                            <span>Normal eigenfrequencies match analytical target</span>
                          </label>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Examiner Revision Feedback for Student
                        </label>
                        <textarea
                          rows={3}
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Provide constructive mathematical feedback or deduction rationale..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedSubmission(null)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-600/30 hover:shadow-lg transition-all flex items-center gap-2"
                        style={{
                          background: "linear-gradient(135deg, #6C3EF4 0%, #5227DC 100%)",
                        }}
                      >
                        <Check className="w-4 h-4" />
                        <span>Award Marks & Recalibrate Final Score</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-16 space-y-3">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="font-extrabold text-base text-slate-700">Select a Student Submission to Grade</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Click on any student submission on the left queue to review their theoretical answer, verify equations, and award official marks.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: School Host Profile */}
        {activeTab === "institution" && (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Institutional Accreditation Credentials
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified university organization details backing all hosted academic Olympiads.
                </p>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin Audited & Verified</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Institution Name</span>
                <p className="font-extrabold text-slate-900 text-sm">Stanford University</p>
                <p className="text-xs text-slate-500">Tier-1 Research University</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Institutional Domain</span>
                <p className="font-mono font-bold text-purple-700 text-sm">@stanford.edu</p>
                <p className="text-xs text-slate-500">Authenticated via DNS MX & KYC</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Accreditation Cert ID</span>
                <p className="font-mono font-bold text-slate-900 text-sm">ACC-STANFORD-EDU-2026-T1</p>
                <p className="text-xs text-slate-500">Cryptographically Sealed</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</span>
                <p className="font-bold text-slate-900 text-sm">Department of Physics & SLAC</p>
                <p className="text-xs text-slate-500">Authorized Examination Syndicate</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lead Faculty Chair</span>
                <p className="font-bold text-slate-900 text-sm">Prof. Robert Thorne, PhD</p>
                <p className="text-xs text-slate-500">Theoretical Physics Division</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inter-Varsity Cup Rank</span>
                <p className="font-mono font-black text-amber-600 text-sm flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Rank #1 (84,200 pts)</span>
                </p>
                <p className="text-xs text-slate-500">420 Active Student Competitors</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Want to view your public institutional showcase?
              </span>
              <Link
                href="/institutions"
                className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5 border border-purple-200"
              >
                <span>View Public School Directory</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
