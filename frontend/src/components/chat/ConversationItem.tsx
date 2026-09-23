import Avatar from '@/components/ui/Avatar';
import type { Conversation } from '@/interfaces/conversation.interface';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
}

const ConversationItem = ({ conversation, isActive, onSelect }: ConversationItemProps) => {
  const { id, name, avatarUrl, isGroup, isOnline, lastMessage, lastMessageTime, unreadCount } =
    conversation;

  return (
    <li>
      <button
        type="button"
        className={`conversation-item${isActive ? ' conversation-item--active' : ''}`}
        onClick={() => onSelect(id)}
        aria-current={isActive}
      >
        <Avatar name={name} src={avatarUrl} isGroup={isGroup} isOnline={isOnline} />

        <span className="conversation-item__body">
          <span className="conversation-item__top">
            <span className="conversation-item__name">{name}</span>
            <span className="conversation-item__time">{lastMessageTime}</span>
          </span>

          <span className="conversation-item__bottom">
            <span
              className={`conversation-item__preview${conversation.isTyping ? ' conversation-item__preview--typing' : ''}`}
            >
              {conversation.isTyping ? 'typing…' : lastMessage}
            </span>
            {unreadCount > 0 && (
              <span className="conversation-item__badge" aria-label={`${unreadCount} unread`}>
                {unreadCount}
              </span>
            )}
          </span>
        </span>
      </button>
    </li>
  );
};

export default ConversationItem;
