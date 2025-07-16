import React from 'react';
import StatCard from './StatCard';
import UrlInput from './UrlInput';
import RunningUrlsTable from './table/RunningUrlsTable';
import Loader from './Loader';
import { useDashboardUrls } from './dashboard/useDashboardUrls';
import { useStatCards } from './dashboard/useStatCards';

const Dashboard: React.FC = () => {
  const {
    urlTableData,
    loading,
    error,
    setError,
    handleAddUrl,
    handleStart,
    handleStop,
    handleDelete,
    handleTableError,
    statCounts,
  } = useDashboardUrls();
  const statCards = useStatCards(statCounts);

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
        {loading && <Loader text="Loading URLs..." />}
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex-1 min-h-0">
          <RunningUrlsTable
            data={urlTableData}
            onStart={handleStart}
            onStop={handleStop}
            onDelete={handleDelete}
            onUpdate={() => {}}
            onError={handleTableError}
            bulkStartLabel="Re-run Analysis"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 