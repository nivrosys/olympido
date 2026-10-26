import { api } from './client';
import { ContestCategory, LeaderboardEntry } from '../../types/api';

export const leaderboardsApi = {
  getAllTime: async (
    type: 'RATING' | 'POINTS' = 'RATING',
    page = 1,
    limit = 20
  ): Promise<{ leaderboard: LeaderboardEntry[]; total: number; page: number }> => {
    return api.get<{ leaderboard: LeaderboardEntry[]; total: number; page: number }>(
      '/leaderboards/all-time',
      { params: { type, page, limit }, skipAuth: true }
    );
  },

  getWeekly: async (
    category?: ContestCategory,
    page = 1,
    limit = 20
  ): Promise<{ leaderboard: LeaderboardEntry[]; total: number; page: number }> => {
    return api.get<{ leaderboard: LeaderboardEntry[]; total: number; page: number }>(
      '/leaderboards/weekly',
      { params: { category, page, limit }, skipAuth: true }
    );
  },

  getMonthly: async (
    page = 1,
    limit = 20
  ): Promise<{ leaderboard: LeaderboardEntry[]; total: number; page: number }> => {
    return api.get<{ leaderboard: LeaderboardEntry[]; total: number; page: number }>(
      '/leaderboards/monthly',
      { params: { page, limit }, skipAuth: true }
    );
  },

  getUserRank: async (username: string): Promise<any> => {
    return api.get<any>(`/leaderboards/rank/${username}`, { skipAuth: true });
  },
};
