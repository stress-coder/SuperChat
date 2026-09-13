import axios, { AxiosError } from 'axios';
import { env } from '@/config/env';
import { store } from '@/store';

/**
 * The shared axios instance. Module API files (auth.api.ts, chat.api.ts, …)
 * import this — it is the only place the instance and its interceptors live.
 *
 * `withCredentials` is required: the backend delivers the refresh token as an
 * httpOnly `refreshToken` cookie (SameSite=Strict), which /auth/refresh and
 * /auth/logout both read.
 */
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** A failed request, carrying the backend's own message and status. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// The access token lives in the login response body, not a cookie, so we attach
// it ourselves. Reading from the store each time keeps it correct after
// login/logout without re-creating the instance.
apiClient.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Every failure becomes an ApiError whose message is whatever the backend sent.
// No message is written here — when there is no response at all (network down),
// axios's own message is used rather than inventing text.
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (error instanceof AxiosError) {
      const body: unknown = error.response?.data;
      const message =
        typeof body === 'object' &&
        body !== null &&
        typeof Reflect.get(body, 'message') === 'string'
          ? (Reflect.get(body, 'message') as string)
          : error.message;

      return Promise.reject(new ApiError(message, error.response?.status ?? 0));
    }

    return Promise.reject(error instanceof Error ? error : new ApiError(String(error), 0));
  },
);

export default apiClient;
