export interface FacultyOrganizer {
  name: string;
  title: string;
  department: string;
  avatarUrl: string;
  email: string;
}

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  type: "University" | "Collegiate" | "Preparatory School" | "Olympiad Academy";
  tier: "Tier-1 Research" | "Collegiate Ivy/Russell" | "Accredited High School" | "National Board";
  country: string;
  city: string;
  flagEmoji: string;
  domain: string;
  status: "verified" | "pending";
  rank: number;
  totalPoints: number;
  medals: {
    gold: number;
    silver: number;
    bronze: number;
  };
  activeStudentsCount: number;
  facultyOrganizers: FacultyOrganizer[];
  hostedOlympiads: {
    id: string;
    title: string;
    category: string;
    status: "live" | "registration_open" | "upcoming" | "completed";
    participantsCount: number;
  }[];
  topStudents: {
    name: string;
    username: string;
    rating: number;
    tier: string;
    contestsWon: number;
  }[];
  bannerGradient: string;
  description: string;
  accreditationCertificateId: string;
}

export const MOCK_INSTITUTIONS: Institution[] = [
  {
    id: "stanford",
    name: "Stanford University",
    shortName: "Stanford",
    type: "University",
    tier: "Tier-1 Research",
    country: "United States",
    city: "Stanford, CA",
    flagEmoji: "🇺🇸",
    domain: "stanford.edu",
    status: "verified",
    rank: 1,
    totalPoints: 84200,
    medals: { gold: 24, silver: 18, bronze: 14 },
    activeStudentsCount: 420,
    bannerGradient: "from-red-600 via-rose-700 to-purple-900",
    description: "World-leading research university advancing theoretical physics, algorithmic computing, and high-energy physics through the Stanford Physics Association and SLAC.",
    accreditationCertificateId: "ACC-STANFORD-EDU-2026-T1",
    facultyOrganizers: [
      {
        name: "Prof. Robert Thorne, PhD",
        title: "Chair of Theoretical Physics",
        department: "Department of Physics & SLAC",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        email: "rthorne@stanford.edu",
      },
      {
        name: "Dr. Evelyn Vance",
        title: "Senior Olympiad Director",
        department: "Stanford Mathematical Sciences",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        email: "evelyn.vance@stanford.edu",
      },
    ],
    hostedOlympiads: [
      {
        id: "phys-2026-nat",
        title: "National Youth Physics Olympiad 2026",
        category: "Physics",
        status: "registration_open",
        participantsCount: 2450,
      },
      {
        id: "stan-math-tourn",
        title: "Stanford Math Tournament (SMT)",
        category: "Mathematics",
        status: "upcoming",
        participantsCount: 1890,
      },
    ],
    topStudents: [
      { name: "Marcus Vance", username: "marcus_v", rating: 2240, tier: "Master", contestsWon: 8 },
      { name: "Maya Lin", username: "maya_l", rating: 2110, tier: "Candidate Master", contestsWon: 5 },
      { name: "Julian Rossi", username: "jrossi", rating: 2040, tier: "Expert", contestsWon: 4 },
    ],
  },
  {
    id: "cambridge",
    name: "University of Cambridge",
    shortName: "Cambridge",
    type: "Collegiate",
    tier: "Collegiate Ivy/Russell",
    country: "United Kingdom",
    city: "Cambridge, England",
    flagEmoji: "🇬🇧",
    domain: "cam.ac.uk",
    status: "verified",
    rank: 2,
    totalPoints: 79450,
    medals: { gold: 21, silver: 19, bronze: 16 },
    activeStudentsCount: 385,
    bannerGradient: "from-sky-700 via-indigo-800 to-purple-950",
    description: "Centuries of excellence in the Mathematical Tripos, Cavendish Laboratory physics, and international scientific Olympiad examination curation.",
    accreditationCertificateId: "ACC-CAMBRIDGE-ACUK-2026-T1",
    facultyOrganizers: [
      {
        name: "Prof. Arthur Pendelton, FRS",
        title: "Cavendish Chair of Experimental Physics",
        department: "Cavendish Laboratory",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        email: "pendelton@phy.cam.ac.uk",
      },
      {
        name: "Dr. Alistair Finch",
        title: "Director of Mathematical Competitions",
        department: "Faculty of Mathematics",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        email: "finch@maths.cam.ac.uk",
      },
    ],
    hostedOlympiads: [
      {
        id: "math-2026-inv",
        title: "International Euler Mathematics Invitational",
        category: "Mathematics",
        status: "live",
        participantsCount: 3820,
      },
    ],
    topStudents: [
      { name: "Elena Rostova", username: "elena_phys", rating: 2185, tier: "Candidate Master", contestsWon: 6 },
      { name: "Oliver Davies", username: "odavies", rating: 2140, tier: "Candidate Master", contestsWon: 4 },
    ],
  },
  {
    id: "mit",
    name: "Massachusetts Institute of Technology",
    shortName: "MIT",
    type: "University",
    tier: "Tier-1 Research",
    country: "United States",
    city: "Cambridge, MA",
    flagEmoji: "🇺🇸",
    domain: "mit.edu",
    status: "verified",
    rank: 3,
    totalPoints: 76100,
    medals: { gold: 19, silver: 22, bronze: 18 },
    activeStudentsCount: 340,
    bannerGradient: "from-emerald-600 via-teal-700 to-slate-900",
    description: "Pioneering computing science, quantum algorithms, robotics, and high-performance competitive programming through MIT EECS.",
    accreditationCertificateId: "ACC-MIT-EDU-2026-T1",
    facultyOrganizers: [
      {
        name: "Prof. Clara Zhang, PhD",
        title: "Head of Algorithmic Olympiad Studies",
        department: "Department of EECS",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        email: "clarazhang@csail.mit.edu",
      },
    ],
    hostedOlympiads: [
      {
        id: "code-2026-algo",
        title: "Turing Cup: Algorithmic Olympiad 2026",
        category: "Informatics & Coding",
        status: "registration_open",
        participantsCount: 3100,
      },
    ],
    topStudents: [
      { name: "Kevin Chen", username: "kchen_algo", rating: 2310, tier: "Master", contestsWon: 9 },
      { name: "Liam Wu", username: "lwu_opt", rating: 2090, tier: "Expert", contestsWon: 5 },
    ],
  },
  {
    id: "exeter",
    name: "Phillips Exeter Academy",
    shortName: "Exeter",
    type: "Preparatory School",
    tier: "Accredited High School",
    country: "United States",
    city: "Exeter, NH",
    flagEmoji: "🇺🇸",
    domain: "exeter.edu",
    status: "verified",
    rank: 4,
    totalPoints: 62300,
    medals: { gold: 15, silver: 14, bronze: 11 },
    activeStudentsCount: 195,
    bannerGradient: "from-amber-600 via-orange-600 to-red-800",
    description: "Premier academic preparatory institution with renowned Harkness method training producing national and international Olympiad gold medalists.",
    accreditationCertificateId: "ACC-EXETER-EDU-2026-HS",
    facultyOrganizers: [
      {
        name: "Dr. Harold Sterling",
        title: "Senior Dean of STEM Education",
        department: "Harkness STEM Faculty",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
        email: "hsterling@exeter.edu",
      },
    ],
    hostedOlympiads: [
      {
        id: "exeter-math-invite",
        title: "Exeter Senior Interscholastic Olympiad",
        category: "Mathematics",
        status: "upcoming",
        participantsCount: 940,
      },
    ],
    topStudents: [
      { name: "Sophia Zhang", username: "sophia_z", rating: 1980, tier: "Candidate Master", contestsWon: 4 },
      { name: "David Kim", username: "dkim_phys", rating: 1890, tier: "Expert", contestsWon: 3 },
    ],
  },
  {
    id: "eth-zurich",
    name: "ETH Zürich",
    shortName: "ETH Zürich",
    type: "University",
    tier: "Tier-1 Research",
    country: "Switzerland",
    city: "Zürich",
    flagEmoji: "🇨🇭",
    domain: "ethz.ch",
    status: "verified",
    rank: 5,
    totalPoints: 58900,
    medals: { gold: 14, silver: 12, bronze: 15 },
    activeStudentsCount: 220,
    bannerGradient: "from-blue-700 via-cyan-700 to-slate-900",
    description: "Swiss Federal Institute of Technology recognized internationally for cutting-edge chemistry, molecular engineering, and mathematical physics.",
    accreditationCertificateId: "ACC-ETHZ-CH-2026-T1",
    facultyOrganizers: [
      {
        name: "Prof. Stefan Meier",
        title: "Chair of Physical Chemistry",
        department: "Department of Chemistry and Applied Biosciences",
        avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
        email: "smeier@chab.ethz.ch",
      },
    ],
    hostedOlympiads: [
      {
        id: "chem-2026-cup",
        title: "Mendeleev Chemistry Grand Prix 2026",
        category: "Chemistry",
        status: "upcoming",
        participantsCount: 1620,
      },
    ],
    topStudents: [
      { name: "Hannah Müller", username: "hmuller", rating: 2050, tier: "Expert", contestsWon: 3 },
    ],
  },
  {
    id: "u-tokyo",
    name: "University of Tokyo",
    shortName: "UTokyo",
    type: "University",
    tier: "Tier-1 Research",
    country: "Japan",
    city: "Tokyo",
    flagEmoji: "🇯🇵",
    domain: "u-tokyo.ac.jp",
    status: "verified",
    rank: 6,
    totalPoints: 54100,
    medals: { gold: 12, silver: 15, bronze: 13 },
    activeStudentsCount: 260,
    bannerGradient: "from-purple-800 via-pink-700 to-rose-900",
    description: "Leading Asian academic institution fostering national math, physics, and astronomy Olympiad representation across the Asia-Pacific region.",
    accreditationCertificateId: "ACC-UTOKYO-JP-2026-T1",
    facultyOrganizers: [
      {
        name: "Prof. Kenji Takahashi",
        title: "Director of Astronomy & Astrophysics",
        department: "Department of Astronomy",
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
        email: "takahashi@astron.s.u-tokyo.ac.jp",
      },
    ],
    hostedOlympiads: [
      {
        id: "astro-2026-champ",
        title: "Kepler Astrophysics & Space Olympiad 2026",
        category: "Astronomy",
        status: "registration_open",
        participantsCount: 1420,
      },
    ],
    topStudents: [
      { name: "Ren Tanaka", username: "rtanaka", rating: 2120, tier: "Candidate Master", contestsWon: 5 },
    ],
  },
];
