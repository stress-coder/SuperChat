import { useState } from 'react';
import Button from '@/components/ui/Button';
import { logoutUser } from '@/store/actions/authActions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import '@/assets/css/chat.css';

/**
 * Placeholder landing spot after a successful sign-in — just enough to prove the
 * integration works end to end. The real chat UI replaces this.
 */
const ChatPage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Clearing auth state is what sends us back to /login — ProtectedRoute
  // redirects as soon as isAuthenticated flips. Failures surface as a toast
  // from logoutUser, so there is nothing to handle here.
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await dispatch(logoutUser());
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

export default ChatPage;
