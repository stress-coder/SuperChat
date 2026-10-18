import { Check, CheckCheck } from 'lucide-react';
import type { Message } from '@/interfaces/message.interface';

interface MessageBubbleProps {
  message: Message;
  /** Incoming group messages are the only ones that need a sender name. */
  showSender: boolean;
}

const MessageBubble = ({ message, showSender }: MessageBubbleProps) => {
  const { isOwn, kind, text, imageUrl, senderName, time, status } = message;
  const Tick = status === 'sent' ? Check : CheckCheck;

  return (
    <div
      className={`bubble bubble--${isOwn ? 'sent' : 'received'}${kind === 'image' ? ' bubble--image' : ''}`}
    >
      {showSender && <span className="bubble__sender">{senderName}</span>}

      {kind === 'image' && imageUrl ? (
        <img className="bubble__image" src={imageUrl} alt={`Photo from ${senderName}`} />
      ) : (
        <span className="bubble__text">{text}</span>
      )}

      <span className="bubble__meta">
        <span>{time}</span>
        {isOwn && (
          <Tick
            className={`bubble__tick${status === 'read' ? ' bubble__tick--read' : ''}`}
            aria-label={status}
          />
        )}
      </span>
    </div>
  );
};

export default MessageBubble;
