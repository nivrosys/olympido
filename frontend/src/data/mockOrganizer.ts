export interface OrganizerProfile {
  name: string;
  username: string;
  title: string;
  department: string;
  institution: string;
  domain: string;
  isVerified: boolean;
  verificationBadge: string;
  email: string;
  avatarUrl: string;
  stats: {
    totalHosted: number;
    activeContests: number;
    totalEnrolledStudents: number;
    participatingSchools: number;
    pendingGrading: number;
  };
}

export interface HostedContestItem {
  id: string;
  title: string;
  category: "physics" | "mathematics" | "coding" | "chemistry" | "astronomy";
  categoryLabel: string;
  status: "live" | "in_review" | "approved" | "completed";
  statusLabel: string;
  contestDate: string;
  enrolledCount: number;
  maxCapacity: number;
  durationMinutes: number;
  pointsAwarded: number;
  bannerGradient: string;
  plagiarismScore: number;
  targetEducationLevel: string[];
}

export interface EnrolledStudentItem {
  id: string;
  contestId: string;
  contestTitle: string;
  studentName: string;
  username: string;
  studentInstitution: string;
  institutionDomain: string;
  educationLevel: "Undergraduate" | "Senior High School" | "Junior High School";
  rating: number;
  ratingTier: string;
  enrolledAt: string;
  proctoringStatus: "clean" | "warning" | "flagged";
  warningsCount: number;
}

export interface TheoreticalSubmissionItem {
  id: string;
  contestId: string;
  contestTitle: string;
  studentName: string;
  username: string;
  studentInstitution: string;
  questionPrompt: string;
  studentAnswer: string;
  maxMarks: number;
  currentMarks: number | null;
  status: "ungraded" | "graded";
  feedback: string | null;
  submittedAt: string;
}

export const MOCK_ORGANIZER_PROFILE: OrganizerProfile = {
  name: "Prof. Robert Thorne, PhD",
  username: "rthorne",
  title: "Chair of Theoretical Physics & Director of Olympiad Programs",
  department: "Department of Physics & SLAC",
  institution: "Stanford University",
  domain: "stanford.edu",
  isVerified: true,
  verificationBadge: "Tier-1 Accredited University • Institutional Lead",
  email: "rthorne@stanford.edu",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  stats: {
    totalHosted: 6,
    activeContests: 2,
    totalEnrolledStudents: 3840,
    participatingSchools: 142,
    pendingGrading: 3,
  },
};

export const MOCK_HOSTED_CONTESTS: HostedContestItem[] = [
  {
    id: "phys-2026-nat",
    title: "National Youth Physics Olympiad 2026 - Semi-Finals",
    category: "physics",
    categoryLabel: "Physics",
    status: "approved",
    statusLabel: "Scheduled & Registration Open",
    contestDate: "Nov 18, 2026 • 14:00 UTC",
    enrolledCount: 2450,
    maxCapacity: 2500,
    durationMinutes: 180,
    pointsAwarded: 1500,
    bannerGradient: "from-blue-600 via-indigo-700 to-purple-900",
    plagiarismScore: 1.2,
    targetEducationLevel: ["Senior High School", "Freshman Undergraduate"],
  },
  {
    id: "stan-math-tourn",
    title: "Stanford Inter-Collegiate Math Tournament (SMT)",
    category: "mathematics",
    categoryLabel: "Mathematics",
    status: "in_review",
    statusLabel: "In Admin Moderation Queue",
    contestDate: "Dec 05, 2026 • 16:00 UTC",
    enrolledCount: 890,
    maxCapacity: 2000,
    durationMinutes: 150,
    pointsAwarded: 1200,
    bannerGradient: "from-purple-600 via-indigo-600 to-blue-800",
    plagiarismScore: 0.8,
    targetEducationLevel: ["Freshman Undergraduate", "Sophomore Undergraduate"],
  },
  {
    id: "phys-live-round",
    title: "Stanford Fall Invitational Mechanics & Electrodynamics",
    category: "physics",
    categoryLabel: "Physics",
    status: "live",
    statusLabel: "Live Contest in Progress",
    contestDate: "Happening Now • Round 1",
    enrolledCount: 500,
    maxCapacity: 500,
    durationMinutes: 120,
    pointsAwarded: 1000,
    bannerGradient: "from-rose-600 via-purple-700 to-slate-900",
    plagiarismScore: 0.5,
    targetEducationLevel: ["Senior High School", "Undergraduate"],
  },
];

