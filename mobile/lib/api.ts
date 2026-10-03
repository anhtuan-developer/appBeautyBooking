import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * =====================================================
 * API CONFIG
 * =====================================================
 */

const MOBILE_API_HOST = '192.168.1.118';

const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:3000/api'
    : `http://${MOBILE_API_HOST}:3000/api`;

const TOKEN_KEY = '@BeautyBooking:accessToken';

/**
 * =====================================================
 * API ERROR
 * =====================================================
 */

export interface ApiError {
  success?: boolean;
  message?: string;
  errors?: unknown;
}

/**
 * =====================================================
 * TOKEN
 * =====================================================
 */

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}
export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function saveToken(
  token: string,
): Promise<void> {
  await AsyncStorage.setItem(
    TOKEN_KEY,
    token,
  );
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(
    TOKEN_KEY,
  );
}

/**
 * =====================================================
 * REQUEST
 * =====================================================
 */

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  /**
   * Thêm headers nếu caller truyền vào
   */
  if (options.headers) {
    Object.assign(
      headers,
      options.headers,
    );
  }

  /**
   * Thêm JWT
   */
  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const url =
    `${API_BASE_URL}${endpoint}`;

  console.log(
    '🌐 API Request:',
    options.method || 'GET',
    url,
  );

  try {
    const response = await fetch(
      url,
      {
        ...options,
        headers,
      },
    );

    let data: unknown = null;

    /**
     * Backend trả JSON
     */
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    /**
     * HTTP error
     */
    if (!response.ok) {
      const errorData =
        data as ApiError | null;

      throw new Error(
        errorData?.message ||
          `Request failed with status ${response.status}`,
      );
    }

    return data as T;
  } catch (error) {
    /**
     * Hiển thị URL thật để
     * dễ debug Failed to fetch.
     */
    console.error(
      '❌ API Request failed:',
      url,
      error,
    );

    /**
     * Nếu đã là Error thì giữ nguyên
     * message từ fetch/backend.
     */
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      'Không thể kết nối tới máy chủ.',
    );
  }
}

/**
 * =====================================================
 * API
 * =====================================================
 */

export const api = {
  get<T>(
    endpoint: string,
  ): Promise<T> {
    return request<T>(
      endpoint,
      {
        method: 'GET',
      },
    );
  },

  post<T>(
    endpoint: string,
    body?: unknown,
  ): Promise<T> {
    return request<T>(
      endpoint,
      {
        method: 'POST',
        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      },
    );
  },

  patch<T>(
    endpoint: string,
    body?: unknown,
  ): Promise<T> {
    return request<T>(
      endpoint,
      {
        method: 'PATCH',
        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      },
    );
  },

  delete<T>(
    endpoint: string,
  ): Promise<T> {
    return request<T>(
      endpoint,
      {
        method: 'DELETE',
      },
    );
  },
};

/**
 * Export để debug hoặc sử dụng
 * ở những file khác nếu cần.
 */
export {
  API_BASE_URL,
  TOKEN_KEY,
};