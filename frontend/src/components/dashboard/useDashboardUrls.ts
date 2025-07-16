import { useState, useEffect, useCallback, useMemo } from 'react';
import type { UrlAnalysis } from '../../types/url';
import type { UrlItem } from '../table/RunningUrlsTable';
import { getUrls, addUrl, startUrls, stopUrls, deleteUrls } from '../../api/urls';
import { mapUrlAnalysisToUrlItem } from '../../utils/urlMappers';
import { useUrlStatusStream } from '../../hooks/useUrlStatusStream';
import { useAuth } from '../../auth/AuthContext';

export function useDashboardUrls() {
  const [runningUrls, setRunningUrls] = useState<UrlAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAccessToken } = useAuth();

  useEffect(() => {
    const fetchUrls = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        const data = await getUrls(token);
        setRunningUrls(Array.isArray(data.urls) ? data.urls : []);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchUrls();
  }, []);
  const handleUrlUpdate = useCallback((updatedUrl: UrlAnalysis) => {
    setRunningUrls(urls =>
      urls.map(u => u.id === updatedUrl.id ? updatedUrl : u)
    );
  }, []);

  // useUrlStatusStream(handleUrlUpdate);

  const urlTableData: UrlItem[] = useMemo(() => runningUrls.map(mapUrlAnalysisToUrlItem), [runningUrls]);

  // Real-time StatCard counts
  const statCounts = useMemo(() => {
    let completed = 0, queued = 0, running = 0, errored = 0;
    for (const url of runningUrls) {
      switch (url.status) {
        case 'done': completed++; break;
        case 'queued': queued++; break;
        case 'running': running++; break;
        case 'error': errored++; break;
        case 'errored': errored++; break;
        case 'stopped': break; // Optionally handle stopped
      }
    }
    return { completed, queued, running, errored };
  }, [runningUrls]);

  return {
    runningUrls,
    urlTableData,
    loading,
    error,
    setError,
    setRunningUrls,
    statCounts,
  };
}
