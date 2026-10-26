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
  User,
  Sparkles,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: "student" | "organizer" | "admin";
  onSuccess?: (user: { name: string; role: string; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = "student",
  onSuccess,
}) => {
  const { login, registerStudent, registerOrganizer } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [activeTab, setActiveTab] = useState<"student" | "organizer" | "admin">(
    defaultRole === "admin" ? "admin" : defaultRole
  );

  // Form states
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [organizationName, setOrganizationName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Domain verification for institutional credibility
  const restrictedDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "proton.me",
    "aol.com",
    "icloud.com",
  ];
  const emailDomain = identifier.includes("@")
    ? identifier.split("@")[1].toLowerCase().trim()
    : "";
  const isRestrictedDomain = restrictedDomains.includes(emailDomain);
  const isEduDomain =
    emailDomain.endsWith(".edu") ||
    emailDomain.includes(".ac.") ||
    emailDomain.includes(".k12.");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === "signup" && activeTab === "organizer" && isRestrictedDomain) {
      setErrorMsg("Educational organizations must use an institutional email (.edu, .ac, .k12).");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signin") {
        await login({
          emailOrUsername: identifier.trim(),
          password,
        });

        onSuccess?.({
          name: identifier,
          role: activeTab,
          email: identifier,
        });
        onClose();
      } else {
        // Sign up
        if (activeTab === "student") {
          await registerStudent({
            email: identifier.trim(),
            username: username.trim() || identifier.split("@")[0],
            fullName: fullName.trim() || "Competitor",
            password,
          });
          setSuccessMsg("Account registered successfully! Logging you in...");
          await login({
            emailOrUsername: identifier.trim(),
            password,
          });
          setTimeout(() => {
            onClose();
          }, 800);
        } else if (activeTab === "organizer") {
          await registerOrganizer({
            email: identifier.trim(),
            username: username.trim() || identifier.split("@")[0],
            fullName: fullName.trim() || "Organization Director",
            organizationName: organizationName.trim() || "Academic Committee",
            password,
          });
          setSuccessMsg("Institution registered! Admin review pending. Logging in...");
          await login({
            emailOrUsername: identifier.trim(),
            password,
          });
          setTimeout(() => {
            onClose();
          }, 800);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (email: string, pass: string, roleName: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await login({
        emailOrUsername: email,
        password: pass,
      });
      onSuccess?.({
        name: email,
        role: roleName,
        email,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || `Quick sign in failed for ${email}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 bg-white border border-slate-200 my-8"
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
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-amber-300 shadow-md shadow-purple-600/30">
              <Flame className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <h3
                className="font-extrabold text-xl text-slate-900"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {mode === "signin" ? "Sign In to Olympido" : "Create Your Account"}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === "signin"
                  ? "Access verified contests and official scorecards"
                  : "Join thousands of academic Olympiad competitors"}
              </p>
            </div>
          </div>

          {/* Mode Selector (Sign In vs Register) */}
          <div className="flex border-b border-slate-200 mb-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMsg(null);
              }}
              className={`flex-1 pb-2.5 text-center transition-all ${
                mode === "signin"
                  ? "border-b-2 border-purple-600 text-purple-700"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMsg(null);
              }}
              className={`flex-1 pb-2.5 text-center transition-all ${
                mode === "signup"
                  ? "border-b-2 border-purple-600 text-purple-700"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              New Registration
            </button>
          </div>

          {/* Role Tab Selector */}
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveTab("student");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "student"
                  ? "bg-white text-purple-700 shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("organizer");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === "organizer"
                  ? "bg-purple-600 text-white shadow-xs shadow-purple-500/25"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Organizer
            </button>
            {mode === "signin" && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("admin");
                  setErrorMsg(null);
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  activeTab === "admin"
                    ? "bg-slate-900 text-amber-300 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Admin
              </button>
            )}
          </div>

          {/* Error & Success Banners */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Organizer Policy Notice */}
          {activeTab === "organizer" && mode === "signup" && (
            <div className="mb-4 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Institutional Domain Required:</strong> Hosts must register with an official accredited institutional email (.edu, .ac, .org).
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Robert Vance"
                      className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. robert_vance"
                    className="w-full px-4 py-2 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>

                {activeTab === "organizer" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Organization / School Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        placeholder="e.g. Cambridge Physics Academy"
                        className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {mode === "signin"
                  ? "Email or Username"
                  : activeTab === "organizer"
                  ? "Institutional Email (.edu)"
                  : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={mode === "signin" ? "text" : "email"}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    activeTab === "organizer"
                      ? "organizer@bdpho.org"
                      : activeTab === "admin"
                      ? "admin@olympido.com"
                      : "arif@student.com"
                  }
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>

              {/* Instant domain check for organizer signup */}
              {mode === "signup" && activeTab === "organizer" && emailDomain && (
                <div className="mt-1">
                  {isRestrictedDomain ? (
                    <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      Free email domains (@{emailDomain}) are not permitted.
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
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
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || (mode === "signup" && activeTab === "organizer" && isRestrictedDomain)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {isLoading ? (
                <span>Communicating with API...</span>
              ) : (
                <>
                  <span>
                    {mode === "signin"
                      ? "Sign In & Enter Arena"
                      : activeTab === "organizer"
                      ? "Register Verified Host"
                      : "Create Competitor Account"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-seeded Accounts Box */}
          <div className="mt-4 pt-3.5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                Demo Credentials:
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin("arif@student.com", "Student@123456", "student")}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 font-semibold text-slate-700 hover:text-purple-700 transition-colors text-center"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("organizer@bdpho.org", "Organizer@123456", "organizer")}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 font-semibold text-slate-700 hover:text-purple-700 transition-colors text-center"
              >
                Organizer
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@olympido.com", "Admin@123456", "admin")}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 font-semibold text-slate-700 hover:text-purple-700 transition-colors text-center"
              >
                Admin
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
