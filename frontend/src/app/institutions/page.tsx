"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { MOCK_INSTITUTIONS, Institution } from "../../data/mockInstitutions";
import {
  Building2,
  GraduationCap,
  Trophy,
  Users,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Medal,
  Award,
  Sparkles,
  ArrowRight,
  X,
  FileCheck,
  BookOpen,
} from "lucide-react";

export default function InstitutionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);

  const filteredInstitutions = useMemo(() => {
    return MOCK_INSTITUTIONS.filter((inst) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        selectedType === "all" ||
        (selectedType === "university" && (inst.type === "University" || inst.type === "Collegiate")) ||
        (selectedType === "high_school" && inst.type === "Preparatory School");

      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedType]);

  const topPodium = useMemo(() => {
    return [...MOCK_INSTITUTIONS].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 3);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-900 relative overflow-x-clip">
      <Navbar />

      {/* Hero Banner with Depth and Brand Purple */}
      <section className="relative bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-md">
        {/* Ambient blurred glow orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 flex items-center gap-1.5 shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Academic Institutional Hub</span>
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
              Verified .edu & .ac Domains
            </span>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Accredited Schools & Universities
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore world-class academic institutions hosting verified Olympiad competitions and fielding premier student delegations in the Inter-Varsity Cup.
            </p>
          </div>

          {/* Quick Search and Filter Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 max-w-2xl">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search university, school, domain, or country..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              {[
                { id: "all", label: "All" },
                { id: "university", label: "Collegiate" },
                { id: "high_school", label: "High Schools" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setSelectedType(btn.id)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedType === btn.id
                      ? "bg-amber-400 text-slate-950 shadow-md font-black"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        
        {/* Inter-Varsity & Inter-School Championship Cup Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Annual Inter-Varsity & School Cup</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Institutional Championship Standings
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-xs sm:text-right">
              Cumulative points and medals won by verified student delegations representing each institution.
            </p>
          </div>

          {/* Top 3 Podium Cards with Depth */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topPodium.map((school, idx) => {
              const isRank1 = idx === 0;
              const isRank2 = idx === 1;

              return (
                <div
                  key={school.id}
                  onClick={() => setSelectedInstitution(school)}
                  className={`rounded-3xl p-6 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isRank1
                      ? "bg-gradient-to-b from-amber-50/90 via-white to-white border-amber-300 shadow-md ring-2 ring-amber-400/20"
                      : isRank2
                      ? "bg-gradient-to-b from-slate-50 via-white to-white border-slate-300 shadow-sm"
                      : "bg-gradient-to-b from-amber-50/40 via-white to-white border-amber-200/80 shadow-sm"
                  }`}
                >
                  {/* Subtle rank badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm shadow-2xs ${
                        isRank1
                          ? "bg-amber-400 text-slate-950"
                          : isRank2
                          ? "bg-slate-200 text-slate-800"
                          : "bg-amber-700/20 text-amber-900"
                      }`}
                    >
                      #{idx + 1}
                    </span>

                    <span className="text-xl">{school.flagEmoji}</span>
                  </div>

                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-1.5 font-extrabold text-base text-slate-900 line-clamp-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      <span>{school.name}</span>
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      @{school.domain} • {school.tier}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Points</span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-purple-700">
                        {school.totalPoints.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Gold</span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-amber-600">
                        {school.medals.gold} 🥇
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Students</span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-slate-800">
                        {school.activeStudentsCount}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs font-bold text-purple-700 group">
                    <span>View Institutional Dossier</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Accredited Institutions Catalog */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              All Accredited Academic Entities ({filteredInstitutions.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">Click any institution to view hosted contests & student honor roll</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstitutions.map((school) => (
              <div
                key={school.id}
                onClick={() => setSelectedInstitution(school)}
                className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                {/* Banner Strip */}
                <div className={`h-24 bg-gradient-to-r ${school.bannerGradient} p-4 flex flex-col justify-between text-white relative`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-xs border border-white/20">
                      {school.tier}
                    </span>
                    <span className="text-lg">{school.flagEmoji}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>@{school.domain}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 font-extrabold text-base text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      <span>{school.name}</span>
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {school.description}
                    </p>
                  </div>

                  {/* Faculty & Hosted Contests */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium text-slate-500">Lead Faculty:</span>
                      <span className="font-bold text-slate-800">{school.facultyOrganizers[0]?.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium text-slate-500">Hosted Contests:</span>
                      <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {school.hostedOlympiads.length} Olympiad Series
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium text-slate-500">Delegation Roster:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {school.activeStudentsCount} Students
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
                    <span>Inspect Profile & Roster</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Institution Dossier Modal */}
      <AnimatePresence>
        {selectedInstitution && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedInstitution(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] bg-white border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Banner */}
              <div className={`h-36 bg-gradient-to-r ${selectedInstitution.bannerGradient} p-6 flex flex-col justify-between text-white relative`}>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
                      {selectedInstitution.tier}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/80 text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedInstitution(null)}
                    className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative z-10 flex items-end justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {selectedInstitution.name} {selectedInstitution.flagEmoji}
                    </h2>
                    <p className="text-xs text-white/80 font-mono mt-0.5">
                      {selectedInstitution.city}, {selectedInstitution.country} • @{selectedInstitution.domain}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-white/80 block">Cup Rank</span>
                    <span className="text-xl font-mono font-black text-amber-300">
                      Rank #{selectedInstitution.rank}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm text-slate-700">
                {/* Description */}
                <p className="text-slate-600 leading-relaxed">
                  {selectedInstitution.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Points</span>
                    <span className="font-mono font-bold text-sm text-purple-700">
                      {selectedInstitution.totalPoints.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Medals Won</span>
                    <span className="font-mono font-bold text-sm text-amber-600">
                      {selectedInstitution.medals.gold}G • {selectedInstitution.medals.silver}S • {selectedInstitution.medals.bronze}B
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Student Delegation</span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {selectedInstitution.activeStudentsCount} Active
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Certificate ID</span>
                    <span className="font-mono font-bold text-[11px] text-slate-800 truncate block">
                      {selectedInstitution.accreditationCertificateId}
                    </span>
                  </div>
                </div>

                {/* Faculty Organizers */}
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    <span>Authorized Faculty Organizers & Examiners</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedInstitution.facultyOrganizers.map((fac) => (
                      <div key={fac.email} className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {fac.name.split(" ")[1]?.charAt(0) || "P"}
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-xs text-slate-900 block truncate">{fac.name}</span>
                          <span className="text-[11px] text-slate-500 block truncate">{fac.title}</span>
                          <span className="text-[10px] font-mono text-purple-700 truncate block">{fac.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hosted Olympiads */}
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-purple-600" />
                    <span>Official Hosted Olympiads</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedInstitution.hostedOlympiads.map((comp) => (
                      <div key={comp.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">{comp.title}</span>
                          <span className="text-[11px] text-slate-500">{comp.category} • {comp.participantsCount.toLocaleString()} participants</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                          {comp.status.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Student Competitors Honor Roll */}
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>Top Student Competitors (School Honor Roll)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedInstitution.topStudents.map((st) => (
                      <Link
                        key={st.username}
                        href={`/profile/${st.username}`}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-colors block"
                      >
                        <span className="font-bold text-xs text-slate-900 block truncate">{st.name}</span>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                          <span>Rating: <strong className="text-purple-700">{st.rating}</strong></span>
                          <span>{st.contestsWon} wins</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Accreditation verified by Olympido Examination Board
                </span>
                <button
                  onClick={() => setSelectedInstitution(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
