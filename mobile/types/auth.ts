export type UserRole =
  | 'CUSTOMER'
  | 'EMPLOYEE'
  | 'SALON'
  | 'ADMIN';

export interface User {
  userId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
}

/**
 * =========================
 * LOGIN
 * =========================
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginData {
  accessToken: string;
  user: User;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginData;
}

/**
 * =========================
 * REGISTER
 * =========================
 */

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: User;
}

/**
 * =========================
 * CURRENT USER
 * =========================
 */

export interface MeResponse {
  success: boolean;
  data: User;
}

/**
 * =========================
 * UPDATE PROFILE
 * =========================
 */

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
}

/**
 * =========================
 * CHANGE PASSWORD
 * =========================
 */

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}