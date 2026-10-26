import { api } from './client';
import { Organization } from '../../types/api';

export interface CreateOrganizationDto {
  name: string;
  officialDomain: string;
  contactEmail: string;
  websiteUrl?: string;
  accreditationDocumentUrl?: string;
}

export const organizationsApi = {
  findAll: async (page = 1, limit = 20, search?: string): Promise<{ organizations: Organization[]; total: number }> => {
    return api.get<{ organizations: Organization[]; total: number }>('/organizations', {
      params: { page, limit, search },
      skipAuth: true,
    });
  },

  findOne: async (id: string): Promise<Organization> => {
    return api.get<Organization>(`/organizations/${id}`, { skipAuth: true });
  },

  create: async (dto: CreateOrganizationDto): Promise<Organization> => {
    return api.post<Organization>('/organizations', dto);
  },

  getTeachers: async (organizationId: string): Promise<any[]> => {
    return api.get<any[]>(`/organizations/${organizationId}/teachers`);
  },

  approveTeacher: async (organizationId: string, teacherId: string, isApproved: boolean): Promise<any> => {
    return api.put<any>(`/organizations/${organizationId}/teachers/${teacherId}/approve`, {
      isApproved,
    });
  },
};
