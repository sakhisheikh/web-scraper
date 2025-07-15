import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AuthButtons: React.FC = () => {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => loginWithRedirect()}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 font-medium"
      >
        Log In
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {user?.picture && (
        <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full border" />
      )}
      <span className="text-gray-700 font-medium">{user?.name || user?.email}</span>
      <button
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200 font-medium"
      >
        Log Out
      </button>
    </div>
  );
};

export default AuthButtons; 