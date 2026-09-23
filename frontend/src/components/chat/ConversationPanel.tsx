import ConversationHeader from '@/components/chat/ConversationHeader';
import MessageComposer from '@/components/chat/MessageComposer';
import MessageThread from '@/components/chat/MessageThread';
import type { Conversation } from '@/interfaces/conversation.interface';
import type { Message } from '@/interfaces/message.interface';

interface ConversationPanelProps {
  conversation: Conversation;
  messages: Message[];
  onBack: () => void;
  onSend: (text: string) => void;
}

/** The right-hand column: who you are talking to, the thread, and the composer. */
const ConversationPanel = ({ conversation, messages, onBack, onSend }: ConversationPanelProps) => {
  return (
    <>
      <ConversationHeader conversation={conversation} onBack={onBack} />
      <MessageThread
        messages={messages}
        isGroup={conversation.isGroup}
        isTyping={conversation.isTyping}
        partnerName={conversation.name}
        conversationId={conversation.id}
      />
      <MessageComposer key={conversation.id} onSend={onSend} />
    </>
  );
};

export default ConversationPanel;
