import type { ApiMessage } from '@/apis/interfaces/apiMessage.interface';
import type { ApiInbox } from '@/apis/interfaces/inbox.interface';
import type { ApiInboxMember } from '@/apis/interfaces/inboxMember.interface';
import type { Conversation } from '@/interfaces/conversation.interface';
import type { Message } from '@/interfaces/message.interface';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_DAYS = 7;

const clockFormat = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
});
const weekdayShortFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
});
const weekdayLongFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
});
const dateFormat = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const daysAgo = (date: Date): number =>
  Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY_MS);

export const formatTime = (iso: string): string => clockFormat.format(new Date(iso));

export const dayLabelOf = (iso: string): string => {
  const date = new Date(iso);
  const days = daysAgo(date);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < WEEK_DAYS) return weekdayLongFormat.format(date);
  return dateFormat.format(date);
};

export const listTimeOf = (iso: string): string => {
  const date = new Date(iso);
  const days = daysAgo(date);

  if (days === 0) return clockFormat.format(date);
  if (days === 1) return 'Yesterday';
  if (days < WEEK_DAYS) return weekdayShortFormat.format(date);
  return dateFormat.format(date);
};

const displayNameOf = (member: ApiInboxMember): string => member.nickname || member.user.name;

const partnerOf = (inbox: ApiInbox, meId: string): ApiInboxMember | undefined =>
  inbox.members.find((member) => member.userId !== meId);

const isImage = (message: ApiMessage): boolean => message.contentType.startsWith('image/');

const previewOf = (message: ApiMessage): string => (isImage(message) ? 'Photo' : message.content);

export const toConversation = (
  inbox: ApiInbox,
  meId: string,
  lastMessage: ApiMessage | undefined,
): Conversation => {
  const isGroup = inbox.type === 'group';
  const partner = isGroup ? undefined : partnerOf(inbox, meId);

  let lastMessageText = '';
  if (lastMessage) {
    const sender = inbox.members.find((member) => member.userId === lastMessage.senderId);
    const prefix =
      isGroup && sender && lastMessage.senderId !== meId ? `${sender.user.name}: ` : '';
    lastMessageText = `${prefix}${previewOf(lastMessage)}`;
  }

  return {
    id: inbox.id,
    name: isGroup ? (inbox.name ?? '') : partner ? displayNameOf(partner) : '',
    avatarUrl: partner?.user.avatar ?? undefined,
    isGroup,
    isOnline: partner?.user.isOnline ?? false,
    memberCount: isGroup ? inbox.members.length : undefined,
    lastMessage: lastMessageText,
    lastMessageTime: lastMessage ? listTimeOf(lastMessage.sentAt) : '',
    unreadCount: 0,
    isTyping: false,
  };
};

export const toMessage = (
  message: ApiMessage,
  meId: string,
  members: ApiInboxMember[],
): Message => {
  const sender = members.find((member) => member.userId === message.senderId);
  const image = isImage(message);

  return {
    id: message.id,
    conversationId: message.inboxId,
    senderName: sender ? displayNameOf(sender) : '',
    isOwn: message.senderId === meId,
    kind: image ? 'image' : 'text',
    text: image ? undefined : message.content,
    imageUrl: image ? message.content : undefined,
    time: formatTime(message.sentAt),
    status: 'sent',
    dayLabel: dayLabelOf(message.sentAt),
  };
};

export const activityOf = (inbox: ApiInbox, lastMessage: ApiMessage | undefined): number =>
  new Date(lastMessage?.sentAt ?? inbox.createdAt).getTime();
