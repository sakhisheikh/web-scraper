import React, { useCallback } from 'react';
import StatCard from './StatCard';
import UrlInput from './UrlInput';
import RunningUrlsTable from './table/RunningUrlsTable';
import Loader from './Loader';
import { useDashboardUrls } from './dashboard/useDashboardUrls';
import { useStatCards } from './dashboard/useStatCards';
import { useAuth } from '../auth/AuthContext';
import { addUrl, startUrls, stopUrls, deleteUrls } from '../api/urls';

const Dashboard: React.FC = () => {
  const {
    urlTableData,
    loading,
    error,
    setError,
    setRunningUrls,
    statCounts,
  } = useDashboardUrls();
  const { getAccessToken } = useAuth();
  const statCards = useStatCards(statCounts);

  console.log("RE render")


  const handleAddUrl = useCallback(async (url: string) => {
    setError(null);
    try {
      const token = await getAccessToken();
      const newUrl = await addUrl(url, token);
      setRunningUrls(urls => [...urls, newUrl]);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      throw err;
    }
  }, [getAccessToken, setError, setRunningUrls]);

  const handleStart = useCallback(async (ids: string[]) => {
    try {
      const token = await getAccessToken();
      await startUrls(ids, token);
    } catch (err: any) {
      setError(err.message || 'Failed to start URLs');
      throw err;
    }
  }, [getAccessToken, setError]);

  const handleStop = useCallback(async (ids: string[]) => {
    try {
      const token = await getAccessToken();
      await stopUrls(ids, token);
    } catch (err: any) {
      setError(err.message || 'Failed to stop URLs');
      throw err;
    }
  }, [getAccessToken, setError]);

  const handleDelete = useCallback(async (ids: string[]) => {
    try {
      const token = await getAccessToken();
      await deleteUrls(ids, token);
      setRunningUrls(urls => urls.filter(u => !ids.includes(String(u.id))));
    } catch (err: any) {
      setError(err.message || 'Failed to delete URLs');
      throw err;
    }
  }, [getAccessToken, setError, setRunningUrls]);

  const handleTableError = useCallback((msg: string) => setError(msg), [setError]);

  


  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.id} card={card} />
        ))}
      </div>
      <div className="flex flex-col gap-4 w-full h-[600px]">
        <h2 className="text-lg font-semibold mb-2">Add URLs for analysis</h2>
        <UrlInput onAdd={handleAddUrl} />
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader text="Loading URLs..." />
            </div>
          ) : (
            <RunningUrlsTable
              data={urlTableData}
              onStart={handleStart}
              onStop={handleStop}
              onDelete={handleDelete}
              onUpdate={() => {}}
              onError={handleTableError}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 