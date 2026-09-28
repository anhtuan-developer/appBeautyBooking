// services/authService.ts

import { api } from '@/lib/api';

import {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateProfileRequest,
} from '@/types/auth';

/**
 * =========================
 * LOGIN
 * =========================
 */

export async function login(
  data: LoginRequest,
): Promise<LoginResponse> {
  return api.post<LoginResponse>(
    '/auth/login',
    data,
  );
}

/**
 * =========================
 * REGISTER
 * =========================
 */

export async function register(
  data: RegisterRequest,
): Promise<RegisterResponse> {
  return api.post<RegisterResponse>(
    '/auth/register',
    data,
  );
}

/**
 * =========================
 * GET CURRENT USER
 * =========================
 */

export async function getMe(): Promise<MeResponse> {
  return api.get<MeResponse>(
    '/auth/me',
  );
}

/**
 * =========================
 * UPDATE PROFILE
 * =========================
 */

export async function updateProfile(
  data: UpdateProfileRequest,
): Promise<MeResponse> {
  return api.patch<MeResponse>(
    '/auth/profile',
    data,
  );
}

/**
 * =========================
 * CHANGE PASSWORD
 * =========================
 */

export async function changePassword(
  data: ChangePasswordRequest,
): Promise<{
  success: boolean;
  message: string;
}> {
  return api.patch<{
    success: boolean;
    message: string;
  }>(
    '/auth/change-password',
    data,
  );
}