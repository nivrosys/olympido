import { api } from './client';
import { AuditLog, Contest, Organization } from '../../types/api';

export interface ReviewContestDto {
  status: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';
  reviewNotes?: string;
}

export interface ReviewOrganizationDto {
  status: 'VERIFIED' | 'REJECTED';
  reviewNotes?: string;
}

export const adminApi = {
  getPendingContests: async (page = 1, limit = 20): Promise<{ contests: Contest[]; total: number }> => {
    return api.get<{ contests: Contest[]; total: number }>('/admin/contests/pending', {
      params: { page, limit },
    });
  },

  reviewContest: async (contestId: string, dto: ReviewContestDto): Promise<Contest> => {
    return api.put<Contest>(`/admin/contests/${contestId}/review`, dto);
  },

  getPendingOrganizations: async (page = 1, limit = 20): Promise<{ organizations: Organization[]; total: number }> => {
    return api.get<{ organizations: Organization[]; total: number }>('/admin/organizations/pending', {
      params: { page, limit },
    });
  },

  reviewOrganization: async (orgId: string, dto: ReviewOrganizationDto): Promise<Organization> => {
    return api.put<Organization>(`/admin/organizations/${orgId}/review`, dto);
  },

  getAuditLogs: async (page = 1, limit = 30): Promise<{ logs: AuditLog[]; total: number }> => {
    return api.get<{ logs: AuditLog[]; total: number }>('/admin/audit-logs', {
      params: { page, limit },
    });
  },
};
