import type { DashboardCard } from '../../types/dashboard';

export function useStatCards(statCounts: { completed: number; queued: number; running: number; errored: number }): DashboardCard[] {
  return [
    { id: '1', title: 'Completed', value: statCounts.completed, icon: '✅', color: 'green' },
    { id: '2', title: 'Queued', value: statCounts.queued, icon: '⏳', color: 'yellow' },
    { id: '3', title: 'Running', value: statCounts.running, icon: '🏃', color: 'blue' },
    { id: '4', title: 'Errored', value: statCounts.errored, icon: '❌', color: 'red' }
  ];
}
