import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/Router';
import './index.css';
import RequireAuth from './auth/RequireAuth';
import { AuthProvider } from './auth/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <AuthProvider>
      <App />
    </AuthProvider>
);
