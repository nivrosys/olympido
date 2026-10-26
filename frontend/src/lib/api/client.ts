// Base Fetch API Client with Interceptors, Token Injection, and Auto-Refresh

import { ApiResponse, ApiError } from '../../types/api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiClientError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('olympido_access_token');
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('olympido_refresh_token');
};

export const setTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('olympido_access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('olympido_refresh_token', refreshToken);
  }
};

export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('olympido_access_token');
  localStorage.removeItem('olympido_refresh_token');
  localStorage.removeItem('olympido_user');
};

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, skipAuth = false, headers = {}, ...rest } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = !skipAuth ? getAccessToken() : null;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData where Content-Type is auto-assigned
  if (rest.body instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  const finalHeaders = {
    ...defaultHeaders,
    ...headers,
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: finalHeaders,
    });
  } catch (networkError: any) {
    throw new ApiClientError(
      networkError.message || 'Network connection failed. Please ensure backend is running.',
      0
    );
  }

  // Handle 401 Unauthorized with token refresh
  if (response.status === 401 && !skipAuth && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (!refreshRes.ok) {
            throw new Error('Refresh token expired');
          }

          const refreshData = await refreshRes.json();
          const newAccessToken = refreshData?.data?.accessToken || refreshData?.accessToken;

          if (newAccessToken) {
            setTokens(newAccessToken);
            processQueue(null, newAccessToken);
            isRefreshing = false;

            // Retry original request with new token
            return request<T>(endpoint, {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newAccessToken}`,
              },
            });
          } else {
            throw new Error('Invalid refresh response');
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          isRefreshing = false;
          clearTokens();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('olympido_unauthorized'));
          }
          throw new ApiClientError('Session expired. Please log in again.', 401);
        }
      } else {
        // Wait for current refresh to complete
        return new Promise<T>((resolve, reject) => {
          failedQueue.push({
            resolve: (newAccessToken: string) => {
              request<T>(endpoint, {
                ...options,
                headers: {
                  ...options.headers,
                  Authorization: `Bearer ${newAccessToken}`,
                },
              })
                .then(resolve)
                .catch(reject);
            },
            reject,
          });
        });
      }
    } else {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('olympido_unauthorized'));
      }
      throw new ApiClientError('Unauthorized. Please log in.', 401);
    }
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  let data: any = null;
  if (isJson) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      data?.message ||
      (Array.isArray(data?.errors) ? data.errors.join(', ') : null) ||
      `Request failed with status ${response.status}`;
    throw new ApiClientError(errorMessage, response.status, data?.errors);
  }

  // NestJS TransformInterceptor wraps responses in { success: true, data: T, meta?: any }
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    // If the caller wants metadata, attach it as non-enumerable or return data
    if (data.meta) {
      if (typeof data.data === 'object' && data.data !== null && !Array.isArray(data.data)) {
        return { ...data.data, _meta: data.meta } as T;
      }
    }
    return data.data as T;
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
