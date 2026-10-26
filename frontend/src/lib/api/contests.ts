import { api } from './client';
import {
  Contest,
  ContestCategory,
  ContestStatus,
  DifficultyLevel,
} from '../../types/api';

export interface ContestQueryDto {
  category?: ContestCategory;
  status?: ContestStatus;
  difficultyLevel?: DifficultyLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateContestDto {
  title: string;
  description: string;
  rules?: string;
  category: ContestCategory;
  difficultyLevel: DifficultyLevel;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  maxParticipants?: number;
  isPublic?: boolean;
  allowedDomains?: string[];
  bannerUrl?: string;
  pointsAwarded?: number;
  organizationId?: string;
}

export interface UpdateContestDto extends Partial<CreateContestDto> {}

export const contestsApi = {
  findAll: async (query?: ContestQueryDto): Promise<{ contests: Contest[]; total: number; page: number; limit: number }> => {
    return api.get<{ contests: Contest[]; total: number; page: number; limit: number }>('/contests', {
      params: query as any,
      skipAuth: true,
    });
  },

  findBySlug: async (slug: string): Promise<Contest> => {
    return api.get<Contest>(`/contests/${slug}`);
  },

  getMyCreatedContests: async (page = 1, limit = 20): Promise<{ contests: Contest[]; total: number }> => {
    return api.get<{ contests: Contest[]; total: number }>('/contests/my/created', {
      params: { page, limit },
    });
  },

  create: async (dto: CreateContestDto): Promise<Contest> => {
    return api.post<Contest>('/contests', dto);
  },

  update: async (id: string, dto: UpdateContestDto): Promise<Contest> => {
    return api.put<Contest>(`/contests/${id}`, dto);
  },

  submitReview: async (id: string): Promise<{ message: string; contest: Contest }> => {
    return api.post<{ message: string; contest: Contest }>(`/contests/${id}/submit-review`);
  },

  register: async (id: string): Promise<{ message: string; registration: any }> => {
    return api.post<{ message: string; registration: any }>(`/contests/${id}/register`);
  },

  tickSchedule: async (): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/contests/tick-schedule');
  },
};
