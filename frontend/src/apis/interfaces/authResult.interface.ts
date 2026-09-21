import type { User } from '@/interfaces/user.interface';

/** A signed-in session plus the backend's message for it. */
export interface AuthResult {
  message: string;
  user: User;
  accessToken: string;
}
