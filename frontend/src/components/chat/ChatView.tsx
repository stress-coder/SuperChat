import { useMemo, useState } from 'react';
import ConversationPanel from '@/components/chat/ConversationPanel';
import EmptyConversation from '@/components/chat/EmptyConversation';
import InboxPanel from '@/components/chat/InboxPanel';
import type { Message } from '@/interfaces/message.interface';
import type { User } from '@/interfaces/user.interface';
import { mockConversations, mockMessages } from '@/mocks/chat.mock';
import '@/assets/css/chat.css';

interface ChatViewProps {
  user: User | null;
  onLogout: () => Promise<void>;
}

/**
 * The whole /chat screen. Selection, search and the draft thread are held here
 * as local state on top of the sample data — nothing talks to the API yet, so
 * this is the one place a real chat store has to replace when it arrives.
 */
const ChatView = ({ user, onLogout }: ChatViewProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await onLogout();
  };

  const visibleConversations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return mockConversations;

    return mockConversations.filter((conversation) =>
      conversation.name.toLowerCase().includes(term),
    );
  }, [searchTerm]);

  const selectedConversation = mockConversations.find(
    (conversation) => conversation.id === selectedId,
  );

  const threadMessages = useMemo(
    () => messages.filter((message) => message.conversationId === selectedId),
    [messages, selectedId],
  );

  // Appending locally is what makes the composer feel real until the socket lands.
  const handleSend = (text: string) => {
    if (!selectedConversation) return;

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setMessages((current) => [
      ...current,
      {
        id: `local-${now.getTime()}`,
        conversationId: selectedConversation.id,
        senderName: user?.name ?? 'You',
        isOwn: true,
        kind: 'text',
        text,
        time,
        status: 'sent',
        dayLabel: 'Today',
      },
    ]);
  };

  return (
    <div className={`chat${selectedConversation ? ' chat--thread-open' : ''}`}>
      <InboxPanel
        user={user}
        conversations={visibleConversations}
        selectedId={selectedId}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelect={setSelectedId}
        onLogout={() => void handleLogout()}
        isLoggingOut={isLoggingOut}
      />

      <section className="chat__thread">
        {selectedConversation ? (
          <ConversationPanel
            conversation={selectedConversation}
            messages={threadMessages}
            onBack={() => setSelectedId(null)}
            onSend={handleSend}
          />
        ) : (
          <EmptyConversation />
        )}
      </section>
    </div>
  );
};

export default ChatView;
