"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  ExternalLink
} from "lucide-react";

export default function AdminConsolePage() {
  const [pendingList, setPendingList] = useState<PendingContest[]>([]);
  const [selectedContest, setSelectedContest] = useState<PendingContest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "institutions">("pending");

  // Sample institutional verification applications
  const [institutions, setInstitutions] = useState([
    {
      id: "inst-1",
      name: "Stanford Physics Association",
      domain: "stanford.edu",
      contactEmail: "chair@physics.stanford.edu",
      status: "verified",
      accreditationType: "Tier-1 University",
      verifiedAt: "Oct 15, 2026",
    },
    {
      id: "inst-2",
      name: "Tokyo Science Olympiad Committee",
      domain: "u-tokyo.ac.jp",
      contactEmail: "olympiad@adm.u-tokyo.ac.jp",
      status: "pending",
      accreditationType: "National Academic Body",
      verifiedAt: "Awaiting Audit",
    },
  ]);

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
    setFeedbackSuccess(`Contest has been rejected. Feedback recorded for organizer.`);
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
    setFeedbackSuccess(`Revision request sent to organizer with review notes.`);
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
    setFeedbackSuccess("Institutional domain verified. Organizer privileges granted.");
    setTimeout(() => setFeedbackSuccess(null), 4000);
  };

  const pendingCount = pendingList.filter((c) => c.adminReviewStatus === "pending").length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar currentRole="admin" />

      {/* Admin Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-purple-400 font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Administration & Moderation Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Olympiad Review & Approval Desk
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Audit submitted contests, verify institutional domains, and approve events for the public catalog.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Site
            </Link>
            <Link
              href="/create-contest"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              + Create Sample Contest
            </Link>
          </div>
        </div>
      </div>

      {/* Toast Banner */}
      {feedbackSuccess && (
        <div className="bg-emerald-600 text-white px-4 py-3 text-xs sm:text-sm font-semibold shadow-md animate-in slide-in-from-top duration-200">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab("pending")}
            className={`py-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "pending"
                ? "border-purple-600 text-purple-700 font-extrabold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span>Contest Moderation Queue</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-100 text-amber-900 font-extrabold">
              {pendingCount} Pending
            </span>
          </button>

          <button
            onClick={() => setActiveTab("institutions")}
            className={`py-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "institutions"
                ? "border-purple-600 text-purple-700 font-extrabold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Institutional Domain Verification</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-purple-100 text-purple-700 font-extrabold">
              1 Pending
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* TAB 1: PENDING CONTEST QUEUE */}
        {activeTab === "pending" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Submitted Contests Requiring Audit</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Every contest must be approved by an Admin before appearing on the public calendar.
                </p>
              </div>
            </div>

            {pendingList.length > 0 ? (
              <div className="space-y-4">
                {pendingList.map((contest) => (
                  <div
                    key={contest.id}
                    className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    {/* Contest Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                          {contest.categoryLabel}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-800">
                          {contest.difficulty}
                        </span>
                        {contest.adminReviewStatus === "pending" ? (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" /> Awaiting Review ({contest.submittedAt})
                          </span>
                        ) : contest.adminReviewStatus === "approved" ? (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved & Live
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            {contest.adminReviewStatus}
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-extrabold text-gray-900">
                        {contest.title}
                      </h4>

                      <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                        {contest.description}
                      </p>

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-gray-700">
                          <Building2 className="w-3.5 h-3.5 text-purple-600" />
                          {contest.organizer.name} ({contest.organizer.domain})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {contest.contestDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {contest.durationMinutes} mins
                        </span>
                        <span className="flex items-center gap-1 font-bold text-purple-700">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          +{contest.pointsAwarded} Points
                        </span>
                      </div>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                      {contest.adminReviewStatus === "pending" ? (
                        <>
                          <button
                            onClick={() => handleApprove(contest.id)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve & Publish Live
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedContest(contest)}
                              className="flex-1 px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Inspect / Edit
                            </button>
                            <button
                              onClick={() => handleReject(contest.id)}
                              className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs font-bold text-emerald-700">
                          Status: {contest.statusLabel}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 text-base">All Caught Up!</h4>
                <p className="text-xs text-gray-500 mt-1">There are no contests waiting in the approval queue.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INSTITUTIONAL DOMAIN VERIFICATION */}
        {activeTab === "institutions" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Educational Institutional Whitelist</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Verify official school, university, and Olympiad committee domains to authorize contest creation privileges.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                <span>Institution & Official Domain</span>
                <span className="hidden sm:inline">Accreditation</span>
                <span>Verification Action</span>
              </div>

              <div className="divide-y divide-gray-100">
                {institutions.map((inst) => (
                  <div key={inst.id} className="p-5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900">{inst.name}</span>
                        {inst.status === "verified" ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Verified (.edu)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                            Pending Audit
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        Domain: @{inst.domain} • Contact: {inst.contactEmail}
                      </div>
                    </div>

                    <div className="hidden sm:block text-xs font-medium text-gray-600">
                      {inst.accreditationType}
                    </div>

                    <div>
                      {inst.status === "pending" ? (
                        <button
                          onClick={() => handleVerifyInstitution(inst.id)}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve Domain
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active Host
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Review Drawer Modal */}
      {selectedContest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-gray-900">Admin Audit & Revision Console</h3>
              <button
                onClick={() => setSelectedContest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block">Auditing Contest:</span>
              <strong className="text-base text-gray-900">{selectedContest.title}</strong>
              <p className="text-xs text-purple-700 font-semibold mt-0.5">
                Host: {selectedContest.organizer.name} (@{selectedContest.organizer.domain})
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Feedback Notes for Organizer (Revision Request or Rejection Reason)
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Please clarify problem #2 rubric, or ensure theoretical formulas use standard SI units..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSelectedContest(null)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRequestChanges(selectedContest.id)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Request Revisions
                </button>
                <button
                  onClick={() => handleApprove(selectedContest.id)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
