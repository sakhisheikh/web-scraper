import React, { createContext, useContext } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithRedirect: () => void;
  logout: () => void;
  user: any;
  getAccessToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  if (isMock) {
    const mockValue: AuthContextType = {
      isAuthenticated: true,
      isLoading: false,
      loginWithRedirect: () => {},
      logout: () => {},
      user: { email: 'mock@user.com' },
      getAccessToken: async () => undefined,
    };
    return <AuthContext.Provider value={mockValue}>{children}</AuthContext.Provider>;
  }

  if (!domain || !clientId || !audience) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-red-200 rounded-lg p-8 shadow max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Talaash is currently down</h2>
          <p className="text-gray-700 mb-2">Auth0 configuration is missing.</p>
          <p className="text-gray-500 text-sm mb-4">
            Please check your environment variables and try again.
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
        audience: audience,
      }}
    >
      <AuthContextBridge>{children}</AuthContextBridge>
    </Auth0Provider>
  );
};

// Bridge Auth0 context to our own
const AuthContextBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user, getAccessTokenSilently } = useAuth0();
  const getAccessToken = async () => {
    try {
      return await getAccessTokenSilently();
    } catch {
      return undefined;
    }
  };
  const value: AuthContextType = { isAuthenticated, isLoading, loginWithRedirect, logout, user, getAccessToken };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 