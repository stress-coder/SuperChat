import type { User } from '@/types/user.types';

/**
 * Persists the access token + user so a page reload stays logged in.
 *
 * Every access is guarded: storage throws in private-browsing modes and when a
 * browser is configured to block site data, and a crash here would take the
 * whole app down at module load.
 */

const TOKEN_KEY = 'superchat.accessToken';
const USER_KEY = 'superchat.user';

export interface StoredAuth {
  accessToken: string | null;
  user: User | null;
}

const isUser = (value: unknown): value is User =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Record<string, unknown>).id === 'string' &&
  typeof (value as Record<string, unknown>).email === 'string';

export const readStoredAuth = (): StoredAuth => {
  try {
    const accessToken = localStorage.getItem(TOKEN_KEY);
    const rawUser = localStorage.getItem(USER_KEY);

    if (!accessToken || !rawUser) {
      return { accessToken: null, user: null };
    }

    const parsed: unknown = JSON.parse(rawUser);

    // A shape change between releases would otherwise surface as a crash deep
    // in a component; treat anything unrecognized as "not logged in".
    return isUser(parsed) ? { accessToken, user: parsed } : { accessToken: null, user: null };
  } catch {
    return { accessToken: null, user: null };
  }
};

export const writeStoredAuth = (accessToken: string, user: User): void => {
  try {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Non-fatal: the session simply won't survive a reload.
  }
};

export const clearStoredAuth = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // Nothing to do — there is no state left to protect.
  }
};
