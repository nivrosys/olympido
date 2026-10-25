"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Trophy, Users, GraduationCap, Award, ArrowRight, Zap } from "lucide-react";

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExploreClick: () => void;
  activeCategory: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onExploreClick,
}) => {
  const stats = [
    { label: "Active Competitions", value: "500+", icon: Trophy },
    { label: "Students Registered", value: "1.2M+", icon: Users },
    { label: "Verified Institutions", value: "150+", icon: GraduationCap },
    { label: "Olympiad Points Awarded", value: "25M+", icon: Award },
  ];

  return (
    <section
      className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 text-white"
      style={{
        background: "linear-gradient(135deg, #6C3EF4 0%, #5227DC 45%, #3B15A3 100%)",
      }}
    >
      {/* Decorative ambient glowing orbs with CSS animation */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-400/25 blur-3xl pointer-events-none animate-blob" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none animate-blob animation-delay-2000" />
      <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none animate-blob animation-delay-4000" />

      {/* Floating decorative particles */}
      <motion.div
        animate={{ y: [-8, 12, -8], rotate: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-16 left-[12%] w-3 h-3 rounded-full pointer-events-none hidden lg:block bg-amber-300/60 shadow-lg shadow-amber-300/40"
      />
      <motion.div
        animate={{ y: [10, -14, 10], rotate: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-36 right-[15%] w-2.5 h-2.5 rounded-full pointer-events-none hidden lg:block bg-cyan-300/60 shadow-lg shadow-cyan-300/40"
      />
      <motion.div
        animate={{ y: [-6, 10, -6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-28 left-[22%] w-2 h-2 rounded-full pointer-events-none hidden lg:block bg-purple-200/60"
      />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Subtitle Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs sm:text-sm font-semibold mb-6 shadow-sm shadow-purple-900/20"
        >
          <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>AI-Powered Olympiad Discovery & Verifiable Ratings</span>
          <Zap className="w-3.5 h-3.5 text-amber-300" />
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Discover, Compete & Win <br />
          <span className="text-amber-300 drop-shadow-md">
            Top Olympiad Competitions
          </span>
        </motion.h1>

        {/* Subtitle Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl text-purple-100 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Olympido connects high school and university students with accredited science,
          mathematics, and coding Olympiads. Earn global points, advance your rating, and showcase verified digital scorecards.
        </motion.p>

        {/* Interactive Search Bar with Modern Depth Glass */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto mb-14"
        >
          <div className="flex flex-col sm:flex-row gap-2.5 p-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/40 shadow-2xl shadow-purple-950/30 ring-4 ring-white/15">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Physics, Mathematics, Turing Cup, Stanford..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white text-slate-900 rounded-xl text-sm sm:text-base font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-inner"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onExploreClick}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold text-sm sm:text-base transition-all shadow-md shadow-amber-500/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore All</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Metric Statistics Bar with Glass Depth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-white/20 max-w-5xl mx-auto"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                whileHover={{ y: -3, scale: 1.02 }}
                className="flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-lg shadow-purple-950/20 hover:bg-white/15 transition-all text-center"
              >
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center mb-2.5 text-amber-300 border border-white/20">
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm text-purple-200 font-medium mt-1">
                  {stat.label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
