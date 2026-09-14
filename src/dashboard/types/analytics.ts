export interface SystemDashboardDto {
  totalWallets?: number;
  totalSchools?: number;
  totalStudents?: number;
  totalMerchants?: number;
  totalTransactions?: number;
  totalVolume?: number;
  totalInflow?: number;
  totalOutflow?: number;
  successfulTransactions?: number;
  pendingTransactions?: number;
  failedTransactions?: number;
  activeUsers?: number;
  dailyTransactions?: Array<{ date: string; count: number; volume: number }>;
  recentTransactions?: any[];
  [key: string]: unknown;
}

export interface SchoolDashboardDto {
  schoolName?: string;
  schoolCode?: string;
  totalStudents?: number;
  totalMerchants?: number;
  pendingMerchantApprovals?: number;
  totalWallets?: number;
  totalTransactions?: number;
  totalVolume?: number;
  schoolWalletBalance?: number;
  recentTransactions?: any[];
  [key: string]: unknown;
}
