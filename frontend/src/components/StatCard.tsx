import React from 'react';
import type { DashboardCard } from '../types/dashboard';

interface StatCardProps {
  card: DashboardCard;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ card, className = '' }) => {
  const getChangeIcon = (changeType?: string) => {
    if (changeType === 'increase') return '↑';
    if (changeType === 'decrease') return '↓';
    return null;
  };

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 transition-shadow hover:shadow-md flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">{card.title}</span>
          <span className="text-2xl font-semibold text-gray-900 dark:text-white">{card.value}</span>
          {card.change && (
            <span className={`text-xs flex items-center gap-1 ${card.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}> 
              {getChangeIcon(card.changeType)} {Math.abs(card.change)}% <span className="text-gray-400">from last month</span>
            </span>
          )}
        </div>
        {card.icon && <span className="text-3xl opacity-60">{card.icon}</span>}
      </div>
    </div>
  );
};

export default StatCard; 