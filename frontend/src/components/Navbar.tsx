"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Compass,
  Trophy,
  Award,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  User as UserIcon,
  Building2,
  Bell,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  currentRole?: "student" | "organizer" | "admin";
  onRoleChange?: (role: "student" | "organizer" | "admin") => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onOpenAuthModal,
}) => {
  const { user, role, isAuthenticated, logout, unreadNotificationsCount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/", icon: Flame },
    { label: "Explore", href: "/#explore-section", icon: Compass },
    { label: "Schools", href: "/institutions", icon: Building2 },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy, badge: "Live" },
    { label: "Scorecards", href: "/verify", icon: Award },
  ];

  const effectiveRole = role ? (role.toLowerCase() as "student" | "organizer" | "admin") : currentRole || "student";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-nav-scrolled" : "glass-nav"
      }`}
    >
      {/* Decorative top accent line with depth gradient */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with Depth & Glow */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <motion.div
            whileHover={{ scale: 1.06, rotate: 3 }}
            whileTap={{ scale: 0.96 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden shadow-md shadow-purple-600/30 group-hover:shadow-lg group-hover:shadow-purple-600/40 transition-all"
            style={{
              background: "linear-gradient(135deg, #6C3EF4 0%, #5227DC 50%, #3B15A3 100%)",
            }}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Flame className="w-5 h-5 text-amber-300 fill-amber-300 drop-shadow-sm" />
          </motion.div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-purple-700 transition-colors"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Olympido
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200/80 shadow-2xs">
                Arena
              </span>
            </div>
            <span className="text-[10.5px] text-slate-500 font-medium hidden xl:inline -mt-0.5">
              Verified Academic Competitions
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                onMouseEnter={() => setHoveredLink(link.label)}
                onMouseLeave={() => setHoveredLink(null)}
                className={`relative px-3.5 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "text-purple-700 bg-purple-50/80 font-bold"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                {hoveredLink === link.label && !isActive && (
                  <motion.div
                    layoutId="navbar-hover"
                    className="absolute inset-0 bg-slate-100/80 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 ${isActive ? "text-purple-600" : "text-slate-500"}`} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Role Switches & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role Hub Switcher for quick portal navigation */}
          <div className="hidden lg:flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200/70 shadow-2xs">
            <Link
              href="/"
              onClick={() => onRoleChange?.("student")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                effectiveRole === "student" && !pathname.includes("/organizer") && !pathname.includes("/admin")
                  ? "bg-white text-purple-700 shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Student
            </Link>
            <Link
              href="/organizer"
              onClick={() => onRoleChange?.("organizer")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                pathname.includes("/organizer") || effectiveRole === "organizer"
                  ? "bg-purple-600 text-white shadow-xs shadow-purple-500/30"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Organizer</span>
            </Link>
            <Link
              href="/admin"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                pathname.includes("/admin") || effectiveRole === "admin"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>Admin</span>
            </Link>
          </div>

          {/* User Profile or Sign In Button */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 shadow-xs flex items-center gap-2 cursor-pointer transition-all"
              >
                <div className="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center uppercase shadow-xs">
                  {user.fullName?.charAt(0) || user.username?.charAt(0) || "U"}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-extrabold text-slate-900 leading-tight max-w-[120px] truncate">
                    {user.fullName || user.username}
                  </span>
                  <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                {unreadNotificationsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-xs"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-slate-500 text-[11px] truncate">@{user.username}</p>
                      {user.studentStats && (
                        <p className="text-purple-600 font-bold text-[11px] mt-0.5">
                          Rating: {user.studentStats.currentRating} • Points: {Number(user.studentStats.totalPoints)}
                        </p>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-purple-700 hover:bg-purple-50 font-semibold transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-purple-600" />
                      <span>My Profile & Stats</span>
                    </Link>

                    {(user.role === "ORGANIZER" || user.role === "ADMIN" || user.role === "TEACHER") && (
                      <Link
                        href="/organizer"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-purple-700 hover:bg-purple-50 font-semibold transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-purple-600" />
                        <span>Organizer Console</span>
                      </Link>
                    )}

                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-purple-700 hover:bg-purple-50 font-semibold transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-slate-800" />
                        <span>Admin Desk</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors mt-1 border-t border-slate-100 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenAuthModal}
              className="h-9 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer group"
            >
              <span className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-purple-600/30 transition-colors">
                <UserIcon className="w-3 h-3 text-slate-200 group-hover:text-purple-300 transition-colors" />
              </span>
              <span className="whitespace-nowrap font-bold tracking-tight">Sign In</span>
            </motion.button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden overflow-hidden bg-white/98 backdrop-blur-2xl border-t border-slate-200 shadow-xl"
          >
            <div className="px-4 pt-3 pb-6 space-y-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:text-purple-700 hover:bg-purple-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-purple-600" />
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                );
              })}

              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:text-purple-700 hover:bg-purple-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-purple-600" />
                  <span>Student Profile</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <div className="pt-3 mt-3 border-t border-slate-200">
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 px-3 block mb-2">
                  Portal Switcher
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href="/"
                    onClick={() => {
                      onRoleChange?.("student");
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 text-xs font-bold rounded-xl text-center transition-all bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    Student
                  </Link>
                  <Link
                    href="/organizer"
                    onClick={() => {
                      onRoleChange?.("organizer");
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 text-xs font-bold rounded-xl text-center transition-all bg-purple-600 text-white shadow-sm"
                  >
                    Organizer
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-xs font-bold rounded-xl text-center transition-all bg-slate-900 text-white"
                  >
                    Admin
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
