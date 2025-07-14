import type { DashboardCard } from '../../types/dashboard';

export function useStatCards(): DashboardCard[] {
  return [
    { id: '1', title: 'Completed', value: '0', icon: '✅', color: 'green' },
    { id: '2', title: 'Queued', value: '0', icon: '⏳', color: 'yellow' },
    { id: '3', title: 'Running', value: '0', icon: '🏃', color: 'blue' },
    { id: '4', title: 'Errored', value: '0', icon: '❌', color: 'red' }
  ];
}
