import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

interface AuthProviderProps {
  children: React.ReactNode;
}

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  if (!domain || !clientId || !audience) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-red-200 rounded-lg p-8 shadow max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Talaash is currently down</h2>
          <p className="text-gray-700 mb-2">We’re unable to load the application at this time.</p>
          <p className="text-gray-500 text-sm mb-4">
            Please try again later. If the problem persists, contact support.
          </p>
        </div>
      </div>
    );
  }
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience,
      }}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider; 