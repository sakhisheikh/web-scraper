import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './Dashboard';
import UrlDetailPage from './urlDetail/UrlDetailPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/urls/:id" element={<UrlDetailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
} 