import { useState, useEffect, useCallback, useMemo } from 'react';
import type { UrlAnalysis } from '../../types/url';
import type { UrlItem } from '../table/RunningUrlsTable';
import { getUrls, addUrl, startUrls, stopUrls, deleteUrls } from '../../api/urls';
import { mapUrlAnalysisToUrlItem } from '../../utils/urlMappers';
import { useUrlStatusStream } from '../../hooks/useUrlStatusStream';

export function useDashboardUrls() {
  const [runningUrls, setRunningUrls] = useState<UrlAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrls = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUrls();
        setRunningUrls(Array.isArray(data.urls) ? data.urls : []);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchUrls();
  }, []);

  useUrlStatusStream(
    useCallback((updatedUrl: UrlAnalysis) => {
      setRunningUrls(urls =>
        urls.map(u => u.id === updatedUrl.id ? updatedUrl : u)
      );
    }, [])
  );

  const handleAddUrl = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const newUrl = await addUrl(url);
      setRunningUrls(urls => [...urls, newUrl]);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (ids: string[]) => {
    try {
      await startUrls(ids);
    } catch (err: any) {
      setError(err.message || 'Failed to start URLs');
      throw err;
    }
  };
  const handleStop = async (ids: string[]) => {
    try {
      await stopUrls(ids);
    } catch (err: any) {
      setError(err.message || 'Failed to stop URLs');
      throw err;
    }
  };
  const handleDelete = async (ids: string[]) => {
    try {
      await deleteUrls(ids);
      setRunningUrls(urls => urls.filter(u => !ids.includes(String(u.id))));
    } catch (err: any) {
      setError(err.message || 'Failed to delete URLs');
      throw err;
    }
  };
  const handleTableError = (msg: string) => setError(msg);

  const urlTableData: UrlItem[] = useMemo(() => runningUrls.map(mapUrlAnalysisToUrlItem), [runningUrls]);

  return {
    runningUrls,
    urlTableData,
    loading,
    error,
    setError,
    handleAddUrl,
    handleStart,
    handleStop,
    handleDelete,
    handleTableError,
    setRunningUrls,
  };
}
