"use client";

import { Competition, MOCK_COMPETITIONS } from "./mockCompetitions";

export interface PendingContest extends Competition {
  submittedAt: string;
  adminReviewStatus: "pending" | "approved" | "changes_requested" | "rejected";
  adminNotes?: string;
  questionCount: number;
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

export const submitNewContestForApproval = (contest: Partial<PendingContest>): PendingContest => {
  const pending = getPendingContests();
  const newContest: PendingContest = {
    id: `contest-${Date.now()}`,
    title: contest.title || "Untitled Olympiad",
    slug: (contest.title || "untitled-olympiad").toLowerCase().replace(/\s+/g, "-"),
    category: contest.category || "physics",
    categoryLabel: contest.categoryLabel || "Physics",
    bannerGradient: contest.bannerGradient || "from-purple-600 via-indigo-600 to-blue-800",
    organizer: contest.organizer || {
      name: "Stanford Physics Club",
      domain: "stanford.edu",
      isVerified: true,
      type: "University",
    },
    status: "upcoming",
    statusLabel: "Pending Admin Approval",
    difficulty: contest.difficulty || "Regional Olympiad",
    pointsAwarded: contest.pointsAwarded || 750,
    durationMinutes: contest.durationMinutes || 120,
    participantsCount: 0,
    registrationDeadline: contest.registrationDeadline || "Dec 20, 2026",
    contestDate: contest.contestDate || "Dec 25, 2026 • 14:00 UTC",
    description: contest.description || "Academic Olympiad organized under institutional review.",
    prizes: contest.prizes || "Medals, Certificates & Verifiable Scorecards",
    submittedAt: "Just now",
    adminReviewStatus: "pending",
    questionCount: contest.questionCount || 10,
  };

  const updated = [newContest, ...pending];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(updated));
  }
  return newContest;
};

export const approveContestByAdmin = (contestId: string): Competition | null => {
  const pending = getPendingContests();
  const contest = pending.find((c) => c.id === contestId);
  if (!contest) return null;

  // 1. Remove or mark approved in pending
  const updatedPending = pending.map((c) =>
    c.id === contestId ? { ...c, adminReviewStatus: "approved" as const, statusLabel: "Approved & Published" } : c
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(updatedPending));
  }

  // 2. Add to public catalog
  const publicList = getPublicContests();
  const approvedPublic: Competition = {
    ...contest,
    status: "registration_open",
    statusLabel: "Registration Open",
    isFeatured: true,
  };
  const updatedPublic = [approvedPublic, ...publicList];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_PUBLIC, JSON.stringify(updatedPublic));
  }
  return approvedPublic;
};

export const rejectContestByAdmin = (contestId: string, reason: string): void => {
  const pending = getPendingContests();
  const updated = pending.map((c) =>
    c.id === contestId
      ? { ...c, adminReviewStatus: "rejected" as const, adminNotes: reason, statusLabel: "Rejected" }
      : c
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(updated));
  }
};

export const requestChangesByAdmin = (contestId: string, notes: string): void => {
  const pending = getPendingContests();
  const updated = pending.map((c) =>
    c.id === contestId
      ? { ...c, adminReviewStatus: "changes_requested" as const, adminNotes: notes, statusLabel: "Changes Requested" }
      : c
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(updated));
  }
};
