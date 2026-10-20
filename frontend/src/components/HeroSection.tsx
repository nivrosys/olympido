"use client";

import React from "react";
import { Search, Sparkles, Trophy, Users, GraduationCap, Award } from "lucide-react";

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
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 text-white"
      style={{
        background: "linear-gradient(135deg, #6C3EF4 0%, #5227DC 45%, #3B15A3 100%)",
      }}
    >
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Subtitle Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium mb-6 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>AI-Powered Olympiad Discovery & Verifiable Ratings</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          Discover, Compete & Win <br />
          <span className="text-yellow-400 drop-shadow-xs">Top Olympiad Competitions</span>
        </h1>

        {/* Subtitle Paragraph */}
        <p className="text-base sm:text-lg lg:text-xl text-purple-100/90 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Olympido connects high school and university students with accredited science,
          mathematics, and coding Olympiads. Earn global points, advance your rating, and showcase verified digital scorecards.
        </p>

        {/* Interactive Search Bar */}
        <div className="max-w-2xl mx-auto mb-14">
          <div className="flex flex-col sm:flex-row gap-2.5 p-2 bg-white/15 backdrop-blur-md rounded-2xl border border-white/25 shadow-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Physics, Mathematics, Turing Cup, Stanford..."
                className="w-full pl-11 pr-4 py-3 bg-white text-gray-900 rounded-xl text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-inner"
              />
            </div>
            <button
              onClick={onExploreClick}
              className="px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm sm:text-base transition-all shadow-md active:scale-98 cursor-pointer"
            >
              Explore All
            </button>
          </div>
        </div>

        {/* Metric Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-white/15 max-w-5xl mx-auto">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-3 sm:p-4 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10">
                <div className="flex items-center justify-center gap-1.5 text-yellow-300 mb-1">
                  <Icon className="w-4 h-4 opacity-80" />
                  <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {stat.value}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-purple-200 font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
