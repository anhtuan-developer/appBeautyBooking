import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const API_BASE_URL = (
  configuredApiUrl ||
  (Platform.OS === 'web'
    ? 'http://localhost:3000/api'
    : Platform.OS === 'android'
      ? 'http://10.0.2.2:3000/api' // Android emulator; physical phones must set EXPO_PUBLIC_API_URL.
      : 'http://localhost:3000/api')
).replace(/\/+$/, '');

const TOKEN_KEY = '@BeautyBooking:accessToken';
const REQUEST_TIMEOUT_MS = 15000;

export interface ApiError {
  success?: boolean;
  message?: string;
  errors?: unknown;
}

export class ApiRequestError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
  }
}

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredToken(): Promise<string | null> {
  return getToken();
}

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (options.headers) Object.assign(headers, options.headers);
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const externalSignal = options.signal;
  const abortFromExternalSignal = () => controller.abort();
  if (externalSignal?.aborted) controller.abort();
  else externalSignal?.addEventListener('abort', abortFromExternalSignal, { once: true });
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    let data: unknown = null;
    try { data = await response.json(); } catch { /* empty/non-JSON response */ }

    if (!response.ok) {
      const errorData = data as ApiError | null;
      throw new ApiRequestError(
        errorData?.message || `Yêu cầu thất bại (HTTP ${response.status}).`,
        response.status,
      );
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiRequestError(timedOut
        ? 'Máy chủ phản hồi quá lâu. Hãy kiểm tra mạng và thử lại.'
        : 'Yêu cầu đã bị hủy.');
    }
    if (error instanceof Error && /Network request failed|Failed to fetch/i.test(error.message)) {
      throw new ApiRequestError(
        `Không thể kết nối máy chủ tại ${API_BASE_URL}. Kiểm tra backend đang chạy, tường lửa và EXPO_PUBLIC_API_URL.`,
      );
    }
    if (error instanceof Error) throw error;
    throw new ApiRequestError('Không thể kết nối tới máy chủ.');
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener('abort', abortFromExternalSignal);
  }
}

export const api = {
  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'GET' });
  },
  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });
  },
  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined });
  },
  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE' });
  },
};
