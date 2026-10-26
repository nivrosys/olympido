import { api, setTokens, clearTokens } from './client';
import { AuthTokens, User } from '../../types/api';

export interface LoginDto {
  emailOrUsername: string;
  password: string;
}

export interface RegisterStudentDto {
  email: string;
  username: string;
  fullName: string;
  password: string;
  institutionName?: string;
}

export interface RegisterOrganizerDto {
  email: string;
  username: string;
  fullName: string;
  password: string;
  organizationName: string;
  websiteUrl?: string;
  contactEmail?: string;
  accreditationDocumentUrl?: string;
}

export interface RegisterTeacherDto {
  email: string;
  username: string;
  fullName: string;
  password: string;
  organizationId: string;
  employeeId?: string;
  department?: string;
}

export const authApi = {
  login: async (dto: LoginDto): Promise<AuthTokens> => {
    const data = await api.post<AuthTokens>('/auth/login', dto, { skipAuth: true });
    if (data.accessToken) {
      setTokens(data.accessToken, data.refreshToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('olympido_user', JSON.stringify(data.user));
      }
    }
    return data;
  },

  registerStudent: async (dto: RegisterStudentDto) => {
    return api.post<{ message: string; user: User; verificationToken?: string }>(
      '/auth/register/student',
      dto,
      { skipAuth: true }
    );
  },

  registerOrganizer: async (dto: RegisterOrganizerDto) => {
    return api.post<{ message: string; user: User; verificationToken?: string }>(
      '/auth/register/organizer',
      dto,
      { skipAuth: true }
    );
  },

  registerTeacher: async (dto: RegisterTeacherDto) => {
    return api.post<{ message: string; user: User }>(
      '/auth/register/teacher',
      dto,
      { skipAuth: true }
    );
  },

  getMe: async (): Promise<User> => {
    return api.get<User>('/auth/me');
  },

  verifyEmail: async (token: string) => {
    return api.post<{ message: string }>('/auth/verify-email', { token }, { skipAuth: true });
  },

  forgotPassword: async (email: string) => {
    return api.post<{ message: string }>('/auth/forgot-password', { email }, { skipAuth: true });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return api.post<{ message: string }>('/auth/reset-password', { token, newPassword }, { skipAuth: true });
  },

  logout: () => {
    clearTokens();
  },
};
