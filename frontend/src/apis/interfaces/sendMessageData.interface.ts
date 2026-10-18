import type { ApiMessage } from '@/apis/interfaces/apiMessage.interface';

export interface SendMessageData {
  message: ApiMessage;
  inboxId: string;
  isNewInbox: boolean;
}
