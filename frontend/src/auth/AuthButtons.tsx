import React from 'react';
import { useAuth } from './AuthContext';

const AuthButtons: React.FC = () => {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <button
        className="btn btn-primary"
        onClick={() => loginWithRedirect()}
      >
        Log In
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">{user?.email}</span>
      <button
        className="btn btn-secondary"
        onClick={() => logout()}
      >
        Log Out
      </button>
    </div>
  );
};

export default AuthButtons; 