"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Flame,
  Mail,
  Lock,
  Building2,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: "student" | "organizer";
  onSuccess?: (user: { name: string; role: string; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = "student",
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"student" | "organizer">(defaultRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  // Domain verification for institutional credibility
  const restrictedDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "proton.me", "aol.com", "icloud.com"];
  const emailDomain = email.includes("@") ? email.split("@")[1].toLowerCase().trim() : "";
  const isRestrictedDomain = restrictedDomains.includes(emailDomain);
  const isEduDomain = emailDomain.endsWith(".edu") || emailDomain.includes(".ac.") || emailDomain.includes(".k12.");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "organizer" && isRestrictedDomain) return;
    setSubmitted(true);
    setTimeout(() => {
      onSuccess?.({
        name: activeTab === "student" ? "Alex Morgan" : "Dr. Smith",
        role: activeTab,
        email: email || (activeTab === "student" ? "alex@olympiad.org" : "smith@stanford.edu"),
      });
      onClose();
      setSubmitted(false);
    }, 1000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 bg-white border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-amber-300 shadow-md shadow-purple-600/30">
              <Flame className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Welcome to Olympido
              </h3>
              <p className="text-xs text-slate-500">Sign in to your competitive account</p>
            </div>
          </div>

          {/* Role Tab Selector with Depth */}
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("student")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "student"
                  ? "bg-white text-purple-700 shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Student Competitor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("organizer")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "organizer"
                  ? "bg-purple-600 text-white shadow-xs shadow-purple-500/25"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Host
            </button>
          </div>

          {/* Organizer Domain Policy Banner */}
          {activeTab === "organizer" && (
            <div className="mb-5 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Institutional Requirement:</strong> Competition hosts must sign in with an accredited educational email (.edu, .ac, .k12).
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {activeTab === "organizer" ? "Institutional Email (.edu)" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === "organizer" ? "chair@dept.stanford.edu" : "alex@gmail.com"}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>

              {/* Instant domain validation feedback */}
              {activeTab === "organizer" && emailDomain && (
                <div className="mt-1.5">
                  {isRestrictedDomain ? (
                    <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      Free email domains (@{emailDomain}) are not permitted for contest organizers.
                    </span>
                  ) : isEduDomain ? (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified institutional domain detected.
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-600 flex items-center gap-1">
                      Domain @{emailDomain} will require administrative accreditation review.
                    </span>
                  )}
                </div>
              )}
            </div>

            {activeTab === "organizer" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Host Organization / University
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Stanford Physics Department"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitted || (activeTab === "organizer" && isRestrictedDomain)}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {submitted ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{activeTab === "organizer" ? "Access Organizer Desk" : "Enter Olympido Arena"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick links */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>By proceeding, you agree to our </span>
            <a href="#" className="text-purple-600 font-semibold hover:underline">Honor Code</a>
            <span> and </span>
            <a href="#" className="text-purple-600 font-semibold hover:underline">Accreditation Standards</a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
