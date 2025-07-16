import React from 'react';
import Loader from '../components/Loader';
import { useAuth } from './AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth();

  console.log("requireAuth")

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading || !isAuthenticated) {
    return <Loader text="Checking authentication..." />;
  }

  return <>{children}</>;
};

export default RequireAuth; 