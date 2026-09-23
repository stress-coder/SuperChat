import { MessagesSquare } from 'lucide-react';

/** Fills the thread column on wide screens until a conversation is picked. */
const EmptyConversation = () => {
  return (
    <div className="chat-empty">
      <MessagesSquare className="chat-empty__icon" aria-hidden="true" />
      <h2 className="chat-empty__title">Select a chat to start messaging</h2>
      <p className="chat-empty__text">
        Pick a conversation from the list, or search for someone you have not talked to yet.
      </p>
    </div>
  );
};

export default EmptyConversation;
