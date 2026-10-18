/** A message row as the backend returns it. Dates arrive as ISO strings. */
export interface ApiMessage {
  id: string;
  inboxId: string;
  parentId: string | null;
  content: string;
  contentType: string;
  senderId: string;
  sentAt: string;
}
