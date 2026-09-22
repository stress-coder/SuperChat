import type { User } from '@/interfaces/user.interface';

/** A signed-in session as the store holds it — the payload of AUTH_LOGIN_SUCCESS. */
export interface Credentials {
  user: User;
  accessToken: string;
}
