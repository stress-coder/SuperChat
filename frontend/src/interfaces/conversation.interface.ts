/** One row in the inbox list — a direct chat or a group. */
export interface Conversation {
  id: string;
  name: string;
  /** Falls back to the name's initials when absent. */
  avatarUrl?: string;
  isGroup: boolean;
  /** Direct chats only; groups show their member count instead. */
  isOnline: boolean;
  /** Members of a group chat, used for the header subtitle. */
  memberCount?: number;
  /** Shown under the name in the inbox — already truncated by CSS. */
  lastMessage: string;
  /** Pre-formatted for now ('14:20', 'Yesterday', 'Mon') — no date library yet. */
  lastMessageTime: string;
  unreadCount: number;
  /** Renders the animated dots in the thread and a hint in the inbox. */
  isTyping: boolean;
}
