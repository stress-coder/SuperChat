import { ArrowLeft, Info, Phone, Video } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import IconButton from '@/components/ui/IconButton';
import type { Conversation } from '@/interfaces/conversation.interface';

interface ConversationHeaderProps {
  conversation: Conversation;
  /** Returns to the inbox on narrow screens; the button is hidden on wide ones. */
  onBack: () => void;
}

/** 'typing…' beats presence, and a group reports its size instead. */
const statusOf = (conversation: Conversation): { text: string; modifier: string } => {
  if (conversation.isTyping) return { text: 'typing…', modifier: ' conversation__status--typing' };
  if (conversation.isGroup)
    return { text: `${conversation.memberCount ?? 0} members`, modifier: '' };
  if (conversation.isOnline) return { text: 'Online', modifier: ' conversation__status--active' };
  return { text: 'Last seen recently', modifier: '' };
};

const ConversationHeader = ({ conversation, onBack }: ConversationHeaderProps) => {
  const status = statusOf(conversation);

  return (
    <header className="conversation__header">
      <span className="conversation__back">
        <IconButton icon={ArrowLeft} label="Back to chats" onClick={onBack} />
      </span>

      <span className="conversation__identity">
        <Avatar
          name={conversation.name}
          src={conversation.avatarUrl}
          isGroup={conversation.isGroup}
          isOnline={conversation.isOnline}
        />
        <span>
          <h2 className="conversation__name">{conversation.name}</h2>
          <span className={`conversation__status${status.modifier}`}>{status.text}</span>
        </span>
      </span>

      <span className="conversation__actions">
        <IconButton icon={Phone} label="Start a voice call" />
        <IconButton icon={Video} label="Start a video call" />
        <IconButton icon={Info} label="Conversation details" />
      </span>
    </header>
  );
};

export default ConversationHeader;
