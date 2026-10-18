import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchInboxes, fetchMessages, sendMessage } from '@/apis/chat.api';
import type { ApiMessage } from '@/apis/interfaces/apiMessage.interface';
import type { ApiInbox } from '@/apis/interfaces/inbox.interface';
import type { Conversation } from '@/interfaces/conversation.interface';
import type { Message } from '@/interfaces/message.interface';
import { activityOf, toConversation, toMessage } from '@/utils/chatMappers';
import { showToast } from '@/utils/toast';
import type { NewChatFormValues } from '@/validations/newChat.validation';

const THREAD_POLL_MS = 5_000;
const INBOX_POLL_MS = 15_000;
const PREVIEW_LIMIT = 1;

interface ThreadState {
  inboxId: string;
  messages: ApiMessage[];
}

interface UseChatResult {
  conversations: Conversation[];
  isLoadingInboxes: boolean;
  selectedId: string | null;
  selectedConversation: Conversation | undefined;
  messages: Message[];
  isLoadingThread: boolean;
  select: (inboxId: string | null) => void;
  send: (text: string) => Promise<void>;
  startChat: (values: NewChatFormValues) => Promise<boolean>;
}

interface InboxSnapshot {
  inboxes: ApiInbox[];
  lastMessages: Record<string, ApiMessage | undefined>;
}

const byId = (messages: ApiMessage[], message: ApiMessage): boolean =>
  messages.some((existing) => existing.id === message.id);

const fetchInboxSnapshot = async (): Promise<InboxSnapshot> => {
  const inboxes = await fetchInboxes();
  const previews = await Promise.all(
    inboxes.map(async (inbox) => {
      const [latest] = await fetchMessages(inbox.id, PREVIEW_LIMIT);
      return [inbox.id, latest] as const;
    }),
  );

  return { inboxes, lastMessages: Object.fromEntries(previews) };
};

export const useChat = (meId: string): UseChatResult => {
  const [inboxes, setInboxes] = useState<ApiInbox[]>([]);
  const [lastMessages, setLastMessages] = useState<Record<string, ApiMessage | undefined>>({});
  const [isLoadingInboxes, setIsLoadingInboxes] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<ThreadState | null>(null);

  // Read inside async callbacks so a slow response for a chat the user already
  // left never overwrites the thread they are looking at now.
  const selectedRef = useRef<string | null>(null);
  // Polling would otherwise repeat the same failure toast every few seconds;
  // show it once and stay quiet until a request succeeds again.
  const errorShownRef = useRef(false);

  const reportError = useCallback((error: unknown) => {
    if (errorShownRef.current) return;
    errorShownRef.current = true;
    showToast.fromError(error);
  }, []);

  // State is only ever set in the promise callbacks below, never synchronously,
  // so the polling effects stay plain subscriptions to the API.
  const applyInboxes = useCallback((snapshot: InboxSnapshot) => {
    setInboxes(snapshot.inboxes);
    setLastMessages(snapshot.lastMessages);
    setIsLoadingInboxes(false);
    errorShownRef.current = false;
  }, []);

  const failInboxes = useCallback(
    (error: unknown) => {
      setIsLoadingInboxes(false);
      reportError(error);
    },
    [reportError],
  );

  const loadInboxes = useCallback(
    () => fetchInboxSnapshot().then(applyInboxes, failInboxes),
    [applyInboxes, failInboxes],
  );

  const loadThread = useCallback(
    (inboxId: string) =>
      fetchMessages(inboxId).then((newestFirst) => {
        if (selectedRef.current !== inboxId) return;

        setThread({ inboxId, messages: [...newestFirst].reverse() });
        errorShownRef.current = false;
      }, reportError),
    [reportError],
  );

  useEffect(() => {
    void loadInboxes();
    const timer = window.setInterval(() => void loadInboxes(), INBOX_POLL_MS);
    return () => window.clearInterval(timer);
  }, [loadInboxes]);

  useEffect(() => {
    if (!selectedId) return;

    void loadThread(selectedId);
    const timer = window.setInterval(() => void loadThread(selectedId), THREAD_POLL_MS);
    return () => window.clearInterval(timer);
  }, [selectedId, loadThread]);

  const select = useCallback((inboxId: string | null) => {
    selectedRef.current = inboxId;
    setSelectedId(inboxId);
  }, []);

  /** Shows a just-sent message right away instead of waiting for the next poll. */
  const applySent = useCallback((inboxId: string, message: ApiMessage) => {
    setLastMessages((current) => ({ ...current, [inboxId]: message }));
    setThread((current) =>
      current && current.inboxId === inboxId && !byId(current.messages, message)
        ? { inboxId, messages: [...current.messages, message] }
        : current,
    );
  }, []);

  const send = useCallback(
    async (text: string) => {
      const inboxId = selectedRef.current;
      if (!inboxId) return;

      try {
        const result = await sendMessage({ inboxId, content: text });
        applySent(result.inboxId, result.message);
      } catch (error) {
        showToast.fromError(error);
      }
    },
    [applySent],
  );

  const startChat = useCallback(
    async (values: NewChatFormValues): Promise<boolean> => {
      try {
        const result = await sendMessage({
          recipientId: values.recipientId,
          content: values.content,
        });

        // The inbox may be brand new, so the list has to be re-read before the
        // header can show who it is with.
        await loadInboxes();
        select(result.inboxId);
        applySent(result.inboxId, result.message);
        return true;
      } catch (error) {
        showToast.fromError(error);
        return false;
      }
    },
    [applySent, loadInboxes, select],
  );

  const conversations = useMemo(
    () =>
      [...inboxes]
        .sort((a, b) => activityOf(b, lastMessages[b.id]) - activityOf(a, lastMessages[a.id]))
        .map((inbox) => toConversation(inbox, meId, lastMessages[inbox.id])),
    [inboxes, lastMessages, meId],
  );

  const selectedInbox = inboxes.find((inbox) => inbox.id === selectedId);

  const messages = useMemo(() => {
    if (!thread || thread.inboxId !== selectedId) return [];
    const members = selectedInbox?.members ?? [];
    return thread.messages.map((message) => toMessage(message, meId, members));
  }, [thread, selectedId, selectedInbox, meId]);

  return {
    conversations,
    isLoadingInboxes,
    selectedId,
    selectedConversation: conversations.find((conversation) => conversation.id === selectedId),
    messages,
    // Derived rather than stored: the thread is loading until a response for
    // the selected inbox has arrived.
    isLoadingThread: selectedId !== null && thread?.inboxId !== selectedId,
    select,
    send,
    startChat,
  };
};

export default useChat;