export const MOCK_ENROLLED_STUDENTS: EnrolledStudentItem[] = [
  {
    id: "enr-1",
    contestId: "phys-2026-nat",
    contestTitle: "National Youth Physics Olympiad 2026",
    studentName: "Marcus Vance",
    username: "marcus_v",
    studentInstitution: "Stanford University",
    institutionDomain: "stanford.edu",
    educationLevel: "Undergraduate",
    rating: 2240,
    ratingTier: "Master",
    enrolledAt: "Oct 22, 2026",
    proctoringStatus: "clean",
    warningsCount: 0,
  },
  {
    id: "enr-2",
    contestId: "phys-2026-nat",
    contestTitle: "National Youth Physics Olympiad 2026",
    studentName: "Elena Rostova",
    username: "elena_phys",
    studentInstitution: "University of Cambridge",
    institutionDomain: "cam.ac.uk",
    educationLevel: "Undergraduate",
    rating: 2185,
    ratingTier: "Candidate Master",
    enrolledAt: "Oct 23, 2026",
    proctoringStatus: "warning",
    warningsCount: 1,
  },
  {
    id: "enr-3",
    contestId: "phys-2026-nat",
    contestTitle: "National Youth Physics Olympiad 2026",
    studentName: "Kevin Chen",
    username: "kchen_algo",
    studentInstitution: "Massachusetts Institute of Technology",
    institutionDomain: "mit.edu",
    educationLevel: "Undergraduate",
    rating: 2310,
    ratingTier: "Master",
    enrolledAt: "Oct 21, 2026",
    proctoringStatus: "clean",
    warningsCount: 0,
  },
  {
    id: "enr-4",
    contestId: "phys-2026-nat",
    contestTitle: "National Youth Physics Olympiad 2026",
    studentName: "Sophia Zhang",
    username: "sophia_z",
    studentInstitution: "Phillips Exeter Academy",
    institutionDomain: "exeter.edu",
    educationLevel: "Senior High School",
    rating: 1980,
    ratingTier: "Candidate Master",
    enrolledAt: "Oct 24, 2026",
    proctoringStatus: "clean",
    warningsCount: 0,
  },
  {
    id: "enr-5",
    contestId: "phys-2026-nat",
    contestTitle: "National Youth Physics Olympiad 2026",
    studentName: "David Kim",
    username: "dkim_phys",
    studentInstitution: "Phillips Exeter Academy",
    institutionDomain: "exeter.edu",
    educationLevel: "Senior High School",
    rating: 1890,
    ratingTier: "Expert",
    enrolledAt: "Oct 20, 2026",
    proctoringStatus: "clean",
    warningsCount: 0,
  },
  {
    id: "enr-6",
    contestId: "phys-2026-nat",
    contestTitle: "National Youth Physics Olympiad 2026",
    studentName: "Hannah Müller",
    username: "hmuller",
    studentInstitution: "ETH Zürich",
    institutionDomain: "ethz.ch",
    educationLevel: "Undergraduate",
    rating: 2050,
    ratingTier: "Expert",
    enrolledAt: "Oct 24, 2026",
    proctoringStatus: "clean",
    warningsCount: 0,
  },
];

export const MOCK_THEORETICAL_SUBMISSIONS: TheoreticalSubmissionItem[] = [
  {
    id: "sub-1",
    contestId: "phys-live-round",
    contestTitle: "Stanford Fall Invitational Mechanics & Electrodynamics",
    studentName: "Marcus Vance",
    username: "marcus_v",
    studentInstitution: "Stanford University",
    questionPrompt: "Derive the Lagrangian equation of motion for a double planar pendulum with equal lengths L and masses m undergoing small oscillations.",
    studentAnswer: `For a double pendulum with coordinates θ₁ and θ₂:
T = 1/2 m L² [ 2(θ̇₁)² + (θ̇₂)² + 2 θ̇₁ θ̇₂ cos(θ₁ - θ₂) ]
V = -m g L [ 2 cos(θ₁) + cos(θ₂) ]

Using Euler-Lagrange equations d/dt(∂L/∂q̇) - ∂L/∂q = 0:
For small oscillations, cos(θ₁ - θ₂) ≈ 1 and sin(θ) ≈ θ:
Equation 1: 2 L θ̈₁ + L θ̈₂ + 2 g θ₁ = 0
Equation 2: L θ̈₁ + L θ̈₂ + g θ₂ = 0
Normal mode eigenfrequencies: ω₁² = (2 - √2)(g/L), ω₂² = (2 + √2)(g/L). Q.E.D.`,
    maxMarks: 50,
    currentMarks: null,
    status: "ungraded",
    feedback: null,
    submittedAt: "18 mins ago",
  },
  {
    id: "sub-2",
    contestId: "phys-live-round",
    contestTitle: "Stanford Fall Invitational Mechanics & Electrodynamics",
    studentName: "Elena Rostova",
    username: "elena_phys",
    studentInstitution: "University of Cambridge",
    questionPrompt: "Derive the Lagrangian equation of motion for a double planar pendulum with equal lengths L and masses m undergoing small oscillations.",
    studentAnswer: `Set generalized coordinates θ₁, θ₂.
Kinetic energy: T = m L² [ (θ̇₁)² + 1/2 (θ̇₂)² + θ̇₁ θ̇₂ cos(θ₁ - θ₂) ]
Potential energy: V = -m g L [ 2 cos θ₁ + cos θ₂ ]
Lagrangian L = T - V.
Applying small angle approximation:
[ 2   1 ] [ θ̈₁ ] + (g/L) [ 2  0 ] [ θ₁ ] = 0
[ 1   1 ] [ θ̈₂ ]         [ 0  1 ] [ θ₂ ] = 0
Eigenvalues yield ω = √[ (2 ± √2) g / L ].`,
    maxMarks: 50,
    currentMarks: null,
    status: "ungraded",
    feedback: null,
    submittedAt: "32 mins ago",
  },
  {
    id: "sub-3",
    contestId: "phys-live-round",
    contestTitle: "Stanford Fall Invitational Mechanics & Electrodynamics",
    studentName: "Sophia Zhang",
    username: "sophia_z",
    studentInstitution: "Phillips Exeter Academy",
    questionPrompt: "Derive the Lagrangian equation of motion for a double planar pendulum with equal lengths L and masses m undergoing small oscillations.",
    studentAnswer: `T_total = 1/2 m v₁² + 1/2 m v₂²
where v₁ = L θ̇₁, v₂² = L² (θ̇₁² + θ̇₂² + 2 θ̇₁ θ̇₂ cos(θ₁-θ₂))
V = -m g y₁ - m g y₂ = -m g L (2 cos θ₁ + cos θ₂).
Solving standard characteristic polynomial det(K - ω² M) = 0 gives the exact normal modes ω² = (2 ∓ √2) g/L.`,
    maxMarks: 50,
    currentMarks: 48,
    status: "graded",
    feedback: "Flawless kinetic energy decomposition and clean characteristic matrix formulation. Full credit.",
    submittedAt: "1 hour ago",
  },
];
