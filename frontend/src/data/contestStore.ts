"use client";

import { Competition, MOCK_COMPETITIONS } from "./mockCompetitions";

export interface PendingContest extends Competition {
  submittedAt: string;
  adminReviewStatus: "pending" | "approved" | "changes_requested" | "rejected";
  adminNotes?: string;
  questionCount: number;
  schoolInfo?: {
    schoolName: string;
    department: string;
    domain: string;
    facultyAdvisor: string;
    accreditationProof?: string;
  };
  studentEligibility?: {
    targetLevels: string[];
    minRating: number;
    maxCapacity: number;
    geography: "Global Open" | "Regional Partner Schools" | "Invited Institutions";
  };
  plagiarismScore?: number;
  aiSimilarityScore?: number;
}

export const INITIAL_PENDING_CONTESTS: PendingContest[] = [
  {
    id: "math-junior-2026",
    title: "National Junior Olympiad in Pure Mathematics 2026",
    slug: "national-junior-olympiad-pure-math-2026",
    category: "mathematics",
    categoryLabel: "Mathematics",
    bannerGradient: "from-purple-600 via-indigo-600 to-blue-800",
    organizer: {
      name: "Stanford Math Circle",
      domain: "stanford.edu",
      isVerified: true,
      type: "University",
    },
    schoolInfo: {
      schoolName: "Stanford University",
      department: "Department of Mathematics & Pure Science",
      domain: "stanford.edu",
      facultyAdvisor: "Prof. Kenneth Henderson, PhD",
      accreditationProof: "Stanford-Provost-Accreditation-2026.pdf",
    },
    studentEligibility: {
      targetLevels: ["Senior High School", "Freshman Undergraduate"],
      minRating: 1400,
      maxCapacity: 2500,
      geography: "Global Open",
    },
    status: "upcoming",
    statusLabel: "Pending Admin Approval",
    difficulty: "Regional Olympiad",
    pointsAwarded: 800,
    durationMinutes: 120,
    participantsCount: 0,
    isFeatured: false,
    registrationDeadline: "Dec 10, 2026",
    contestDate: "Dec 15, 2026 • 15:00 UTC",
    description: "Foundational mathematical competition covering Euclidean geometry, prime factorizations, and intro combinatorics for high schoolers.",
    prizes: "Medals of Distinction & Verified Academic Scorecard",
    submittedAt: "2 hours ago",
    adminReviewStatus: "pending",
    questionCount: 25,
    plagiarismScore: 99.4,
    aiSimilarityScore: 2.1,
  },
  {
    id: "phys-optics-2026",
    title: "Quantum & Wave Optics Challenge 2026",
    slug: "quantum-wave-optics-challenge-2026",
    category: "physics",
    categoryLabel: "Physics",
    bannerGradient: "from-blue-600 via-cyan-700 to-indigo-900",
    organizer: {
      name: "Cambridge Physics Academy",
      domain: "cam.ac.uk",
      isVerified: true,
      type: "Olympiad Committee",
    },
    schoolInfo: {
      schoolName: "University of Cambridge",
      department: "Cavendish Laboratory & Theoretical Physics",
      domain: "cam.ac.uk",
      facultyAdvisor: "Dr. Eleanor Vance, FRS",
      accreditationProof: "Cambridge-Board-Charter-2026.pdf",
    },
    studentEligibility: {
      targetLevels: ["Undergraduate", "Advanced High School"],
      minRating: 1800,
      maxCapacity: 1200,
      geography: "Global Open",
    },
    status: "upcoming",
    statusLabel: "Pending Admin Approval",
    difficulty: "National Olympiad",
    pointsAwarded: 1100,
    durationMinutes: 150,
    participantsCount: 0,
    isFeatured: false,
    registrationDeadline: "Dec 01, 2026",
    contestDate: "Dec 08, 2026 • 13:00 UTC",
    description: "Deep-dive theoretical examination on interference patterns, laser cavities, polarization, and photon mechanics.",
    prizes: "Optics Laboratory Fellowships + Honor Certificates",
    submittedAt: "5 hours ago",
    adminReviewStatus: "pending",
    questionCount: 15,
    plagiarismScore: 98.7,
    aiSimilarityScore: 4.5,
  },
];

