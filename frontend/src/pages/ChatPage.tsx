import ChatView from '@/components/chat/ChatView';
import { logoutUser } from '@/store/actions/authActions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const ChatPage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  // Clearing auth state is what sends us back to /login — ProtectedRoute
  // redirects as soon as isAuthenticated flips. Failures surface as a toast
  // from logoutUser, so there is nothing to handle here.
  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  return <ChatView user={user} onLogout={handleLogout} />;
};

export default ChatPage;
