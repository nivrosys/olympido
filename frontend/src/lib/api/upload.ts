import { api } from './client';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export const uploadApi = {
  uploadFile: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<UploadResult>('/upload', formData);
  },

  presign: async (filename: string, mimeType: string): Promise<{ uploadUrl: string; fileUrl: string }> => {
    return api.post<{ uploadUrl: string; fileUrl: string }>('/upload/presign', {
      filename,
      mimeType,
    });
  },
};
