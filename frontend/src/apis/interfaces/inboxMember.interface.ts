import type { User } from '@/interfaces/user.interface';

export interface ApiInboxMember {
  userId: string;
  nickname: string | null;
  user: Pick<User, 'id' | 'name' | 'username' | 'avatar' | 'isOnline' | 'lastSeen'>;
}
