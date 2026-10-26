import { api } from './client';
import { ContestResult } from '../../types/api';

export interface VerifyScorecardResponse {
  isValid: boolean;
  scorecardHash: string;
  student: {
    fullName: string;
    username: string;
    institutionName?: string | null;
  };
  contest: {
    title: string;
    category: string;
    difficultyLevel: string;
    completedAt: string;
    organizer?: string;
  };
  performance: {
    rank: number;
    totalParticipants: number;
    score: number;
    maxScore: number;
    percentile: number;
    pointsEarned: number;
    ratingDelta: number;
    badgeAwarded?: string | null;
  };
  verificationTimestamp: string;
  cryptographicSignature: string;
}

export const resultsApi = {
  finalizeContest: async (contestId: string): Promise<{ message: string; resultsCount: number }> => {
    return api.post<{ message: string; resultsCount: number }>(`/contests/${contestId}/finalize`);
  },

  getContestResults: async (
    contestId: string,
    page = 1,
    limit = 20
  ): Promise<{ results: ContestResult[]; total: number; page: number; limit: number }> => {
    return api.get<{ results: ContestResult[]; total: number; page: number; limit: number }>(
      `/contests/${contestId}/results`,
      { params: { page, limit }, skipAuth: true }
    );
  },

  getMyResult: async (contestId: string): Promise<ContestResult> => {
    return api.get<ContestResult>(`/contests/${contestId}/my-results`);
  },

  getUserScorecards: async (username: string): Promise<ContestResult[]> => {
    return api.get<ContestResult[]>(`/users/${username}/scorecards`, { skipAuth: true });
  },

  verifyScorecard: async (hash: string): Promise<VerifyScorecardResponse> => {
    return api.get<VerifyScorecardResponse>(`/verify/scorecard/${hash}`, { skipAuth: true });
  },
};
