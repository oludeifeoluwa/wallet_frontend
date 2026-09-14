import { dashboardApi } from './client';
import { CreateSchoolAdminDto, BankDto } from '../types/auth';

export const adminApi = {
  async createSchoolAdmin(dto: CreateSchoolAdminDto): Promise<any> {
    return dashboardApi('/Admin/Create-SchoolAdmin', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async deleteAdmin(id: string): Promise<any> {
    return dashboardApi(`/Admin/delete/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async getBanks(): Promise<BankDto[]> {
    const res = await dashboardApi<any>('/Admin/banks', { method: 'GET' });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },
};
