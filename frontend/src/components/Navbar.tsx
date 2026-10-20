"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Flame, Compass, Trophy, BookOpen, Award, Menu, X, ShieldCheck, ChevronRight, User } from "lucide-react";

interface NavbarProps {
  currentRole?: "student" | "organizer" | "admin";
  onRoleChange?: (role: "student" | "organizer" | "admin") => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole = "student",
  onRoleChange,
  onOpenAuthModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/", icon: Flame },
    { label: "Explore", href: "#explore-section", icon: Compass },
    { label: "Leaderboard", href: "#leaderboard-preview", icon: Trophy, badge: "Live" },
    { label: "How It Works", href: "#how-it-works", icon: BookOpen },
    { label: "Scorecards", href: "#scorecards-preview", icon: Award },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(135deg, #6C3EF4 0%, #4B21D4 100%)" }}
          >
            <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-gray-900">Olympido</span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                style={{ background: "#EDE9FF", color: "#6C3EF4" }}
              >
                Olympiad Arena
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-medium hidden sm:inline">
              Verified Academic Competitions
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <Icon className="w-4 h-4 text-gray-400" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                    {link.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Right Actions: Role Switcher & Sign In */}
        <div className="flex items-center gap-3">
          
          {/* Quick Role Switcher (Simulates the multi-role ecosystem) */}
          <div className="hidden lg:flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => onRoleChange?.("student")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentRole === "student"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Student View
            </button>
            <button
              onClick={() => onRoleChange?.("organizer")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                currentRole === "organizer"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Organizer (.edu)
            </button>
          </div>

          {/* Sign In / Profile Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all active:scale-98"
            style={{ background: "#6C3EF4" }}
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Sign In / Register</span>
            <span className="sm:hidden">Sign In</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span>{link.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </a>
            );
          })}

          <div className="border-t border-gray-100 pt-3 mt-2">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider px-3 block mb-2">
              Preview Role View
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onRoleChange?.("student");
                  setMobileMenuOpen(false);
                }}
                className={`py-2 text-xs font-semibold rounded-lg text-center ${
                  currentRole === "student"
                    ? "bg-purple-100 text-purple-700 font-bold"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Student View
              </button>
              <button
                onClick={() => {
                  onRoleChange?.("organizer");
                  setMobileMenuOpen(false);
                }}
                className={`py-2 text-xs font-semibold rounded-lg text-center ${
                  currentRole === "organizer"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Organizer View
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
