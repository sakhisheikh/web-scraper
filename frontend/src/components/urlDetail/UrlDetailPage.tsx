import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUrlDetail } from '../../api/urls';
import UrlDetailView from './UrlDetail';
import Loader from '../Loader';
import type { UrlDetail } from '../../types/urlDetail';
import Button from '../Button';

export default function UrlDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<UrlDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getUrlDetail(id)
      .then(setData)
      .catch((err: any) => setError(err.message || 'Failed to fetch URL details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBackToDashboard = () => {
    navigate('/');
  };

  if (loading) return <Loader text="Loading URL details..." />;
  if (error) return (
    <div className="text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
      {error}
    </div>
  );
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Back Button and Page Title */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          className="flex items-center gap-2 cursor-pointer"
          onClick={handleBackToDashboard}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">URL Analysis Details</h1>
      </div>

      {/* URL Details Content */}
      <UrlDetailView url={data} />
    </div>
  );
} 