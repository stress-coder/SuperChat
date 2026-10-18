import { useState } from 'react';
import { LogOut, SquarePen, X } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import IconButton from '@/components/ui/IconButton';
import Loader from '@/components/ui/Loader';
import ConversationItem from '@/components/chat/ConversationItem';
import InboxSearch from '@/components/chat/InboxSearch';
import NewChatForm from '@/components/chat/NewChatForm';
import type { Conversation } from '@/interfaces/conversation.interface';
import type { User } from '@/interfaces/user.interface';
import type { NewChatFormValues } from '@/validations/newChat.validation';

interface InboxPanelProps {
  user: User | null;
  conversations: Conversation[];
  isLoading: boolean;
  hasConversations: boolean;
  selectedId: string | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onStartChat: (values: NewChatFormValues) => Promise<boolean>;
  onLogout: () => void;
  isLoggingOut: boolean;
}

const InboxPanel = ({
  user,
  conversations,
  isLoading,
  hasConversations,
  selectedId,
  searchTerm,
  onSearchChange,
  onSelect,
  onStartChat,
  onLogout,
  isLoggingOut,
}: InboxPanelProps) => {
  const [isComposing, setIsComposing] = useState(false);

  const renderList = () => {
    if (isLoading) return <Loader />;
    if (!hasConversations) return <p className="inbox__empty">No chats yet. Start one above.</p>;
    if (conversations.length === 0)
      return <p className="inbox__empty">No chats match that search.</p>;

    return (
      <ul className="inbox__list">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </ul>
    );
  };

  return (
    <aside className="chat__inbox" aria-label="Conversations">
      <div className="inbox__header">
        <span className="inbox__identity">
          <Avatar name={user?.name ?? 'You'} size="sm" />
          <span>
            <h1 className="inbox__title">Chats</h1>
            {user && <span className="inbox__user">@{user.username}</span>}
          </span>
        </span>

        <IconButton
          icon={isComposing ? X : SquarePen}
          label={isComposing ? 'Close new chat' : 'New chat'}
          onClick={() => setIsComposing((open) => !open)}
          aria-expanded={isComposing}
        />

        <IconButton
          icon={LogOut}
          label="Log out"
          onClick={onLogout}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
        />
      </div>

      {isComposing && <NewChatForm onSubmit={onStartChat} onDone={() => setIsComposing(false)} />}

      <InboxSearch value={searchTerm} onChange={onSearchChange} />

      {renderList()}
    </aside>
  );
};

export default InboxPanel;
