import { dashboardApi } from './client';
import { SystemDashboardDto, SchoolDashboardDto } from '../types/analytics';

export const analyticsApi = {
  async getSystemDashboard(): Promise<SystemDashboardDto> {
    const res = await dashboardApi<SystemDashboardDto>('/analytics/system/dashboard', { method: 'GET' });
    return res || {};
  },

  async getSchoolDashboard(): Promise<SchoolDashboardDto> {
    const res = await dashboardApi<SchoolDashboardDto>('/analytics/school/dashboard', { method: 'GET' });
    return res || {};
  },
};
