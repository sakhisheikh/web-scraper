import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import UrlDetailPage from './urlDetail/UrlDetailPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/urls/:id" element={<UrlDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
} 