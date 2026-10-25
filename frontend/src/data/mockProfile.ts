export interface ContestRecord {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  date: string;
  rank: number;
  totalParticipants: number;
  score: string;
  percentile: string;
  pointsGained: number;
  ratingDelta: number;
  newRating: number;
  verifyHash: string;
  status: "Gold Medal" | "Silver Medal" | "Bronze Medal" | "Top 1%";
  bannerGradient: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: "Legendary" | "Epic" | "Rare" | "Common";
  category: string;
}

export interface RatingPoint {
  contest: string;
  date: string;
  rating: number;
  delta: number;
}

export interface StudentProfileData {
  name: string;
  username: string;
  avatar: string;
  avatarGradient: string;
  bio: string;
  institution: string;
  institutionDomain: string;
  country: string;
  countryCode: string;
  tier: "Grandmaster" | "Master" | "Candidate Master" | "Expert";
  tierColor: string;
  currentRating: number;
  peakRating: number;
  globalRank: number;
  regionalRank: number;
  stats: {
    pointsThisWeek: number;
    pointsThisMonth: number;
    totalPoints: number;
    contestsCompleted: number;
    winRatio: number;
    perfectScores: number;
  };
  subjects: {
    name: string;
    rating: number;
    level: string;
    percentile: number;
    color: string;
  }[];
  ratingHistory: RatingPoint[];
  contests: ContestRecord[];
  achievements: Achievement[];
}

export const MOCK_STUDENT_PROFILES: Record<string, StudentProfileData> = {
  marcus_v: {
    name: "Marcus Vance",
    username: "marcus_v",
    avatar: "MV",
    avatarGradient: "from-amber-400 via-yellow-500 to-amber-600",
    bio: "Passionate mathematician & competitive algorithmist. 3x International Olympiad qualifier, aiming for Putnam fellowship and topological data analysis research.",
    institution: "MIT Math Club",
    institutionDomain: "mit.edu",
    country: "United States",
    countryCode: "US",
    tier: "Grandmaster",
    tierColor: "text-amber-500",
    currentRating: 2480,
    peakRating: 2510,
    globalRank: 1,
    regionalRank: 1,
    stats: {
      pointsThisWeek: 1450,
      pointsThisMonth: 5820,
      totalPoints: 28450,
      contestsCompleted: 42,
      winRatio: 88.5,
      perfectScores: 7,
    },
    subjects: [
      { name: "Mathematics & Number Theory", rating: 2480, level: "Grandmaster", percentile: 99.9, color: "bg-purple-600" },
      { name: "Theoretical Physics", rating: 2360, level: "Master", percentile: 99.4, color: "bg-blue-600" },
      { name: "Informatics & Algorithms", rating: 2280, level: "Master", percentile: 98.8, color: "bg-emerald-600" },
      { name: "Astrophysics", rating: 2120, level: "Candidate Master", percentile: 96.5, color: "bg-amber-500" },
    ],
    ratingHistory: [
      { contest: "Regional Physics Prep", date: "Jan 2026", rating: 1850, delta: 65 },
      { contest: "National Youth Physics", date: "Feb 2026", rating: 2020, delta: 170 },
      { contest: "Kepler Astrophysics", date: "Mar 2026", rating: 2150, delta: 130 },
      { contest: "Turing Cup Invitational", date: "Apr 2026", rating: 2290, delta: 140 },
      { contest: "Mendeleev Chemistry Cup", date: "May 2026", rating: 2366, delta: 76 },
      { contest: "Euler Math Invitational", date: "Oct 2026", rating: 2480, delta: 114 },
    ],
    contests: [
      {
        id: "math-euler-2026",
        title: "International Euler Math Invitational 2026",
        category: "mathematics",
        categoryLabel: "Mathematics",
        date: "Oct 20, 2026",
        rank: 1,
        totalParticipants: 1420,
        score: "98/100",
        percentile: "99.9%",
        pointsGained: 1500,
        ratingDelta: 114,
        newRating: 2480,
        verifyHash: "0x8f2a3c9e1b4f7a229b12c8d4e7f10a35",
        status: "Gold Medal",
        bannerGradient: "from-purple-600 via-indigo-700 to-purple-900",
      },
      {
        id: "phys-nyo-2026",
        title: "National Youth Physics Olympiad 2026",
        category: "physics",
        categoryLabel: "Physics",
        date: "Sep 15, 2026",
        rank: 2,
        totalParticipants: 2450,
        score: "94/100",
        percentile: "99.4%",
        pointsGained: 1200,
        ratingDelta: 88,
        newRating: 2366,
        verifyHash: "0x3e1f7c449a88bc01d5e23a4f667109b2",
        status: "Silver Medal",
        bannerGradient: "from-blue-600 via-indigo-700 to-purple-900",
      },
      {
        id: "turing-cup-2026",
        title: "Turing Cup: Algorithmic Olympiad 2026",
        category: "coding",
        categoryLabel: "Coding",
        date: "Aug 10, 2026",
        rank: 3,
        totalParticipants: 3100,
        score: "91/100",
        percentile: "98.7%",
        pointsGained: 950,
        ratingDelta: 65,
        newRating: 2278,
        verifyHash: "0x5a9d2e81fc47890a1b2c3d4e5f6a7b8c",
        status: "Bronze Medal",
        bannerGradient: "from-emerald-600 via-teal-700 to-blue-900",
      },
      {
        id: "kepler-astro-2026",
        title: "Kepler Astrophysics & Space Olympiad",
        category: "astronomy",
        categoryLabel: "Astronomy",
        date: "Jun 22, 2026",
        rank: 5,
        totalParticipants: 1840,
        score: "87/100",
        percentile: "96.8%",
        pointsGained: 780,
        ratingDelta: 42,
        newRating: 2213,
        verifyHash: "0x1d7c8f553a99bb00e1f2a3b4c5d6e7f8",
        status: "Top 1%",
        bannerGradient: "from-amber-500 via-orange-600 to-red-800",
      },
    ],
    achievements: [
      {
        id: "ach-1",
        title: "Peak Champion",
        description: "Secured Rank #1 worldwide in an accredited International Olympiad.",
        icon: "Crown",
        unlockedAt: "Oct 2026",
        rarity: "Legendary",
        category: "Placement",
      },
      {
        id: "ach-2",
        title: "Euler Disciple",
        description: "Scored 95%+ in three consecutive Advanced Mathematics problem sets.",
        icon: "Calculator",
        unlockedAt: "Sep 2026",
        rarity: "Epic",
        category: "Subject Mastery",
      },
      {
        id: "ach-3",
        title: "Quantum Pioneer",
        description: "Completed Theoretical Modern Physics exam with zero infractions.",
        icon: "Atom",
        unlockedAt: "Jul 2026",
        rarity: "Rare",
        category: "Academic Integrity",
      },
      {
        id: "ach-4",
        title: "Century Club",
        description: "Amassed over 25,000 global academic rating points on Olympido.",
        icon: "Award",
        unlockedAt: "Oct 2026",
        rarity: "Legendary",
        category: "Milestone",
      },
      {
        id: "ach-5",
        title: "Clean Sweep",
        description: "Earned 100% accuracy on all theoretical derivation questions in a live arena.",
        icon: "Sparkles",
        unlockedAt: "Aug 2026",
        rarity: "Epic",
        category: "Accuracy",
      },
      {
        id: "ach-6",
        title: "Global Centurion",
        description: "Maintained Grandmaster tier status across 5 consecutive calendar months.",
        icon: "Trophy",
        unlockedAt: "Oct 2026",
        rarity: "Legendary",
        category: "Consistency",
      },
    ],
  },
};
