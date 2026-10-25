"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, Laptop, Award, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Discover Accredited Contests",
      description: "Explore verified competitions hosted by schools and national Olympiad committees with .edu and institutional backing.",
      icon: Compass,
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      step: "02",
      title: "Compete in the Live Arena",
      description: "Solve challenging theoretical, mathematical, and coding problem sets in a fair, secure, timed environment.",
      icon: Laptop,
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
    {
      step: "03",
      title: "Earn Dynamic Rating & Points",
      description: "Perform against regional and global peers. Top ranks earn weighted points feeding into weekly and monthly ladders.",
      icon: Award,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      step: "04",
      title: "Collect Verified Scorecards",
      description: "Receive cryptographically signed digital scorecards with QR hashes to share with admissions officers and mentors.",
      icon: ShieldCheck,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 shadow-2xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>The Competitive Pathway</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            How Olympido Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            A trusted academic ecosystem connecting student ambition with institutional authenticity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="relative p-6 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)] hover:shadow-[0_16px_32px_-4px_rgba(108,62,244,0.12)] hover:border-purple-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-200 font-mono">
                      {item.step}
                    </span>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center text-xs font-bold text-purple-700">
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
