import type { ApiInboxMember } from '@/apis/interfaces/inboxMember.interface';
import type { InboxType } from '@/apis/types/inboxType.type';

export interface ApiInbox {
  id: string;
  name: string | null;
  type: InboxType;
  createdBy: string | null;
  createdAt: string;
  members: ApiInboxMember[];
}
