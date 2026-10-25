"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { 
  getPendingContests, 
  approveContestByAdmin, 
  rejectContestByAdmin, 
  requestChangesByAdmin,
  PendingContest
} from "../../data/contestStore";
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  ArrowLeft, 
  Trophy, 
  Clock, 
  Calendar, 
  Eye, 
  Send,
  Building2,
  FileCheck,
  Check,
  ExternalLink,
  Users,
  GraduationCap,
  ShieldAlert,
  HelpCircle,
  FileText,
  Activity,
  Layers,
  Search,
  Filter,
} from "lucide-react";

export default function AdminConsolePage() {
  const [pendingList, setPendingList] = useState<PendingContest[]>([]);
  const [selectedContest, setSelectedContest] = useState<PendingContest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "institutions" | "integrity">("pending");

  // Sample institutional applications from Schools & Universities
  const [institutions, setInstitutions] = useState([
    {
      id: "inst-1",
      name: "Stanford University",
      department: "Department of Physics & SLAC",
      domain: "stanford.edu",
      contactEmail: "chair@physics.stanford.edu",
      status: "verified",
      accreditationType: "Tier-1 Research University",
      studentCapacity: "Unlimited",
      verifiedAt: "Oct 15, 2026",
    },
    {
      id: "inst-2",
      name: "University of Cambridge",
      department: "Cavendish Laboratory & Theoretical Physics",
      domain: "cam.ac.uk",
      contactEmail: "olympiad@cam.ac.uk",
      status: "verified",
      accreditationType: "Tier-1 Collegiate University",
      studentCapacity: "Unlimited",
      verifiedAt: "Oct 18, 2026",
    },
    {
      id: "inst-3",
      name: "Tokyo Science Olympiad Committee",
      department: "Faculty of Science & Mathematics",
      domain: "u-tokyo.ac.jp",
      contactEmail: "olympiad@adm.u-tokyo.ac.jp",
      status: "pending",
      accreditationType: "National Academic Body",
      studentCapacity: "5,000 Students",
      verifiedAt: "Awaiting Audit",
    },
    {
      id: "inst-4",
      name: "Phillips Exeter Academy",
      department: "Senior Mathematics & Physics Faculty",
      domain: "exeter.edu",
      contactEmail: "stem@exeter.edu",
      status: "pending",
      accreditationType: "Accredited Preparatory School",
      studentCapacity: "1,500 Students",
      verifiedAt: "Awaiting Audit",
    },
  ]);

  // Student integrity log
  const integrityLogs = [
    { id: "log-1", student: "Marcus Vance (@marcus_v)", contest: "International Euler Math 2026", infractions: 0, status: "Clean Audit", time: "10 mins ago" },
    { id: "log-2", student: "Elena Rostova (@elena_phys)", contest: "National Youth Physics 2026", infractions: 1, status: "Warning Issued (Tab Switch)", time: "25 mins ago" },
    { id: "log-3", student: "Kevin Chen (@kchen_algo)", contest: "Turing Cup Algorithmic 2026", infractions: 0, status: "Clean Audit", time: "1 hour ago" },
  ];

  useEffect(() => {
    setPendingList(getPendingContests());
  }, []);

  const handleApprove = (contestId: string) => {
    const approved = approveContestByAdmin(contestId);
    if (approved) {
      setFeedbackSuccess(`✓ "${approved.title}" has been APPROVED and published live on the Olympiad catalog!`);
      setPendingList(getPendingContests());
      setSelectedContest(null);
      setTimeout(() => setFeedbackSuccess(null), 5000);
    }
  };

  const handleReject = (contestId: string) => {
    rejectContestByAdmin(contestId, adminNotes || "Does not meet platform quality standards.");
    setFeedbackSuccess(`Contest has been rejected. Revision feedback recorded for the School Organizer.`);
    setPendingList(getPendingContests());
    setSelectedContest(null);
    setAdminNotes("");
    setTimeout(() => setFeedbackSuccess(null), 5000);
  };

  const handleRequestChanges = (contestId: string) => {
    if (!adminNotes) {
      alert("Please provide revision feedback notes for the organizer.");
      return;
    }
    requestChangesByAdmin(contestId, adminNotes);
    setFeedbackSuccess(`Revision request and diff feedback sent to the School Organizer.`);
    setPendingList(getPendingContests());
    setSelectedContest(null);
    setAdminNotes("");
    setTimeout(() => setFeedbackSuccess(null), 5000);
  };

  const handleVerifyInstitution = (id: string) => {
    setInstitutions(
      institutions.map((inst) =>
        inst.id === id ? { ...inst, status: "verified", verifiedAt: "Just now" } : inst
      )
    );
    setFeedbackSuccess("✓ Institutional domain verified. Full contest creation privileges granted.");
    setTimeout(() => setFeedbackSuccess(null), 4000);
  };

  const pendingCount = pendingList.filter((c) => c.adminReviewStatus === "pending").length;
  const pendingInstCount = institutions.filter((i) => i.status === "pending").length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-900 relative">
      <Navbar currentRole="admin" />

      {/* Admin Top Notification */}
      {feedbackSuccess && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-right duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* Admin Dashboard Header Banner with Depth */}
      <div className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-purple-700 font-extrabold uppercase tracking-wider mb-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Platform Administration & Academic Moderation Console</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              School & Contest Approval Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Audit submitted Olympiads from Schools & Universities, verify .edu institutional domains, and monitor student integrity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Public Arena
            </Link>
            <Link
              href="/create-contest"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-md shadow-purple-600/25 flex items-center gap-1.5"
            >
              <span>+ Create Contest</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Admin Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Navigation Tabs with Badges */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "pending"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Contest Approval Queue</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("institutions")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "institutions"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>School / University Accreditation</span>
            {pendingInstCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                {pendingInstCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("integrity")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "integrity"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Student Integrity & Proctoring</span>
          </button>
        </div>

        {/* TAB 1: Contest Approval Queue */}
        {activeTab === "pending" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Submitted Contests Awaiting Academic Audit
              </h3>
              <span className="text-xs text-slate-500">
                Showing {pendingList.length} submissions
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {pendingList.map((contest) => (
                <div
                  key={contest.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] hover:border-purple-300 transition-all p-6 space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md">
                          {contest.categoryLabel}
                        </span>
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {contest.difficulty}
                        </span>
                        <span
                          className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                            contest.adminReviewStatus === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : contest.adminReviewStatus === "changes_requested"
                              ? "bg-amber-100 text-amber-800"
                              : contest.adminReviewStatus === "rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}
                        >
                          {contest.adminReviewStatus === "pending"
                            ? "Awaiting Admin Review"
                            : contest.adminReviewStatus.toUpperCase()}
                        </span>
                      </div>
                      <h4
                        className="font-black text-lg sm:text-xl text-slate-900"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {contest.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Submitted: {contest.submittedAt} • Duration: {contest.durationMinutes} mins • {contest.questionCount} Questions
                      </p>
                    </div>

                    {/* School / Host Credential */}
                    <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        <span>{contest.schoolInfo?.schoolName || contest.organizer.name}</span>
                      </div>
                      <span className="text-purple-700 font-mono text-[11px] block mt-0.5">
                        Domain: @{contest.schoolInfo?.domain || contest.organizer.domain} (Verified Host)
                      </span>
                    </div>
                  </div>

                  {/* Student Eligibility & Syllabus Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Target Student Levels</span>
                      <span className="font-bold text-slate-800">
                        {contest.studentEligibility?.targetLevels?.join(", ") || "Senior High School & Undergrad"}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Plagiarism & AI Similarity</span>
                      <span className="font-black text-emerald-700">
                        {contest.plagiarismScore || 99.4}% Original • Low AI
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Student Rating / Capacity</span>
                      <span className="font-bold text-slate-800">
                        Min {contest.studentEligibility?.minRating || 1200} Elo • Max {contest.studentEligibility?.maxCapacity || 2500}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {contest.description}
                  </p>

                  {/* Action Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedContest(selectedContest?.id === contest.id ? null : contest)}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{selectedContest?.id === contest.id ? "Close Drawer" : "Inspect Problem Set"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(contest.id)}
                        className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleRequestChanges(contest.id)}
                        className="px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleApprove(contest.id)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Publish Live</span>
                      </button>
                    </div>
                  </div>

                  {/* Diff & Inspection Drawer if Selected */}
                  {selectedContest?.id === contest.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-4"
                    >
                      <h5 className="font-extrabold text-sm text-purple-950 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span>Administrative Revision Notes & Inline Feedback</span>
                      </h5>
                      <textarea
                        rows={3}
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Type direct feedback or revision instructions for the School Organizer (e.g. 'Please adjust problem 2 prompt clarity and clarify LaTeX formula syntax')..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-purple-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: School & University Accreditation Desk */}
        {activeTab === "institutions" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Institutional Domain Accreditation Directory
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Schools and Universities requesting contest host privileges with official .edu/.ac domains.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                {institutions.length} Institutions Enrolled
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {institutions.map((inst) => (
                <div key={inst.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-slate-900">{inst.name}</h4>
                      <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        @{inst.domain}
                      </span>
                      {inst.status === "verified" ? (
                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                          Verified Host ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                          Pending Audit
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{inst.department} • Contact: {inst.contactEmail}</p>
                    <p className="text-[11px] text-slate-400">Accreditation: {inst.accreditationType} • Capacity: {inst.studentCapacity}</p>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    {inst.status === "verified" ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accredited</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleVerifyInstitution(inst.id)}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Grant Host Accreditation
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Student Integrity & Proctoring Monitor */}
        {activeTab === "integrity" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Live Student Examination Integrity Monitor
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time anti-cheat proctoring logs and student tab-switch tracking.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Proctoring Active
              </span>
            </div>

            <div className="space-y-3">
              {integrityLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{log.student}</h4>
                    <p className="text-slate-500">{log.contest}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg font-bold ${
                      log.infractions === 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                    }`}>
                      {log.status}
                    </span>
                    <span className="text-slate-400 text-[11px]">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
