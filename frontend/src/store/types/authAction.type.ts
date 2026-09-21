import type { AUTH_LOGIN_SUCCESS, AUTH_LOGOUT } from '@/store/constants/authConstants';
import type { Credentials } from '@/store/interfaces/credentials.interface';

/** Every action this reducer understands. The union makes a typo'd type a build error. */
export type AuthAction =
  | { type: typeof AUTH_LOGIN_SUCCESS; payload: Credentials }
  | { type: typeof AUTH_LOGOUT };
