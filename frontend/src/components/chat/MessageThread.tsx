import { Fragment, useEffect, useRef } from 'react';
import DateSeparator from '@/components/chat/DateSeparator';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import type { Message } from '@/interfaces/message.interface';

interface MessageThreadProps {
  messages: Message[];
  /** Group threads label every incoming bubble with its sender. */
  isGroup: boolean;
  isTyping: boolean;
  /** Who the dots belong to, and what resets the scroll position. */
  partnerName: string;
  conversationId: string;
}

const MessageThread = ({
  messages,
  isGroup,
  isTyping,
  partnerName,
  conversationId,
}: MessageThreadProps) => {
  const endRef = useRef<HTMLDivElement>(null);

  // Jump to the newest message when the thread opens and whenever one arrives.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [conversationId, messages.length, isTyping]);

  return (
    <div className="thread" role="log" aria-label={`Conversation with ${partnerName}`}>
      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const startsNewDay = previous?.dayLabel !== message.dayLabel;
        // Repeat the name only when the speaker changes, the way every chat app does.
        const startsNewSpeaker = startsNewDay || previous?.senderName !== message.senderName;

        return (
          <Fragment key={message.id}>
            {startsNewDay && <DateSeparator label={message.dayLabel} />}
            <MessageBubble
              message={message}
              showSender={isGroup && !message.isOwn && startsNewSpeaker}
            />
          </Fragment>
        );
      })}

      {isTyping && <TypingIndicator name={partnerName} />}

      <div ref={endRef} />
    </div>
  );
};

export default MessageThread;
