"use client";

import React from "react";
import { Compass, Laptop, Award, ShieldCheck, ArrowRight } from "lucide-react";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Discover Accredited Contests",
      description: "Explore verified competitions hosted by schools and national Olympiad committees with .edu and institutional backing.",
      icon: Compass,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      step: "02",
      title: "Compete in the Live Arena",
      description: "Solve challenging theoretical, mathematical, and coding problem sets in a fair, secure, timed environment.",
      icon: Laptop,
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      step: "03",
      title: "Earn Dynamic Rating & Points",
      description: "Perform against regional and global peers. Top ranks earn weighted points feeding into weekly and monthly ladders.",
      icon: Award,
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      step: "04",
      title: "Collect Verified Scorecards",
      description: "Receive cryptographically signed digital scorecards with QR hashes to share with admissions officers and mentors.",
      icon: ShieldCheck,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
            The Competitive Pathway
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-3">
            How Olympido Works
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            A trusted ecosystem connecting student ambition with institutional authenticity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-gray-300 font-mono">
                      {item.step}
                    </span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-gray-100 flex items-center text-xs font-bold text-purple-600">
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
