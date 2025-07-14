export interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

export interface ActivityItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  user?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  growthRate: number;
} 