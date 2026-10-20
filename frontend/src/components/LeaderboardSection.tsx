"use client";

import React, { useState } from "react";
import { 
  Trophy, 
  Medal, 
  TrendingUp, 
  Award, 
  QrCode, 
  Share2, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Flame,
  X
} from "lucide-react";

interface LeaderboardUser {
  rank: number;
  name: string;
  username: string;
  institution: string;
  points: number;
  rating: number;
  ratingTier: string;
  trend: number; // positive = positions gained
  avatarGradient: string;
  recentContest: {
    title: string;
    score: string;
    percentile: string;
    pointsGained: number;
    ratingDelta: number;
    verifyHash: string;
  };
}

export const LeaderboardSection: React.FC = () => {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "all_time">("weekly");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedScorecardUser, setSelectedScorecardUser] = useState<LeaderboardUser | null>(null);

  const mockLeaders: LeaderboardUser[] = [
    {
      rank: 1,
      name: "Marcus Vance",
      username: "marcus_v",
      institution: "MIT Math Club",
      points: 4850,
      rating: 2480,
      ratingTier: "Grandmaster",
      trend: 2,
      avatarGradient: "from-amber-400 to-yellow-600",
      recentContest: {
        title: "International Euler Math Invitational 2026",
        score: "98/100",
        percentile: "99.9%",
        pointsGained: 1500,
        ratingDelta: 114,
        verifyHash: "0x8f2a...9b12",
      },
    },
    {
      rank: 2,
      name: "Elena Rostova",
      username: "elena_phys",
      institution: "Stanford Physics Circle",
      points: 4420,
      rating: 2360,
      ratingTier: "Master",
      trend: 1,
      avatarGradient: "from-slate-300 to-slate-500",
      recentContest: {
        title: "National Youth Physics Olympiad 2026",
        score: "94/100",
        percentile: "99.4%",
        pointsGained: 1200,
        ratingDelta: 88,
        verifyHash: "0x3e1f...7c44",
      },
    },
    {
      rank: 3,
      name: "Kevin Chen",
      username: "kchen_algo",
      institution: "Berkeley Computing Society",
      points: 3950,
      rating: 2280,
      ratingTier: "Master",
      trend: -1,
      avatarGradient: "from-amber-600 to-amber-800",
      recentContest: {
        title: "Turing Cup: Algorithmic Olympiad 2026",
        score: "91/100",
        percentile: "98.7%",
        pointsGained: 950,
        ratingDelta: 65,
        verifyHash: "0x5a9d...2e81",
      },
    },
    {
      rank: 4,
      name: "Sophia Martinez",
      username: "smartinez",
      institution: "Oxford Chemistry Academy",
      points: 3680,
      rating: 2190,
      ratingTier: "Candidate Master",
      trend: 4,
      avatarGradient: "from-purple-500 to-indigo-600",
      recentContest: {
        title: "Mendeleev Chemistry Cup 2026",
        score: "89/100",
        percentile: "97.5%",
        pointsGained: 820,
        ratingDelta: 54,
        verifyHash: "0x9c4b...1a03",
      },
    },
    {
      rank: 5,
      name: "Aarav Patel",
      username: "aarav_astro",
      institution: "Cambridge Space Circle",
      points: 3410,
      rating: 2120,
      ratingTier: "Candidate Master",
      trend: 0,
      avatarGradient: "from-cyan-500 to-blue-600",
      recentContest: {
        title: "Kepler Astrophysics Olympiad",
        score: "87/100",
        percentile: "96.8%",
        pointsGained: 780,
        ratingDelta: 42,
        verifyHash: "0x1d7c...8f55",
      },
    },
  ];

  return (
    <section id="leaderboard-preview" className="py-16 bg-slate-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              <span>Real-Time Olympiad Standings</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Global Olympiad Leaderboards
            </h2>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">
              Track top performers, weekly rating surges, and verified digital scorecards calculated from accredited contests.
            </p>
          </div>

          {/* Timeframe Filter Buttons */}
          <div className="flex items-center p-1 bg-white border border-gray-200 rounded-2xl shadow-2xs">
            <button
              onClick={() => setTimeframe("weekly")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                timeframe === "weekly"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              This Weekend
            </button>
            <button
              onClick={() => setTimeframe("monthly")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                timeframe === "monthly"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeframe("all_time")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                timeframe === "all_time"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All-Time Hall of Fame
            </button>
          </div>
        </div>

        {/* Podium Top 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-end">
          
          {/* Rank 2 (Silver) */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs order-2 md:order-1 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-400" />
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white font-extrabold text-lg shadow-md bg-gradient-to-tr from-slate-400 to-slate-600">
              #2
            </div>
            <h3 className="font-bold text-gray-900">{mockLeaders[1].name}</h3>
            <p className="text-xs text-gray-500 mb-3">{mockLeaders[1].institution}</p>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 mb-3">
              {mockLeaders[1].points.toLocaleString()} Points • Rating {mockLeaders[1].rating}
            </div>
            <div>
              <button
                onClick={() => setSelectedScorecardUser(mockLeaders[1])}
                className="w-full py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" /> View Scorecard
              </button>
            </div>
          </div>

          {/* Rank 1 (Gold - Elevated) */}
          <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 shadow-xl order-1 md:order-2 text-center relative overflow-hidden transform md:-translate-y-3">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 mb-2">
              <Trophy className="w-3 h-3 text-amber-600 fill-amber-600" /> Peak Champion
            </span>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white font-extrabold text-xl shadow-lg bg-gradient-to-tr from-amber-400 to-yellow-600 ring-4 ring-amber-100">
              👑
            </div>
            <h3 className="font-extrabold text-xl text-gray-900">{mockLeaders[0].name}</h3>
            <p className="text-xs text-gray-500 mb-4">{mockLeaders[0].institution}</p>
            <div className="inline-block px-4 py-1.5 rounded-full text-sm font-extrabold bg-amber-400/20 text-amber-900 border border-amber-300 mb-4">
              {mockLeaders[0].points.toLocaleString()} Points • Rating {mockLeaders[0].rating}
            </div>
            <div>
              <button
                onClick={() => setSelectedScorecardUser(mockLeaders[0])}
                className="w-full py-2.5 rounded-xl text-xs font-extrabold bg-purple-600 text-white hover:bg-purple-700 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-300" /> View Verified Scorecard
              </button>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs order-3 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-700" />
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white font-extrabold text-lg shadow-md bg-gradient-to-tr from-amber-700 to-amber-900">
              #3
            </div>
            <h3 className="font-bold text-gray-900">{mockLeaders[2].name}</h3>
            <p className="text-xs text-gray-500 mb-3">{mockLeaders[2].institution}</p>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 mb-3">
              {mockLeaders[2].points.toLocaleString()} Points • Rating {mockLeaders[2].rating}
            </div>
            <div>
              <button
                onClick={() => setSelectedScorecardUser(mockLeaders[2])}
                className="w-full py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" /> View Scorecard
              </button>
            </div>
          </div>
        </div>

        {/* Table for Rank 4 & 5 with interactive scorecard buttons */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="flex items-center gap-6">
              <span className="w-8 text-center">Rank</span>
              <span>Student & Institution</span>
            </div>
            <div className="flex items-center gap-8">
              <span>Rating & Tier</span>
              <span className="w-24 text-right">Points</span>
              <span className="w-28 text-right">Scorecard</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {mockLeaders.slice(3).map((student) => (
              <div
                key={student.rank}
                className="p-4 flex items-center justify-between hover:bg-purple-50/30 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <span className="w-8 text-center font-extrabold text-sm text-gray-700">
                    #{student.rank}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{student.name}</h4>
                    <span className="text-xs text-gray-500">{student.institution}</span>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-xs">
                  <div className="text-right hidden sm:block">
                    <span className="font-bold text-purple-700">{student.rating}</span>
                    <span className="text-gray-400 block text-[11px]">{student.ratingTier}</span>
                  </div>
                  <div className="w-24 text-right font-extrabold text-gray-900 text-sm">
                    {student.points.toLocaleString()} pts
                  </div>
                  <div className="w-28 text-right">
                    <button
                      onClick={() => setSelectedScorecardUser(student)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 hover:bg-purple-600 hover:text-white transition-colors"
                    >
                      Scorecard
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Verifiable Digital Scorecard Modal */}
      {selectedScorecardUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 animate-in zoom-in-95 duration-200 border-2 border-purple-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedScorecardUser(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Scorecard Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-amber-300">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900">OLYMPIDO SCORECARD</h4>
                  <span className="text-[10px] text-gray-400 font-mono">ID: {selectedScorecardUser.recentContest.verifyHash}</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3" /> Cryptographically Verified
              </span>
            </div>

            {/* Student & Contest Identity */}
            <div className="mb-6">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
                Participant
              </span>
              <h3 className="text-xl font-extrabold text-gray-900">{selectedScorecardUser.name}</h3>
              <p className="text-xs text-purple-700 font-medium">{selectedScorecardUser.institution}</p>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 mb-6">
              <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider block mb-1">
                Contest Accomplishment
              </span>
              <div className="font-bold text-sm text-gray-900 mb-1">
                {selectedScorecardUser.recentContest.title}
              </div>
              <div className="text-xs text-gray-500">
                Placement: Top {selectedScorecardUser.recentContest.percentile} Percentile
              </div>
            </div>

            {/* Performance Metric Badges */}
            <div className="grid grid-cols-3 gap-3 mb-6 text-center">
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="text-[11px] font-bold text-purple-700 uppercase block mb-1">Raw Score</span>
                <span className="text-lg font-extrabold text-gray-900">{selectedScorecardUser.recentContest.score}</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                <span className="text-[11px] font-bold text-amber-800 uppercase block mb-1">Points Gained</span>
                <span className="text-lg font-extrabold text-amber-900">+{selectedScorecardUser.recentContest.pointsGained}</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-700 uppercase block mb-1">Rating Delta</span>
                <span className="text-lg font-extrabold text-emerald-800">+{selectedScorecardUser.recentContest.ratingDelta}</span>
              </div>
            </div>

            {/* QR Code and Verification footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                  <QrCode className="w-8 h-8 text-gray-700" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Scan to Verify</span>
                  <span className="text-[10px] text-gray-400 font-mono">olympido.com/v/{selectedScorecardUser.recentContest.verifyHash.slice(0, 8)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  alert("Scorecard image downloaded! Ready to share on social channels.");
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Share Card
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
