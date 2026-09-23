import { LogOut } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import IconButton from '@/components/ui/IconButton';
import ConversationItem from '@/components/chat/ConversationItem';
import InboxSearch from '@/components/chat/InboxSearch';
import type { Conversation } from '@/interfaces/conversation.interface';
import type { User } from '@/interfaces/user.interface';

interface InboxPanelProps {
  user: User | null;
  conversations: Conversation[];
  selectedId: string | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

const InboxPanel = ({
  user,
  conversations,
  selectedId,
  searchTerm,
  onSearchChange,
  onSelect,
  onLogout,
  isLoggingOut,
}: InboxPanelProps) => {
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
          icon={LogOut}
          label="Log out"
          onClick={onLogout}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
        />
      </div>

      <InboxSearch value={searchTerm} onChange={onSearchChange} />

      {conversations.length === 0 ? (
        <p className="inbox__empty">No chats match that search.</p>
      ) : (
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
      )}
    </aside>
  );
};

export default InboxPanel;
