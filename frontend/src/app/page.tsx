"use client";

import React, { useState, useMemo } from "react";
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
import { 
  Sparkles, 
  Flame, 
  Search, 
  ShieldCheck, 
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Filter
} from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "registration_open" | "upcoming">("all");
  const [currentRole, setCurrentRole] = useState<"student" | "organizer" | "admin">("student");
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Filter competitions based on search, category, and status
  const filteredCompetitions = useMemo(() => {
    return MOCK_COMPETITIONS.filter((item) => {
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
  }, [searchQuery, selectedCategory, statusFilter]);

  const featuredCompetitions = useMemo(() => {
    return MOCK_COMPETITIONS.filter((item) => item.isFeatured);
  }, []);

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-900">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-xs font-semibold rounded-2xl shadow-2xl border border-gray-700 animate-in slide-in-from-right duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Organizer Mode Banner (Conditional preview of institutional workflow) */}
      {currentRole === "organizer" && (
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white px-4 py-3 text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                <strong>Organizer Mode Active:</strong> Hosting contests requires verified institutional domain (.edu) and mandatory <strong>Admin Approval</strong> before publication.
              </span>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-amber-400 text-gray-950 font-bold text-xs hover:bg-amber-300 transition-colors shrink-0"
            >
              + Create New Contest (Submit to Admin)
            </button>
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Category Pills Strip */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Browse by Subject & Discipline
            </h2>
            <span className="text-xs text-purple-700 font-semibold">
              Showing {filteredCompetitions.length} Contests
            </span>
          </div>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Featured Section (when no active deep search) */}
        {!searchQuery && selectedCategory === "all" && statusFilter === "all" && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                  <Sparkles className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Featured Olympiads</h3>
                  <p className="text-xs text-gray-500">Curated high-stakes contests with premier points and global standing</p>
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
        <section id="explore-section" className="mb-14">
          
          {/* Header & Status Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {selectedCategory === "all"
                  ? "All Accredited Competitions"
                  : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Olympiads`}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Admin-approved challenges with verifiable scorecards and Elo-like rating gains.
              </p>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-200 rounded-xl text-xs font-semibold shadow-2xs self-start sm:self-auto">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "all" ? "bg-purple-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("live")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  statusFilter === "live" ? "bg-rose-500 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-300" />
                Live Now
              </button>
              <button
                onClick={() => setStatusFilter("registration_open")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "registration_open" ? "bg-emerald-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setStatusFilter("upcoming")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "upcoming" ? "bg-blue-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
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
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-base mb-1">
                No matching competitions found
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                We couldn&apos;t find any Olympiads matching &quot;{searchQuery}&quot;. Try adjusting your filters or category selection.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setStatusFilter("all");
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </section>

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
