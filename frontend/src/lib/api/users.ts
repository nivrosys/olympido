import { api } from './client';
import { User } from '../../types/api';

export interface UpdateProfileDto {
  fullName?: string;
  bio?: string;
  institutionName?: string;
  avatarUrl?: string;
}

export const usersApi = {
  getProfile: async (username: string): Promise<User> => {
    return api.get<User>(`/users/${username}`, { skipAuth: true });
  },

  updateProfile: async (dto: UpdateProfileDto): Promise<User> => {
    return api.put<User>('/users/profile', dto);
  },
};
