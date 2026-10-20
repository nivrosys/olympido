"use client";

import React, { useState } from "react";
import { 
  X, 
  Flame, 
  Mail, 
  Lock, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ShieldAlert,
  ArrowRight
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
  const [fullName, setFullName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  // Domain verification algorithm for Organizers
  const restrictedDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "proton.me", "aol.com", "icloud.com"];
  const emailDomain = email.includes("@") ? email.split("@")[1].toLowerCase().trim() : "";
  const isRestrictedDomain = restrictedDomains.includes(emailDomain);
  const isEduDomain = emailDomain.endsWith(".edu") || emailDomain.includes(".ac.") || emailDomain.includes(".k12.");
  const isOrganizerEmailValid = emailDomain.length > 3 && !isRestrictedDomain;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "organizer" && isRestrictedDomain) {
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      onSuccess?.({
        name: fullName || (activeTab === "student" ? "Alex Morgan" : "Dr. Smith"),
        role: activeTab,
        email: email || (activeTab === "student" ? "alex@olympiad.org" : "smith@stanford.edu"),
      });
      onClose();
      setSubmitted(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 animate-in zoom-in-95 duration-200 border border-purple-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div
            className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-md shadow-purple-500/25"
            style={{ background: "linear-gradient(135deg, #6C3EF4 0%, #4B21D4 100%)" }}
          >
            <Flame className="w-6 h-6 text-amber-300 fill-amber-300" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Welcome to Olympido
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Access accredited competitions, scorecards, and global ratings
          </p>
        </div>

        {/* Role Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("student")}
            className={`py-2 rounded-lg transition-all ${
              activeTab === "student"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Student Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("organizer")}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === "organizer"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            School / Organizer
          </button>
        </div>

        {/* Google OAuth (Only for Students) */}
        {activeTab === "student" && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                onSuccess?.({ name: "Alex Morgan", role: "student", email: "alex.morgan@student.org" });
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-700 transition-all shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-3 text-[11px] font-bold text-gray-400 uppercase">OR EMAIL</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>
          </div>
        )}

        {/* Organizer Verification Notice */}
        {activeTab === "organizer" && (
          <div className="mb-4 p-3 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-900 flex items-start gap-2">
            <Building2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Institutional Domain Verification Required:</span>
              <p className="text-purple-700 text-[11px] mt-0.5">
                Organizers must use their verified educational email (e.g. .edu, .ac.uk, school domain). Generic webmails (gmail, yahoo) cannot create organizer accounts.
              </p>
            </div>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {activeTab === "organizer" && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Institution / School Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Stanford University / Cambridge Academy"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {activeTab === "organizer" ? "Official Institutional Email" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder={activeTab === "organizer" ? "coordinator@stanford.edu" : "student@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* Live Domain Validation Feedback for Organizers */}
            {activeTab === "organizer" && emailDomain && (
              <div className="mt-1.5 text-xs">
                {isRestrictedDomain ? (
                  <div className="text-rose-600 flex items-center gap-1 font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Personal domains (@{emailDomain}) are disallowed. Use your school domain.</span>
                  </div>
                ) : isEduDomain ? (
                  <div className="text-emerald-700 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified institutional domain detected (@{emailDomain}).</span>
                  </div>
                ) : (
                  <div className="text-purple-700 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Custom organization domain submitted for Admin KYC approval.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitted || (activeTab === "organizer" && isRestrictedDomain)}
            className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all shadow-md mt-4 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "organizer" && isRestrictedDomain
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 active:scale-98"
            }`}
          >
            {submitted ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{activeTab === "organizer" ? "Apply as Organizer Host" : "Sign In to Arena"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center mt-5 text-[11px] text-gray-400">
          By signing in, you agree to the Olympiad Fair Play Code & Integrity Guidelines.
        </div>
      </div>
    </div>
  );
};
