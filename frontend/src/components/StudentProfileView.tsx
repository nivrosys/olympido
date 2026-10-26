"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MOCK_STUDENT_PROFILES, StudentProfileData } from "../data/mockProfile";
import { useAuth } from "../context/AuthContext";
import {
  Trophy,
  Award,
  Crown,
  CheckCircle2,
  Share2,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  ExternalLink,
  QrCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Atom,
  Calculator,
  Code2,
  Globe,
  MapPin,
  Check,
  ChevronRight,
  Flame,
} from "lucide-react";

interface StudentProfileViewProps {
  username?: string;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({ username }) => {
  const { user } = useAuth();
  const targetUsername = username || user?.username || "marcus_v";
  const mockProfile: StudentProfileData = MOCK_STUDENT_PROFILES[targetUsername] || MOCK_STUDENT_PROFILES.marcus_v;

  const profile: StudentProfileData =
    user && (user.username === targetUsername || !username)
      ? {
          ...mockProfile,
          fullName: user.fullName || mockProfile.fullName,
          username: user.username || mockProfile.username,
          institution: user.institutionName || mockProfile.institution,
          rating: user.studentStats?.currentRating || mockProfile.rating,
          peakRating: user.studentStats?.peakRating || mockProfile.peakRating,
          totalPoints: user.studentStats?.totalPoints
            ? Number(user.studentStats.totalPoints)
            : mockProfile.totalPoints,
          contestsParticipated:
            user.studentStats?.contestsParticipated || mockProfile.contestsParticipated,
          podiumsCount: user.studentStats?.podiumFinishes || mockProfile.podiumsCount,
        }
      : mockProfile;

  const [activeTab, setActiveTab] = useState<"contests" | "achievements" | "subjects">("contests");
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const renderAchievementIcon = (icon: string) => {
    switch (icon) {
      case "Crown": return <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />;
      case "Calculator": return <Calculator className="w-5 h-5 text-purple-600" />;
      case "Atom": return <Atom className="w-5 h-5 text-blue-600" />;
      case "Sparkles": return <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />;
      default: return <Award className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-900 relative">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Profile Header Hero Card with Depth */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] overflow-hidden">
          {/* Cover Banner with Ambient Gradients */}
          <div
            className="h-44 sm:h-52 relative p-6 flex flex-col justify-between overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #6C3EF4 0%, #4B21D4 45%, #251068 100%)",
            }}
          >
            {/* Ambient glowing blobs */}
            <div className="absolute -top-12 -right-12 w-80 h-80 rounded-full bg-purple-400/20 blur-3xl pointer-events-none animate-blob" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-amber-400/20 blur-3xl pointer-events-none animate-blob animation-delay-2000" />
            
            <div className="relative z-10 flex items-center justify-between text-white">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Verified Student Profile • Public Registry
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? "Profile Link Copied!" : "Share Profile"}</span>
              </button>
            </div>
          </div>

