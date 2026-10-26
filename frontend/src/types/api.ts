// Olympido Core Type Definitions matching Backend NestJS + Prisma Models

export type UserRole = 'STUDENT' | 'TEACHER' | 'ORGANIZER' | 'ADMIN';

export type OrgStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type ContestStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'LIVE'
  | 'EVALUATION'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type ContestCategory =
  | 'PHYSICS'
  | 'MATHEMATICS'
  | 'CHEMISTRY'
  | 'INFORMATICS'
  | 'BIOLOGY'
  | 'ASTRONOMY';

export type DifficultyLevel =
  | 'SCHOOL'
  | 'REGIONAL'
  | 'NATIONAL'
  | 'INTERNATIONAL';

export type QuestionType =
  | 'MCQ'
  | 'SHORT_ANSWER'
  | 'THEORETICAL'
  | 'CODE';

export type EvaluationStatus =
  | 'PENDING'
  | 'AUTO_GRADED'
  | 'MANUAL_REVIEW'
  | 'GRADED';

// ==========================================
// Base API Responses
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors?: any;
  timestamp?: string;
  path?: string;
}

// ==========================================
// User & Auth Types
// ==========================================

export interface StudentStats {
  id: string;
  userId: string;
  currentRating: number;
  peakRating: number;
  totalPoints: number | string;
  contestsParticipated: number;
  podiumFinishes: number;
  currentStreak: number;
  longestStreak: number;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string | null;
  bio?: string | null;
  institutionName?: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  studentStats?: StudentStats | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    role: UserRole;
    avatarUrl?: string | null;
    isEmailVerified: boolean;
    studentStats?: StudentStats | null;
  };
}

// ==========================================
// Organization Types
// ==========================================

export interface Organization {
  id: string;
  name: string;
  officialDomain: string;
  contactEmail: string;
  websiteUrl?: string | null;
  accreditationDocumentUrl?: string | null;
  status: OrgStatus;
  verifiedAt?: string | null;
  verifiedById?: string | null;
  createdAt: string;
  updatedAt: string;
  teachers?: any[];
  contests?: any[];
}

// ==========================================
// Contest Types
// ==========================================

export interface Contest {
  id: string;
  title: string;
  slug: string;
  description: string;
  rules?: string | null;
  category: ContestCategory;
  difficultyLevel: DifficultyLevel;
  status: ContestStatus;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  maxParticipants?: number | null;
  isPublic: boolean;
  allowedDomains: string[];
  bannerUrl?: string | null;
  pointsAwarded: number;
  creatorId: string;
  organizationId?: string | null;
  reviewerId?: string | null;
  reviewNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string | null;
    role: UserRole;
  };
  organization?: Organization | null;
  _count?: {
    questions?: number;
    registrations?: number;
    submissions?: number;
    results?: number;
  };
  isRegistered?: boolean;
}

// ==========================================
// Question Types
// ==========================================

export interface Question {
  id: string;
  contestId: string;
  orderIndex: number;
  type: QuestionType;
  title: string;
  prompt: string;
  formula?: string | null;
  options?: any[] | null; // For MCQ: string[] or Array<{id, text}>
  correctAnswer?: any | null; // Masked for public/live contestants
  explanation?: string | null; // Masked for live contestants
  points: number;
  rubricCriteria?: any | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Submission Types
// ==========================================

export interface SubmissionAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  answerPayload: any; // { selectedOption: number } or { answerText: string }
  isCorrect?: boolean | null;
  awardedPoints: number;
  evaluationStatus: EvaluationStatus;
  gradedById?: string | null;
  feedbackNotes?: string | null;
  savedAt: string;
  question?: Question;
}

export interface Submission {
  id: string;
  contestId: string;
  userId: string;
  startedAt: string;
  submittedAt?: string | null;
  isAutoSubmitted: boolean;
  totalRawScore: number;
  status: EvaluationStatus;
  createdAt: string;
  answers?: SubmissionAnswer[];
  user?: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string | null;
    institutionName?: string | null;
  };
}

// ==========================================
// Contest Results & Scorecard Types
// ==========================================

export interface ContestResult {
  id: string;
  contestId: string;
  userId: string;
  rank: number;
  totalScore: number;
  maxScore: number;
  scorecardHash: string; // SHA-256 hash
  ratingBefore: number;
  ratingAfter: number;
  ratingDelta: number;
  pointsEarned: number;
  badgeAwarded?: string | null;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string | null;
    institutionName?: string | null;
  };
  contest?: Contest;
  breakdown?: any[];
}

// ==========================================
// Leaderboard Types
// ==========================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
  institutionName?: string | null;
  score: number; // Rating or Points
  rating?: number;
  points?: number;
  podiums?: number;
  streak?: number;
}

// ==========================================
// Notification Types
// ==========================================

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

// ==========================================
// Admin Audit Log Types
// ==========================================

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: any;
  ipAddress?: string | null;
  createdAt: string;
  admin?: {
    fullName: string;
    username: string;
    email: string;
  };
}
