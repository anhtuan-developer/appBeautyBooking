import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  changePassword as changePasswordApi,
  getMe,
  login as loginApi,
  register as registerApi,
  updateProfile as updateProfileApi,
} from '@/services/authService';

import {
  getStoredToken,
  removeToken,
  saveToken,
} from '@/lib/api';

import {
  ChangePasswordRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from '@/types/auth';

/**
 * =========================
 * AUTH CONTEXT TYPE
 * =========================
 */

interface AuthContextType {
  user: User | null;

  isLoading: boolean;

  isAuthenticated: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<void>;

  register: (
    data: RegisterRequest,
  ) => Promise<void>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;

  updateProfile: (
    data: UpdateProfileRequest,
  ) => Promise<void>;

  changePassword: (
    data: ChangePasswordRequest,
  ) => Promise<void>;
}

/**
 * =========================
 * CREATE CONTEXT
 * =========================
 */

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

/**
 * =========================
 * PROVIDER PROPS
 * =========================
 */

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * =========================
 * AUTH PROVIDER
 * =========================
 */

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const isAuthenticated =
    user !== null;

  /**
   * =========================
   * GET CURRENT USER
   * =========================
   */

  const refreshUser = useCallback(
    async () => {
      try {
        const token =
          await getStoredToken();

        if (!token) {
          setUser(null);
          return;
        }

        const response =
          await getMe();

        setUser(response.data);
      } catch (error) {
        console.error(
          'Restore session failed:',
          error,
        );

        await removeToken();

        setUser(null);
      }
    },
    [],
  );

  /**
   * =========================
   * RESTORE LOGIN SESSION
   * =========================
   */

  useEffect(() => {
    const restoreSession =
      async () => {
        try {
          await refreshUser();
        } finally {
          setIsLoading(false);
        }
      };

    restoreSession();
  }, [refreshUser]);

  /**
   * =========================
   * LOGIN
   * =========================
   */

  const login = async (
    email: string,
    password: string,
  ) => {
    /**
     * Gọi API login
     */
    const response =
      await loginApi({
        email,
        password,
      });

    /**
     * Lấy JWT + user
     */
    const {
      accessToken,
      user,
    } = response.data;

    /**
     * Lưu JWT
     */
    await saveToken(accessToken);

    /**
     * Lưu user vào state
     */
    setUser(user);
  };

  /**
   * =========================
   * REGISTER
   * =========================
   */

  const register = async (
    data: RegisterRequest,
  ) => {
    await registerApi(data);
  };

  /**
   * =========================
   * LOGOUT
   * =========================
   */

  const logout = async () => {
    /**
     * Xóa JWT
     */
    await removeToken();

    /**
     * Xóa user
     */
    setUser(null);
  };

  /**
   * =========================
   * UPDATE PROFILE
   * =========================
   */

  const updateProfile = async (
    data: UpdateProfileRequest,
  ) => {
    const response =
      await updateProfileApi(data);

    setUser(response.data);
  };

  /**
   * =========================
   * CHANGE PASSWORD
   * =========================
   */

  const changePassword = async (
    data: ChangePasswordRequest,
  ) => {
    await changePasswordApi(data);
  };

  /**
   * =========================
   * PROVIDER
   * =========================
   */

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,

        login,
        register,
        logout,

        refreshUser,

        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * =========================
 * USE AUTH
 * =========================
 */

export function useAuth(): AuthContextType {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth phải được sử dụng bên trong AuthProvider',
    );
  }

  return context;
}