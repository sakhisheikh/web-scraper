import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Loader from '../components/Loader';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

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