import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthProvider from '../auth/AuthProvider';

const OLD_ENV = { ...import.meta.env };

describe('AuthProvider', () => {
  afterEach(() => {
    // @ts-ignore
    import.meta.env = { ...OLD_ENV };
  });

  it('renders children if config is present', () => {
    // @ts-ignore
    import.meta.env = {
      ...OLD_ENV,
      VITE_AUTH0_DOMAIN: 'test-domain',
      VITE_AUTH0_CLIENT_ID: 'test-client-id',
      VITE_AUTH0_AUDIENCE: 'test-audience',
    };
    render(
      <AuthProvider>
        <div>App Content</div>
      </AuthProvider>
    );
    expect(screen.getByText('App Content')).toBeInTheDocument();
  });

  it('shows error if config is missing', () => {
    // @ts-ignore
    import.meta.env = { ...OLD_ENV, VITE_AUTH0_DOMAIN: '', VITE_AUTH0_CLIENT_ID: '', VITE_AUTH0_AUDIENCE: '' };
    render(
      <AuthProvider>
        <div>App Content</div>
      </AuthProvider>
    );
    expect(screen.getByText(/Talaash is currently down/i)).toBeInTheDocument();
    expect(screen.queryByText('App Content')).not.toBeInTheDocument();
  });
}); 