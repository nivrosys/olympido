"use client";

import React from "react";
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
  ExternalLink
} from "lucide-react";

interface CompetitionCardProps {
  competition: Competition;
  onSelect?: (competition: Competition) => void;
  featured?: boolean;
}

export const CompetitionCard: React.FC<CompetitionCardProps> = ({
  competition,
  onSelect,
  featured = false,
}) => {
  const getStatusBadge = () => {
    switch (competition.status) {
      case "live":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-xs animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            Live Arena Now
          </span>
        );
      case "registration_open":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Registration Open
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Starting Soon
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            Completed
          </span>
        );
    }
  };

  const getCategoryTheme = () => {
    switch (competition.category) {
      case "physics":
        return { tagBg: "bg-blue-50 text-blue-700 border-blue-200", border: "hover:border-blue-300" };
      case "mathematics":
        return { tagBg: "bg-purple-50 text-purple-700 border-purple-200", border: "hover:border-purple-300" };
      case "coding":
        return { tagBg: "bg-emerald-50 text-emerald-700 border-emerald-200", border: "hover:border-emerald-300" };
      case "chemistry":
        return { tagBg: "bg-rose-50 text-rose-700 border-rose-200", border: "hover:border-rose-300" };
      case "astronomy":
        return { tagBg: "bg-amber-50 text-amber-700 border-amber-200", border: "hover:border-amber-300" };
      default:
        return { tagBg: "bg-indigo-50 text-indigo-700 border-indigo-200", border: "hover:border-indigo-300" };
    }
  };

  const theme = getCategoryTheme();

  return (
    <div
      onClick={() => onSelect?.(competition)}
      className={`group relative bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer ${theme.border} ${
        featured ? "ring-1 ring-purple-500/20" : ""
      }`}
    >
      {/* Card Header Gradient Banner */}
      <div className={`h-28 sm:h-32 bg-gradient-to-r ${competition.bannerGradient} relative p-4 flex flex-col justify-between overflow-hidden`}>
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 text-gray-900 shadow-xs backdrop-blur-xs flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-purple-600" />
            {competition.difficulty}
          </span>
          {getStatusBadge()}
        </div>

        {/* Bottom Banner Info: Points Award */}
        <div className="relative z-10 flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 text-xs font-bold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>+{competition.pointsAwarded.toLocaleString()} Olympiad Points</span>
          </div>
          {featured && (
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-300/30">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Institutional Organizer */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${theme.tagBg}`}>
              {competition.categoryLabel}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="font-medium truncate max-w-[150px]">{competition.organizer.name}</span>
              {competition.organizer.isVerified && (
                <span title={`Verified institutional email: @${competition.organizer.domain}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 mb-2">
            {competition.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
            {competition.description}
          </p>

          {/* Metadata Grid: Schedule & Duration */}
          <div className="space-y-1.5 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{competition.contestDate}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{competition.durationMinutes} mins</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-gray-500">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span>{competition.participantsCount.toLocaleString()} enrolled</span>
              </span>
              <span className="text-[11px] text-purple-700 font-medium">
                Closes: {competition.registrationDeadline}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer Button */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs font-medium text-gray-500 truncate mr-2">
            <span className="text-gray-400">Award:</span> {competition.prizes}
          </div>
          <button
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              competition.status === "live"
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                : "bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white"
            }`}
          >
            {competition.status === "live" ? "Enter Live" : "Register"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
