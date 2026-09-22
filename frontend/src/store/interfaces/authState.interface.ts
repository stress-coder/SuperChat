import type { User } from '@/interfaces/user.interface';

/** The shape of the `auth` slice in the redux store. */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}
