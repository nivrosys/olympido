"use client";

import React, { useState } from "react";
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
  BookOpen,
  Share2,
  Check
} from "lucide-react";

interface CompetitionModalProps {
  competition: Competition | null;
  onClose: () => void;
  onRegisterSuccess?: (compTitle: string) => void;
}

export const CompetitionModal: React.FC<CompetitionModalProps> = ({
  competition,
  onClose,
  onRegisterSuccess,
}) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!competition) return null;

  const handleRegister = () => {
    setIsRegistered(true);
    onRegisterSuccess?.(competition.title);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Banner */}
        <div className={`h-36 sm:h-44 bg-gradient-to-r ${competition.bannerGradient} relative p-6 flex flex-col justify-between text-white overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />

          {/* Close button & Category */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
              {competition.categoryLabel} • {competition.difficulty}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title & Points on Banner */}
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-2 line-clamp-2">
              {competition.title}
            </h2>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1 bg-amber-400 text-gray-950 px-2.5 py-0.5 rounded-md shadow-xs">
                <Trophy className="w-3.5 h-3.5" />
                +{competition.pointsAwarded.toLocaleString()} Points
              </span>
              <span className="bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-md">
                Duration: {competition.durationMinutes} Minutes
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700">
          
          {/* Verified Institutional Organizer Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-xs">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                  <span>{competition.organizer.name}</span>
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-xs text-gray-500">
                  Institutional Domain: <span className="font-mono text-purple-700 font-semibold">@{competition.organizer.domain}</span> ({competition.organizer.type})
                </div>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-1 bg-white text-purple-700 rounded-lg border border-purple-200">
              Admin Verified
            </span>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About the Olympiad</h4>
            <p className="text-gray-600 leading-relaxed">
              {competition.description}
            </p>
          </div>

          {/* Schedule & Logistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Contest Date</span>
              </div>
              <div className="font-bold text-gray-900 text-xs sm:text-sm">
                {competition.contestDate}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Registration Closes</span>
              </div>
              <div className="font-bold text-gray-900 text-xs sm:text-sm">
                {competition.registrationDeadline}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Registered Pool</span>
              </div>
              <div className="font-bold text-gray-900 text-xs sm:text-sm">
                {competition.participantsCount.toLocaleString()} Students
              </div>
            </div>
          </div>

          {/* Prizes & Awards */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Official Recognition & Prizes</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-800">
              {competition.prizes}. All participants completing the contest will receive an official, cryptographic **Olympido Verifiable Scorecard** with rating delta updates.
            </p>
          </div>

        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 font-semibold text-xs transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? "Link Copied!" : "Share"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleRegister}
              disabled={isRegistered}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                isRegistered
                  ? "bg-emerald-600 text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white active:scale-98"
              }`}
            >
              {isRegistered ? (
                <>
                  <Check className="w-4 h-4" /> Registered Successfully
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" /> Confirm Registration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
