export interface Competition {
  id: string;
  title: string;
  slug: string;
  category: "mathematics" | "physics" | "coding" | "chemistry" | "astronomy" | "biology";
  categoryLabel: string;
  bannerGradient: string;
  organizer: {
    name: string;
    domain: string;
    isVerified: boolean;
    type: "University" | "Olympiad Committee" | "National Association" | "High School";
  };
  status: "registration_open" | "live" | "upcoming" | "completed";
  statusLabel: string;
  difficulty: "School Level" | "Regional Olympiad" | "National Olympiad" | "International";
  pointsAwarded: number;
  durationMinutes: number;
  participantsCount: number;
  isFeatured?: boolean;
  registrationDeadline: string;
  contestDate: string;
  description: string;
  prizes: string;
}

export const MOCK_CATEGORIES = [
  { id: "all", label: "All Categories", icon: "Compass" },
  { id: "physics", label: "Physics", icon: "Atom" },
  { id: "mathematics", label: "Mathematics", icon: "Calculator" },
  { id: "coding", label: "Informatics & Coding", icon: "Code2" },
  { id: "chemistry", label: "Chemistry", icon: "FlaskConical" },
  { id: "astronomy", label: "Astronomy & Astrophysics", icon: "Sparkles" },
  { id: "biology", label: "Biology & Life Sciences", icon: "Dna" },
];

export const MOCK_COMPETITIONS: Competition[] = [
  {
    id: "phys-2026-nat",
    title: "National Youth Physics Olympiad 2026",
    slug: "national-youth-physics-olympiad-2026",
    category: "physics",
    categoryLabel: "Physics",
    bannerGradient: "from-blue-600 via-indigo-700 to-purple-900",
    organizer: {
      name: "Stanford Physics Association",
      domain: "stanford.edu",
      isVerified: true,
      type: "University",
    },
    status: "registration_open",
    statusLabel: "Registration Open",
    difficulty: "National Olympiad",
    pointsAwarded: 1500,
    durationMinutes: 180,
    participantsCount: 2450,
    isFeatured: true,
    registrationDeadline: "Nov 12, 2026",
    contestDate: "Nov 18, 2026 • 14:00 UTC",
    description: "The premier nationwide theoretical and experimental problem-solving Olympiad for senior high school and undergraduate students.",
    prizes: "$10,000 Scholar Pool + Gold Medals & Verified Scorecards",
  },
  {
    id: "math-2026-inv",
    title: "International Euler Mathematics Invitational",
    slug: "international-euler-mathematics-invitational",
    category: "mathematics",
    categoryLabel: "Mathematics",
    bannerGradient: "from-purple-600 via-indigo-600 to-blue-800",
    organizer: {
      name: "Cambridge Math Olympiad Committee",
      domain: "cam.ac.uk",
      isVerified: true,
      type: "Olympiad Committee",
    },
    status: "live",
    statusLabel: "Live Contest Now",
    difficulty: "International",
    pointsAwarded: 2000,
    durationMinutes: 240,
    participantsCount: 3820,
    isFeatured: true,
    registrationDeadline: "Closed (In Progress)",
    contestDate: "Happening Live • Round 2",
    description: "Rigorous proofs, number theory, Euclidean geometry, and advanced combinatorics challenging the world's brightest young mathematicians.",
    prizes: "Euler Gold Trophies + Verified Digital Scorecard Credentials",
  },
  {
    id: "code-2026-algo",
    title: "Turing Cup: Algorithmic Olympiad 2026",
    slug: "turing-cup-algorithmic-olympiad",
    category: "coding",
    categoryLabel: "Informatics & Coding",
    bannerGradient: "from-emerald-600 via-teal-700 to-slate-900",
    organizer: {
      name: "MIT Computing & Algorithmic Society",
      domain: "mit.edu",
      isVerified: true,
      type: "University",
    },
    status: "registration_open",
    statusLabel: "Registration Open",
    difficulty: "National Olympiad",
    pointsAwarded: 1200,
    durationMinutes: 150,
    participantsCount: 1890,
    isFeatured: true,
    registrationDeadline: "Nov 25, 2026",
    contestDate: "Dec 02, 2026 • 16:00 UTC",
    description: "Fast-paced algorithmic challenge featuring dynamic programming, graph theory, flow networks, and computational geometry.",
    prizes: "$7,500 Cash + Tech Internship Fast-Tracks",
  },
  {
    id: "chem-2026-mendeleev",
    title: "Mendeleev Chemistry Cup & Analytical Challenge",
    slug: "mendeleev-chemistry-cup-2026",
    category: "chemistry",
    categoryLabel: "Chemistry",
    bannerGradient: "from-rose-600 via-pink-700 to-purple-900",
    organizer: {
      name: "Oxford Chemical Sciences Circle",
      domain: "ox.ac.uk",
      isVerified: true,
      type: "University",
    },
    status: "upcoming",
    statusLabel: "Starting in 3 Days",
    difficulty: "Regional Olympiad",
    pointsAwarded: 900,
    durationMinutes: 120,
    participantsCount: 940,
    isFeatured: false,
    registrationDeadline: "Nov 08, 2026",
    contestDate: "Nov 10, 2026 • 10:00 UTC",
    description: "Multi-stage chemistry Olympiad testing thermodynamics, organic synthesis mechanisms, and molecular spectroscopy.",
    prizes: "Gold, Silver & Bronze Honor Certificates",
  },
  {
    id: "astro-2026-pulsar",
    title: "Kepler Astrophysics & Space Olympiad",
    slug: "kepler-astrophysics-space-olympiad",
    category: "astronomy",
    categoryLabel: "Astronomy & Space",
    bannerGradient: "from-amber-600 via-orange-700 to-indigo-950",
    organizer: {
      name: "International Space Sciences Academy",
      domain: "issa-astronomy.org",
      isVerified: true,
      type: "National Association",
    },
    status: "registration_open",
    statusLabel: "Registration Open",
    difficulty: "Regional Olympiad",
    pointsAwarded: 850,
    durationMinutes: 120,
    participantsCount: 1120,
    isFeatured: false,
    registrationDeadline: "Nov 15, 2026",
    contestDate: "Nov 20, 2026 • 18:00 UTC",
    description: "Problems in stellar evolution, celestial mechanics, radio astronomy data analysis, and cosmological redshift models.",
    prizes: "Observatory Research Grants + Digital Medallions",
  },
  {
    id: "bio-2026-genomics",
    title: "Genomics & Bio-Informatics Challenge 2026",
    slug: "genomics-bio-informatics-challenge-2026",
    category: "biology",
    categoryLabel: "Biology & Life Sciences",
    bannerGradient: "from-teal-600 via-cyan-700 to-blue-900",
    organizer: {
      name: "Johns Hopkins Pre-Med Society",
      domain: "jhu.edu",
      isVerified: true,
      type: "University",
    },
    status: "upcoming",
    statusLabel: "Upcoming",
    difficulty: "School Level",
    pointsAwarded: 600,
    durationMinutes: 90,
    participantsCount: 780,
    isFeatured: false,
    registrationDeadline: "Nov 30, 2026",
    contestDate: "Dec 05, 2026 • 15:00 UTC",
    description: "Foundations of molecular genetics, enzyme kinetics, CRISPR applications, and ecological population dynamics.",
    prizes: "Pre-College Fellowship Recommendations",
  },
];
