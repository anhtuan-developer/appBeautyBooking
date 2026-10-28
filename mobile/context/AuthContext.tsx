import AsyncStorage from '@react-native-async-storage/async-storage';
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
  ApiRequestError,
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

  sessionUnavailable: boolean;

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

const USER_CACHE_KEY = '@BeautyBooking:cachedUser';

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
  const [sessionUnavailable, setSessionUnavailable] = useState(false);

  const isAuthenticated =
    user !== null;

  /**
   * =========================
   * GET CURRENT USER
   * =========================
   */

  const refreshUser = useCallback(
    async () => {
      setSessionUnavailable(false);
      try {
        const token =
          await getStoredToken();

        if (!token) {
          await AsyncStorage.removeItem(USER_CACHE_KEY);
          setUser(null);
          setSessionUnavailable(false);
          return;
        }

        const response = await getMe();
        setUser(response.data);
        setSessionUnavailable(false);
        await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(response.data));
      } catch (error) {
        // Invalid/expired credentials are cleared; transient network/server errors
        // retain the token and cached profile so a temporary outage doesn't log out the user.
        if (error instanceof ApiRequestError && (error.statusCode === 401 || error.statusCode === 403)) {
          await removeToken();
          await AsyncStorage.removeItem(USER_CACHE_KEY);
          setUser(null);
          setSessionUnavailable(false);
          return;
        }
        try {
          const cached = await AsyncStorage.getItem(USER_CACHE_KEY);
          if (cached) setUser(JSON.parse(cached) as User);
        } catch {
          // Ignore invalid cached JSON; the user can retry the session check.
        }
        setSessionUnavailable(true);
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
    await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    setSessionUnavailable(false);
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
    await AsyncStorage.removeItem(USER_CACHE_KEY);
    setSessionUnavailable(false);
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
    await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(response.data));
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
    // Backend increments TokenVersion after password change, invalidating all JWTs.
    await removeToken();
    await AsyncStorage.removeItem(USER_CACHE_KEY);
    setUser(null);
    setSessionUnavailable(false);
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
        sessionUnavailable,

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