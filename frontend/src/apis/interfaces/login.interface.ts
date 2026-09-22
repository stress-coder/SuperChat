import type { User } from '@/interfaces/user.interface';

/** The `data` payload of a successful `POST /auth/login`. */
export interface LoginData {
  accessToken: string;
  user: User;
}
