import type { ApiResponse } from '@/types/api.types';
import type { User } from '@/types/user.types';
import { readStoredAuth } from '@/utils/authStorage';
import type { LoginFormValues } from '@/validations/login.validation';
import type { RegisterFormValues } from '@/validations/register.validation';
import apiClient, { ApiError } from './client';

/** The auth module's only API file. Response payloads as they appear in `data`. */

interface LoginData {
  accessToken: string;
  user: User;
}

interface RefreshData {
  accessToken: string;
}

/** A signed-in session plus the backend's message for it. */
export interface AuthResult {
  message: string;
  user: User;
  accessToken: string;
}

const ALREADY_LOGGED_IN = 409;

/**
 * Exchanges the httpOnly refresh cookie for a fresh access token.
 * Single-use on the backend — it revokes the old session and issues a new jti,
 * so never call this concurrently.
 */
export const refreshRequest = async (): Promise<string> => {
  const { data } = await apiClient.post<ApiResponse<RefreshData>>('/auth/refresh');
  return data.data.accessToken;
};

/**
 * Recovers from 409 "You are already logged in."
 *
 * The backend refuses a second login while a valid refresh-cookie session
 * exists, stranding anyone whose localStorage was cleared but whose cookie
 * survived. The cookie is still good, so mint a token from it. The refresh
 * response carries no user, so this only works with a persisted user.
 */
const recoverExistingSession = async (message: string): Promise<AuthResult | null> => {
  const { user } = readStoredAuth();

  if (!user) {
    return null;
  }

  try {
    const accessToken = await refreshRequest();
    return { message, user, accessToken };
  } catch {
    return null;
  }
};

export const loginRequest = async (values: LoginFormValues): Promise<AuthResult> => {
  try {
    const { data } = await apiClient.post<ApiResponse<LoginData>>('/auth/login', {
      email: values.email.trim(),
      password: values.password,
    });

    return { message: data.message, user: data.data.user, accessToken: data.data.accessToken };
  } catch (error) {
    if (error instanceof ApiError && error.status === ALREADY_LOGGED_IN) {
      const recovered = await recoverExistingSession(error.message);

      if (recovered) {
        return recovered;
      }
    }

    throw error;
  }
};

/**
 * Creates the user. The backend returns the user but no tokens, so the caller
 * still has to log in. `confirmPassword` is dropped here — sending it would be
 * a 400 under the backend's `forbidNonWhitelisted` ValidationPipe.
 */
export const registerRequest = async (values: RegisterFormValues): Promise<string> => {
  const { data } = await apiClient.post<ApiResponse<{ user: User }>>('/auth/register', {
    name: values.name.trim(),
    username: values.username.trim(),
    email: values.email.trim(),
    password: values.password,
  });

  return data.message;
};

/**
 * Best-effort: the endpoint needs a live access token to revoke the session, so
 * an expired token means the server keeps its cookie. The caller clears local
 * state regardless — staying "signed in" after a failed logout is worse.
 */
export const logoutRequest = async (): Promise<string | null> => {
  try {
    const { data } = await apiClient.post<ApiResponse<null>>('/auth/logout');
    return data.message;
  } catch {
    return null;
  }
};
