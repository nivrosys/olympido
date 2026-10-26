"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { CategoryFilter } from "../components/CategoryFilter";
import { CompetitionCard } from "../components/CompetitionCard";
import { CompetitionModal } from "../components/CompetitionModal";
import { AuthModal } from "../components/AuthModal";
import { LeaderboardSection } from "../components/LeaderboardSection";
import { HowItWorks } from "../components/HowItWorks";
import { Footer } from "../components/Footer";
import { MOCK_COMPETITIONS, Competition } from "../data/mockCompetitions";
import { contestsApi } from "../lib/api";
import { adaptContestToCompetition } from "../lib/adapters";
import { 
  Sparkles, 
  Flame, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  PlusCircle, 
  CheckCircle2, 
  Filter, 
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "registration_open" | "upcoming">("all");
  const [currentRole, setCurrentRole] = useState<"student" | "organizer" | "admin">("student");
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [apiCompetitions, setApiCompetitions] = useState<Competition[]>([]);
  const [isLoadingContests, setIsLoadingContests] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadContests() {
      try {
        const res = await contestsApi.findAll();
        if (res && res.contests && res.contests.length > 0 && isMounted) {
          const adapted = res.contests.map(adaptContestToCompetition);
          setApiCompetitions(adapted);
        }
      } catch (err) {
        console.warn("Backend not active or empty, using catalog fallback:", err);
      } finally {
        if (isMounted) setIsLoadingContests(false);
      }
    }
    void loadContests();
    return () => {
      isMounted = false;
    };
  }, []);

  const baseCompetitions = useMemo(() => {
    return apiCompetitions.length > 0 ? apiCompetitions : MOCK_COMPETITIONS;
  }, [apiCompetitions]);

  // Filter competitions based on search, category, and status
  const filteredCompetitions = useMemo(() => {
    return baseCompetitions.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.organizer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [baseCompetitions, searchQuery, selectedCategory, statusFilter]);

  const featuredCompetitions = useMemo(() => {
    return baseCompetitions.filter((item) => item.isFeatured);
  }, [baseCompetitions]);

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-900 relative overflow-x-clip">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-right duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Global Navbar with Depth */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Organizer Mode Banner */}
      {currentRole === "organizer" && (
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white px-4 py-3 text-xs sm:text-sm shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                <strong>Organizer Mode Active:</strong> Hosting contests requires verified institutional domain (.edu) and mandatory <strong>Admin Approval</strong> before publication.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/organizer"
                className="px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 border border-white/20"
              >
                <span>Host Management Console</span>
              </Link>
              <Link
                href="/create-contest"
                className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create Contest Wizard</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExploreClick={() => {
          const el = document.getElementById("explore-section");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
        activeCategory={selectedCategory}
      />

      {/* Main Content Area with Dynamic Background Elements */}
      <main className="flex-1 w-full relative">
        
        {/* Animated Background Orbs / Glow Elements */}
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-purple-200/40 blur-3xl pointer-events-none animate-blob -z-10" />
        <div className="absolute top-96 right-10 w-96 h-96 rounded-full bg-indigo-200/35 blur-3xl pointer-events-none animate-blob animation-delay-2000 -z-10" />
        <div className="absolute bottom-40 left-1/4 w-80 h-80 rounded-full bg-amber-100/50 blur-3xl pointer-events-none animate-blob animation-delay-4000 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          {/* Category Filter Pills Strip */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2
                  className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Browse by Subject & Discipline
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Filter certified Olympiads by scientific branch and field
                </p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 shadow-2xs">
                {filteredCompetitions.length} Contests Active
              </span>
            </div>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Featured Section */}
          {!searchQuery && selectedCategory === "all" && statusFilter === "all" && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-xs border border-amber-200">
                    <Sparkles className="w-4 h-4 fill-amber-500" />
                  </div>
                  <div>
                    <h3
                      className="text-xl sm:text-2xl font-extrabold text-slate-900"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Featured Olympiads
                    </h3>
                    <p className="text-xs text-slate-500">
                      Curated high-stakes contests with premier points and global standing
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredCompetitions.map((item) => (
                  <CompetitionCard
                    key={item.id}
                    competition={item}
                    featured={true}
                    onSelect={(comp) => setSelectedCompetition(comp)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Explore All Competitions Catalog */}
          <section id="explore-section" className="mb-16">
            {/* Header & Status Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
              <div>
                <h3
                  className="text-xl sm:text-2xl font-extrabold text-slate-900"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {selectedCategory === "all"
                    ? "All Accredited Competitions"
                    : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Olympiads`}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Admin-approved challenges with verifiable scorecards and dynamic rating gains.
                </p>
              </div>

              {/* Status Pills with Depth */}
              <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-xs self-start sm:self-auto">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === "all" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter("live")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === "live" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-200 animate-ping" />
                  Live Now
                </button>
                <button
                  onClick={() => setStatusFilter("registration_open")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === "registration_open" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Open
                </button>
                <button
                  onClick={() => setStatusFilter("upcoming")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === "upcoming" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Upcoming
                </button>
              </div>
            </div>

            {/* Grid of Contests */}
            {filteredCompetitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompetitions.map((item) => (
                  <CompetitionCard
                    key={item.id}
                    competition={item}
                    onSelect={(comp) => setSelectedCompetition(comp)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-base mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  No matching competitions found
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  We couldn&apos;t find any Olympiads matching &quot;{searchQuery}&quot;. Try adjusting your filters or category selection.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setStatusFilter("all");
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors cursor-pointer shadow-sm shadow-purple-600/25"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Global Leaderboard & Verifiable Scorecard Generator Preview */}
        <LeaderboardSection />

        {/* How Olympido Works Roadmap */}
        <HowItWorks />

      </main>

      {/* Global Footer */}
      <Footer />

      {/* Contest Detail & Registration Modal */}
      <CompetitionModal
        competition={selectedCompetition}
        onClose={() => setSelectedCompetition(null)}
        onRequireAuth={() => setIsAuthModalOpen(true)}
        onRegisterSuccess={(title) => {
          triggerNotification(`Successfully registered for: ${title}! Check your scorecards.`);
        }}
      />

      {/* Authentication & Institutional Domain Validation Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultRole={currentRole === "organizer" ? "organizer" : "student"}
        onSuccess={(user) => {
          triggerNotification(`Welcome back, ${user.name}! Mode: ${user.role}.`);
        }}
      />

    </div>
  );
}