          {/* Profile Details Bar */}
          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
              {/* Avatar with Animated Tier Ring */}
              <div className="flex items-end gap-4">
                <div className="relative">
                  <div
                    className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr ${profile.avatarGradient} flex items-center justify-center text-white font-black text-3xl sm:text-4xl shadow-xl ring-4 ring-white border-4 border-amber-300/80`}
                  >
                    {profile.avatar}
                  </div>
                  {/* Tier Crown Badge */}
                  <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/30 ring-2 ring-white">
                    <Crown className="w-5 h-5 fill-slate-950" />
                  </div>
                </div>

                {/* Name & Handle */}
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <h1
                      className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {profile.name}
                    </h1>
                    <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    <span className="font-semibold text-slate-700">@{profile.username}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-purple-700 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {profile.institution}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {profile.country}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating & Global Rank Badges */}
              <div className="flex items-center gap-3 self-start md:self-auto">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-center shadow-xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
                    Global Standing
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">
                    #{profile.globalRank}
                  </div>
                </div>
                <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-50 border border-purple-200/90 text-center shadow-xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 block">
                    {profile.tier}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5">
                    {profile.currentRating} <span className="text-xs font-semibold text-purple-600">Elo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio paragraph */}
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {profile.bio}
            </p>
          </div>
        </div>

        {/* Weekly & Monthly Performance Stats Strip (4 Depth Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_24px_-4px_rgba(108,62,244,0.1)] transition-all">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Points This Week
            </span>
            <div className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              +{profile.stats.pointsThisWeek.toLocaleString()}
            </div>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              Rank #1 in Regional Pool
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_24px_-4px_rgba(108,62,244,0.1)] transition-all">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Points This Month
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              +{profile.stats.pointsThisMonth.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Cumulative monthly ladder
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_24px_-4px_rgba(108,62,244,0.1)] transition-all">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Completed Contests
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {profile.stats.contestsCompleted}
            </div>
            <span className="text-[11px] text-purple-700 font-bold mt-1 block">
              100% Proctored Verified
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_24px_-4px_rgba(108,62,244,0.1)] transition-all">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Win / Top 10% Ratio
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {profile.stats.winRatio}%
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              {profile.stats.perfectScores} Perfect Scorecards
            </span>
          </div>
        </div>

        {/* Rating Progression Timeline Chart Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-2xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Rating History & Elo Trajectory
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Official rating progress evaluated from accredited competition results over time.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 self-start sm:self-auto">
              Peak: {profile.peakRating} Elo
            </span>
          </div>

          {/* Interactive SVG Progression Curve */}
          <div className="w-full h-48 sm:h-56 relative pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C3EF4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6C3EF4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="70" x2="600" y2="70" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#F1F5F9" strokeWidth="1" />

              {/* Area fill */}
              <polygon
                fill="url(#chartGradient)"
                points="20,130 115,100 230,80 345,55 460,40 575,18 575,160 20,160"
              />

              {/* Line path */}
              <path
                d="M 20 130 Q 80 115 115 100 T 230 80 T 345 55 T 460 40 T 575 18"
                fill="none"
                stroke="#6C3EF4"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {[
                { cx: 20, cy: 130, val: "1850", name: "Jan" },
                { cx: 115, cy: 100, val: "2020", name: "Feb" },
                { cx: 230, cy: 80, val: "2150", name: "Mar" },
                { cx: 345, cy: 55, val: "2290", name: "Apr" },
                { cx: 460, cy: 40, val: "2366", name: "May" },
                { cx: 575, cy: 18, val: "2480", name: "Oct" },
              ].map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.cx}
                    cy={pt.cy}
                    r="5.5"
                    fill="#FFFFFF"
                    stroke="#6C3EF4"
                    strokeWidth="3"
                    className="hover:r-7 transition-all cursor-pointer"
                  />
                  <text
                    x={pt.cx}
                    y={pt.cy - 12}
                    textAnchor="middle"
                    className="text-[11px] font-extrabold fill-slate-800 font-mono"
                  >
                    {pt.val}
                  </text>
                  <text
                    x={pt.cx}
                    y="155"
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-400"
                  >
                    {pt.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Tabbed Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab("contests")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "contests"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Contest History ({profile.contests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "achievements"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Achievements ({profile.achievements.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("subjects")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "subjects"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Atom className="w-4 h-4" />
            <span>Subject Mastery</span>
          </button>
        </div>

        {/* Tab Content 1: Contests & Verified Scorecards */}
        {activeTab === "contests" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.contests.map((contest) => (
                <motion.div
                  key={contest.id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] hover:shadow-[0_16px_32px_-4px_rgba(108,62,244,0.12)] hover:border-purple-300 transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Bar of Card */}
                  <div className={`p-4 bg-gradient-to-r ${contest.bannerGradient} text-white flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-black/40 backdrop-blur-xs text-amber-300">
                        {contest.status}
                      </span>
                      <span className="text-xs font-bold text-purple-100">
                        Rank #{contest.rank} of {contest.totalParticipants.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold">
                      {contest.date}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4
                        className="font-extrabold text-base sm:text-lg text-slate-900 mb-3"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {contest.title}
                      </h4>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Score</span>
                          <span className="font-black text-slate-900">{contest.score}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Percentile</span>
                          <span className="font-black text-emerald-600">{contest.percentile}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Rating Δ</span>
                          <span className="font-black text-purple-700">+{contest.ratingDelta}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: View Verified Scorecard */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400 truncate max-w-[150px]">
                        {contest.verifyHash.slice(0, 14)}...
                      </span>
                      <Link
                        href={`/verify/${contest.verifyHash}`}
                        className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors flex items-center gap-1.5 border border-purple-200 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Public Scorecard</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 2: Achievements Showcase */}
        {activeTab === "achievements" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {profile.achievements.map((ach) => (
              <motion.div
                key={ach.id}
                whileHover={{ y: -3 }}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] hover:border-purple-300 transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 shadow-2xs">
                  {renderAchievementIcon(ach.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="font-extrabold text-sm text-slate-900">{ach.title}</h4>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        ach.rarity === "Legendary"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : ach.rarity === "Epic"
                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {ach.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2 font-normal">
                    {ach.description}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Unlocked: {ach.unlockedAt} • {ach.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tab Content 3: Subject Mastery */}
        {activeTab === "subjects" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] space-y-6">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Academic Competency by Discipline
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ratings are independently computed from performance in accredited subject Olympiads.
              </p>
            </div>

            <div className="space-y-5">
              {profile.subjects.map((sub, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{sub.name}</h4>
                      <span className="text-xs text-purple-700 font-semibold">{sub.level}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">{sub.rating} Elo</span>
                      <span className="text-xs text-emerald-600 font-bold block">{sub.percentile}th Percentile</span>
                    </div>
                  </div>

                  {/* Mastery Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full ${sub.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(sub.rating / 2600) * 100}%` }}
                    />
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
};
