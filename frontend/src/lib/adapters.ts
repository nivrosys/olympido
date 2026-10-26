import { Contest } from '../types/api';
import { Competition } from '../data/mockCompetitions';

export function adaptContestToCompetition(c: Contest): Competition {
  const categoryMap: Record<string, { key: any; label: string; gradient: string }> = {
    PHYSICS: {
      key: "physics",
      label: "Physics",
      gradient: "from-blue-600 via-indigo-700 to-purple-900",
    },
    MATHEMATICS: {
      key: "mathematics",
      label: "Mathematics",
      gradient: "from-purple-600 via-indigo-600 to-blue-800",
    },
    CHEMISTRY: {
      key: "chemistry",
      label: "Chemistry",
      gradient: "from-emerald-600 via-teal-700 to-cyan-900",
    },
    INFORMATICS: {
      key: "coding",
      label: "Informatics & Coding",
      gradient: "from-amber-500 via-orange-600 to-rose-700",
    },
    BIOLOGY: {
      key: "biology",
      label: "Biology & Life Sciences",
      gradient: "from-teal-600 via-emerald-700 to-slate-900",
    },
    ASTRONOMY: {
      key: "astronomy",
      label: "Astronomy & Astrophysics",
      gradient: "from-indigo-600 via-purple-700 to-slate-950",
    },
  };

  const statusMap: Record<string, { key: any; label: string }> = {
    SCHEDULED: { key: "upcoming", label: "Scheduled" },
    LIVE: { key: "live", label: "Live Now" },
    EVALUATION: { key: "completed", label: "In Evaluation" },
    COMPLETED: { key: "completed", label: "Official Results" },
    APPROVED: { key: "registration_open", label: "Registration Open" },
    DRAFT: { key: "upcoming", label: "Draft" },
    IN_REVIEW: { key: "upcoming", label: "In Review" },
    CHANGES_REQUESTED: { key: "upcoming", label: "Changes Requested" },
    REJECTED: { key: "completed", label: "Rejected" },
  };

  const cat = categoryMap[c.category] || categoryMap.PHYSICS;
  const stat = statusMap[c.status] || { key: "registration_open", label: "Registration Open" };

  const startFormatted = c.startTime
    ? new Date(c.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "TBD";

  const timeFormatted = c.startTime
    ? new Date(c.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "14:00 UTC";

  return {
    id: c.id,
    title: c.title,
    slug: c.slug || c.id,
    category: cat.key,
    categoryLabel: cat.label,
    bannerGradient: c.bannerUrl || cat.gradient,
    organizer: {
      name: c.organization?.name || c.creator?.fullName || "Olympiad Committee",
      domain: c.organization?.officialDomain || "olympido.org",
      isVerified: Boolean(c.organization?.status === "VERIFIED" || c.creator?.role === "ADMIN"),
      type: "University",
    },
    status: stat.key,
    statusLabel: stat.label,
    difficulty:
      c.difficultyLevel === "SCHOOL"
        ? "School Level"
        : c.difficultyLevel === "REGIONAL"
        ? "Regional Olympiad"
        : c.difficultyLevel === "INTERNATIONAL"
        ? "International"
        : "National Olympiad",
    pointsAwarded: c.pointsAwarded || 1000,
    durationMinutes: c.durationMinutes || 90,
    participantsCount: c._count?.registrations || c._count?.submissions || 0,
    isFeatured: true,
    registrationDeadline: startFormatted,
    contestDate: `${startFormatted} • ${timeFormatted}`,
    description: c.description || "",
    prizes: "Official Accredited Scorecard & Rating Delta",
  };
}
