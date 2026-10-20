"use client";

import React from "react";
import Link from "next/link";
import { Flame, ShieldCheck, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-gray-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-amber-300">
                <Flame className="w-4 h-4 fill-amber-300" />
              </div>
              <span className="font-extrabold text-lg text-white">Olympido</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-xs">
              Next-generation academic competition platform with verified institutional host validation, rating ladders, and digital scorecards.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin-Audited Contests</span>
            </div>
          </div>

          {/* Quick links: For Students */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">For Students</h4>
            <ul className="space-y-2">
              <li><a href="#explore-section" className="hover:text-white transition-colors">Browse Competitions</a></li>
              <li><a href="#leaderboard-preview" className="hover:text-white transition-colors">Global Leaderboard</a></li>
              <li><a href="#scorecards-preview" className="hover:text-white transition-colors">Digital Scorecards</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Practice Quizzes</a></li>
            </ul>
          </div>

          {/* For Organizers & Schools */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">For Schools & Organizers</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Host an Olympiad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">.EDU Domain Verification</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Admin Approval Workflow</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Plagiarism & Anti-Cheat</a></li>
            </ul>
          </div>

          {/* Institutional Integrity Notice */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Integrity & Standards</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
              All organizer accounts require valid institutional domain verification (.edu / accredited school domains) and mandatory administrative audit before any contest is published to the public catalog.
            </p>
            <span className="inline-block px-2.5 py-1 rounded-md bg-slate-800 text-purple-300 font-mono text-[10px]">
              Platform v1.0 • App Router
            </span>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500">
          <div>
            © 2026 Olympido Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <span>Built for academic excellence worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
