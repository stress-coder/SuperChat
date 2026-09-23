import type { MessageKind } from '@/types/messageKind.type';
import type { MessageStatus } from '@/types/messageStatus.type';

/** A single bubble in a conversation thread. */
export interface Message {
  id: string;
  conversationId: string;
  /** Only rendered for incoming group messages. */
  senderName: string;
  /** True when the signed-in user sent it — decides the bubble side. */
  isOwn: boolean;
  kind: MessageKind;
  text?: string;
  imageUrl?: string;
  /** Pre-formatted clock time, e.g. '14:20'. */
  time: string;
  status: MessageStatus;
  /** Groups bubbles under a date separator, e.g. 'Today'. */
  dayLabel: string;
}
