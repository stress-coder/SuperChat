import { useState } from 'react';
import Button from '@/components/ui/Button';
import type { User } from '@/interfaces/user.interface';
import '@/assets/css/chat.css';

interface ChatViewProps {
  user: User | null;
  onLogout: () => Promise<void>;
}

/**
 * Placeholder landing spot after a successful sign-in — just enough to prove the
 * integration works end to end. The real chat UI replaces this.
 */
const ChatView = ({ user, onLogout }: ChatViewProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await onLogout();
  };

  return (
    <div className="chat-demo">
      <h1 className="chat-demo__title">Successfully loging</h1>

      {user && (
        <p className="chat-demo__user">
          Signed in as <span className="chat-demo__email">{user.name}</span> (@{user.username})
        </p>
      )}

      <div className="chat-demo__actions">
        <Button type="button" onClick={() => void handleLogout()} isLoading={isLoggingOut}>
          Log out
        </Button>
      </div>
    </div>
  );
};

export default ChatView;
