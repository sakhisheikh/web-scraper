import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import Layout from './Layout';
import Loader from './Loader';
import RequireAuth from '../auth/RequireAuth';

const Dashboard = lazy(() => import('./Dashboard'));
const UrlDetailPage = lazy(() => import('./urlDetail/UrlDetailPage'));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<Loader text="Loading page..." />}> 
          <Routes>
            <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/urls/:id" element={<RequireAuth><UrlDetailPage /></RequireAuth>} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
} 