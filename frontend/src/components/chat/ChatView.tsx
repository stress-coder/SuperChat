import { useMemo, useState } from 'react';
import ConversationPanel from '@/components/chat/ConversationPanel';
import EmptyConversation from '@/components/chat/EmptyConversation';
import InboxPanel from '@/components/chat/InboxPanel';
import { useChat } from '@/hooks/useChat';
import type { User } from '@/interfaces/user.interface';
import '@/assets/css/chat.css';

interface ChatViewProps {
  user: User | null;
  onLogout: () => Promise<void>;
}

/**
 * The whole /chat screen. Chat data comes from useChat; only the search term
 * and the logout spinner are local UI state.
 */
const ChatView = ({ user, onLogout }: ChatViewProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const {
    conversations,
    isLoadingInboxes,
    selectedId,
    selectedConversation,
    messages,
    isLoadingThread,
    select,
    send,
    startChat,
  } = useChat(user?.id ?? '');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await onLogout();
  };

  const visibleConversations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return conversations;

    return conversations.filter((conversation) => conversation.name.toLowerCase().includes(term));
  }, [conversations, searchTerm]);

  return (
    <div className={`chat${selectedConversation ? ' chat--thread-open' : ''}`}>
      <InboxPanel
        user={user}
        conversations={visibleConversations}
        isLoading={isLoadingInboxes}
        hasConversations={conversations.length > 0}
        selectedId={selectedId}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelect={select}
        onStartChat={startChat}
        onLogout={() => void handleLogout()}
        isLoggingOut={isLoggingOut}
      />

      <section className="chat__thread">
        {selectedConversation ? (
          <ConversationPanel
            conversation={selectedConversation}
            messages={messages}
            isLoading={isLoadingThread}
            onBack={() => select(null)}
            onSend={(text) => void send(text)}
          />
        ) : (
          <EmptyConversation />
        )}
      </section>
    </div>
  );
};

export default ChatView;
