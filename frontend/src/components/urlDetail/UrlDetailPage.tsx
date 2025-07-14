import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUrlDetail } from '../../api/urls';
import UrlDetailView from './UrlDetail';
import type { UrlDetail } from '../../types/urlDetail';

export default function UrlDetailPage() {
  const { id } = useParams<{ id: string }>();
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
      .finally(() => setLoading(false)); // <-- Always set loading to false
  }, [id]);

  if (loading) return <div className="p-8 text-blue-600">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <UrlDetailView url={data} />
    </div>
  );
} 