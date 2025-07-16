import React from 'react';
import { useAuth } from './AuthContext';
import Button from '../components/Button';

const AuthButtons: React.FC = () => {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <Button
        variant="primary"
        className="cursor-pointer"
        onClick={() => loginWithRedirect()}
      >
        Log In
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">{user?.email}</span>
      <Button
        variant="secondary"
        className="cursor-pointer"
        onClick={() => logout()}
      >
        Log Out
      </Button>
    </div>
  );
};

export default AuthButtons; 