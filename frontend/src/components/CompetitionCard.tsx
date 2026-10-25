"use client";

import React from "react";
import { motion } from "framer-motion";
import { Competition } from "../data/mockCompetitions";
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  Award,
  Sparkles,
} from "lucide-react";

interface CompetitionCardProps {
  competition: Competition;
  onSelect?: (competition: Competition) => void;
  featured?: boolean;
}

const categoryStyles: Record<string, { bg: string; text: string; border: string }> = {
  physics: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  mathematics: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  coding: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  chemistry: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  astronomy: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  biology: { bg: "bg-cyan-50", text: "text-cyan-800", border: "border-cyan-200" },
};

export const CompetitionCard: React.FC<CompetitionCardProps> = ({
  competition,
  onSelect,
  featured = false,
}) => {
  const getStatusBadge = () => {
    switch (competition.status) {
      case "live":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white shadow-md shadow-rose-600/30">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            Live Now
          </span>
        );
      case "registration_open":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Registration Open
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Starting Soon
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
            Completed
          </span>
        );
    }
  };

  const catStyle = categoryStyles[competition.category] || categoryStyles.physics;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      onClick={() => onSelect?.(competition)}
      className={`group relative rounded-2xl flex flex-col overflow-hidden cursor-pointer bg-white border transition-all duration-300 ${
        featured
          ? "border-purple-200 shadow-[0_8px_24px_-4px_rgba(108,62,244,0.12)] hover:border-purple-400 hover:shadow-[0_20px_40px_-6px_rgba(108,62,244,0.2)]"
          : "border-slate-200/90 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] hover:border-purple-300 hover:shadow-[0_20px_36px_-6px_rgba(108,62,244,0.15)]"
      }`}
    >
      {/* Card Header Gradient Banner */}
      <div className={`h-32 sm:h-36 bg-gradient-to-r ${competition.bannerGradient} relative p-4 flex flex-col justify-between overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <div
          className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full pointer-events-none bg-white/10 blur-xl"
        />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 bg-black/45 backdrop-blur-md text-white border border-white/20">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            {competition.difficulty}
          </span>
          {getStatusBadge()}
        </div>

        {/* Bottom Banner Info */}
        <div className="relative z-10 flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-lg bg-black/45 backdrop-blur-md border border-white/20">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>+{competition.pointsAwarded.toLocaleString()} Points</span>
          </div>
          {featured && (
            <span className="text-[11px] font-bold flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/30">
              <Sparkles className="w-3 h-3 fill-slate-950" /> Featured
            </span>
          )}
        </div>
      </div>

      {/* Card Body with High-Contrast Typography */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Category & Organizer */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
              {competition.categoryLabel}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="truncate max-w-[140px]">{competition.organizer.name}</span>
              {competition.organizer.isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              )}
            </div>
          </div>

          {/* Title */}
          <h3
            className="font-extrabold text-lg leading-snug line-clamp-2 mb-2 text-slate-900 group-hover:text-purple-700 transition-colors"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {competition.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed text-slate-600 font-normal">
            {competition.description}
          </p>

          {/* Metadata */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {competition.contestDate}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {competition.durationMinutes} mins
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {competition.participantsCount.toLocaleString()} enrolled
              </span>
              <span className="text-[11px] font-bold text-purple-700">
                Closes: {competition.registrationDeadline}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Button with High Depth */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs font-medium truncate mr-2">
            <span className="text-slate-400">Award:</span>{" "}
            <span className="text-slate-700 font-semibold">{competition.prizes}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm ${
              competition.status === "live"
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25"
                : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25"
            }`}
          >
            {competition.status === "live" ? "Enter Live" : "Register"}
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