const STORAGE_KEY_PUBLIC = "olympido_public_contests_v1";
const STORAGE_KEY_PENDING = "olympido_pending_contests_v1";

export const getPublicContests = (): Competition[] => {
  if (typeof window === "undefined") return MOCK_COMPETITIONS;
  try {
    const data = localStorage.getItem(STORAGE_KEY_PUBLIC);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_PUBLIC, JSON.stringify(MOCK_COMPETITIONS));
      return MOCK_COMPETITIONS;
    }
    return JSON.parse(data);
  } catch {
    return MOCK_COMPETITIONS;
  }
};

export const getPendingContests = (): PendingContest[] => {
  if (typeof window === "undefined") return INITIAL_PENDING_CONTESTS;
  try {
    const data = localStorage.getItem(STORAGE_KEY_PENDING);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(INITIAL_PENDING_CONTESTS));
      return INITIAL_PENDING_CONTESTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_PENDING_CONTESTS;
  }
};

export const submitNewContestForApproval = (newContest: Partial<PendingContest>): PendingContest => {
  const currentPending = getPendingContests();

  const formattedContest: PendingContest = {
    id: `contest-${Date.now()}`,
    title: newContest.title || "Custom Academic Olympiad 2026",
    slug: (newContest.title || "custom-olympiad").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    category: newContest.category || "physics",
    categoryLabel: newContest.categoryLabel || "Physics",
    bannerGradient: newContest.bannerGradient || "from-purple-600 via-indigo-600 to-blue-800",
    organizer: newContest.organizer || {
      name: "Verified Institutional Organizer",
      domain: "school.edu",
      isVerified: true,
      type: "University",
    },
    schoolInfo: newContest.schoolInfo,
    studentEligibility: newContest.studentEligibility,
    status: "upcoming",
    statusLabel: "Pending Admin Approval",
    difficulty: newContest.difficulty || "National Olympiad",
    pointsAwarded: newContest.pointsAwarded || 1000,
    durationMinutes: newContest.durationMinutes || 120,
    participantsCount: 0,
    isFeatured: false,
    registrationDeadline: newContest.registrationDeadline || "Dec 15, 2026",
    contestDate: newContest.contestDate || "Dec 20, 2026 • 14:00 UTC",
    description: newContest.description || "Academic contest configured with verified school criteria.",
    prizes: newContest.prizes || "Official Digital Scorecards & Merit Medals",
    submittedAt: "Just now",
    adminReviewStatus: "pending",
    questionCount: newContest.questionCount || 10,
    plagiarismScore: 99.1,
    aiSimilarityScore: 3.2,
  };

  const updatedPending = [formattedContest, ...currentPending];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(updatedPending));
  }
  return formattedContest;
};

export const approveContestByAdmin = (contestId: string): Competition | null => {
  const pending = getPendingContests();
  const contestIndex = pending.findIndex((c) => c.id === contestId);
  if (contestIndex === -1) return null;

  const targetContest = pending[contestIndex];
  targetContest.adminReviewStatus = "approved";
  targetContest.status = "registration_open";
  targetContest.statusLabel = "Registration Open";

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(pending));
    const publicContests = getPublicContests();
    const updatedPublic = [targetContest, ...publicContests.filter((c) => c.id !== contestId)];
    localStorage.setItem(STORAGE_KEY_PUBLIC, JSON.stringify(updatedPublic));
  }

  return targetContest;
};

export const rejectContestByAdmin = (contestId: string, reason: string): boolean => {
  const pending = getPendingContests();
  const contest = pending.find((c) => c.id === contestId);
  if (!contest) return false;

  contest.adminReviewStatus = "rejected";
  contest.adminNotes = reason;

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(pending));
  }
  return true;
};

export const requestChangesByAdmin = (contestId: string, notes: string): boolean => {
  const pending = getPendingContests();
  const contest = pending.find((c) => c.id === contestId);
  if (!contest) return false;

  contest.adminReviewStatus = "changes_requested";
  contest.adminNotes = notes;

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(pending));
  }
  return true;
};
