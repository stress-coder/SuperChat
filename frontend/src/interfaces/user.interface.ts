/**
 * Mirrors the backend's `SafeUser` — the User entity with `password` stripped
 * by `common/utils/sanitize-user.util.ts`. Dates arrive as ISO strings.
 */
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}
