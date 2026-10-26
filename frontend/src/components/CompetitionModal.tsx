"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Competition } from "../data/mockCompetitions";
import {
  X,
  Trophy,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  ShieldCheck,
  Award,
  Sparkles,
  Share2,
  Check,
  ExternalLink,
  GraduationCap,
  Building2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { contestsApi } from "../lib/api";

interface CompetitionModalProps {
  competition: Competition | null;
  onClose: () => void;
  onRegisterSuccess?: (compTitle: string) => void;
  onRequireAuth?: () => void;
}

export const CompetitionModal: React.FC<CompetitionModalProps> = ({
  competition,
  onClose,
  onRegisterSuccess,
  onRequireAuth,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedStudentSchool, setSelectedStudentSchool] = useState(
    user?.institutionName || "Stanford University"
  );

  if (!competition) return null;

  const handleRegister = async () => {
    if (!isAuthenticated) {
      onRequireAuth?.();
      return;
    }

    setIsRegistering(true);
    setErrorMsg(null);

    try {
      // If competition has a UUID from the backend, invoke API registration
      if (competition.id && competition.id.length > 20) {
        await contestsApi.register(competition.id);
      }
      setIsRegistered(true);
      onRegisterSuccess?.(competition.title);
    } catch (err: any) {
      if (err.statusCode === 409) {
        setIsRegistered(true);
        setErrorMsg("You are already registered for this competition.");
      } else {
        setErrorMsg(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-white border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header Banner */}
          <div
            className={`h-36 sm:h-44 bg-gradient-to-r ${competition.bannerGradient} relative p-6 flex flex-col justify-between text-white overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
                {competition.categoryLabel} • {competition.difficulty}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-md flex items-center justify-center transition-colors text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10">
              <h2
                className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-2 line-clamp-2"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {competition.title}
              </h2>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1 bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md shadow-xs">
                  <Trophy className="w-3.5 h-3.5" />
                  +{competition.pointsAwarded.toLocaleString()} Elo Points
                </span>
                <span className="bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-md">
                  Duration: {competition.durationMinutes} Minutes
                </span>
              </div>
            </div>
          </div>

          {/* Modal Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Olympiad Overview
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {competition.description}
              </p>
            </div>

            {/* Verified Organizer Credential Box */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Building2 className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {competition.organizer.name}
                  </span>
                  {competition.organizer.isVerified && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified Institution
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official Domain: <strong>{competition.organizer.domain}</strong> • Accredited Host
                </p>
              </div>
            </div>

            {/* Student School Affiliation Selector */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Delegation / School Affiliation
                </label>
              </div>
              <select
                value={selectedStudentSchool}
                onChange={(e) => setSelectedStudentSchool(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="Stanford University">Stanford University (Collegiate Division)</option>
                <option value="University of Cambridge">University of Cambridge (Cavendish Lab)</option>
                <option value="Massachusetts Institute of Technology">MIT Olympiad Chapter</option>
                <option value="Independent Competitor">Independent / Self-Registered Competitor</option>
              </select>
            </div>

            {/* Schedule & Logistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span>Contest Date</span>
                </div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                  {competition.contestDate}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Registration Closes</span>
                </div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                  {competition.registrationDeadline}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>Registered Pool</span>
                </div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                  {competition.participantsCount.toLocaleString()} Students
                </div>
              </div>
            </div>

            {/* Prizes & Awards */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Official Recognition & Prizes</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                {competition.prizes}. All participants completing the contest will receive an official, cryptographic <strong>Olympido Verifiable Scorecard</strong> with rating delta updates.
              </p>
            </div>
          </div>

          {/* Modal Footer CTA */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
              <span>{copiedLink ? "Link Copied!" : "Share"}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              {competition.status === "live" ? (
                <a
                  href={`/quiz-attempt?contestId=${competition.id}`}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Enter Live Quiz Arena</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={isRegistered || isRegistering}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    isRegistered
                      ? "bg-emerald-600 text-white shadow-emerald-600/25"
                      : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25 active:scale-98"
                  }`}
                >
                  {isRegistering ? (
                    <span>Registering...</span>
                  ) : isRegistered ? (
                    <>
                      <Check className="w-4 h-4" /> Registered as {selectedStudentSchool}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" /> Register as Student Delegation
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
