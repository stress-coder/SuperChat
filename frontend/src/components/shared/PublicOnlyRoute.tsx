import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

interface PublicOnlyRouteProps {
  children: ReactNode;
}

/** Keeps signed-in users off /login and /register. */
const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
