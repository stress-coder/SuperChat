import ConversationHeader from '@/components/chat/ConversationHeader';
import MessageComposer from '@/components/chat/MessageComposer';
import MessageThread from '@/components/chat/MessageThread';
import Loader from '@/components/ui/Loader';
import type { Conversation } from '@/interfaces/conversation.interface';
import type { Message } from '@/interfaces/message.interface';

interface ConversationPanelProps {
  conversation: Conversation;
  messages: Message[];
  isLoading: boolean;
  onBack: () => void;
  onSend: (text: string) => void;
}

const ConversationPanel = ({
  conversation,
  messages,
  isLoading,
  onBack,
  onSend,
}: ConversationPanelProps) => {
  return (
    <>
      <ConversationHeader conversation={conversation} onBack={onBack} />
      {isLoading ? (
        <div className="thread">
          <Loader />
        </div>
      ) : (
        <MessageThread
          messages={messages}
          isGroup={conversation.isGroup}
          isTyping={conversation.isTyping}
          partnerName={conversation.name}
          conversationId={conversation.id}
        />
      )}
      <MessageComposer key={conversation.id} onSend={onSend} />
    </>
  );
};

export default ConversationPanel;
