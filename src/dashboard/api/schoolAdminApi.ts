import { dashboardApi } from './client';
import { CreateSchoolAdminDto, BankDto } from '../types/auth';
import { MerchantDto } from '../types/merchant';
import { StudentDto } from '../types/student';

export const schoolAdminApi = {
  async createSchoolAdmin(dto: CreateSchoolAdminDto): Promise<any> {
    return dashboardApi('/SchoolAdmin/Create-SchoolAdmin', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async getMerchants(): Promise<MerchantDto[]> {
    const res = await dashboardApi<MerchantDto[]>('/SchoolAdmin/merchants', { method: 'GET' });
    return Array.isArray(res) ? res : [];
  },

  async approveMerchant(merchantId: string): Promise<any> {
    return dashboardApi('/SchoolAdmin/ApproveMerchant', {
      method: 'POST',
      params: { merchantId },
    });
  },

  async rejectMerchant(merchantId: string): Promise<any> {
    return dashboardApi('/SchoolAdmin/RejectMerchant', {
      method: 'POST',
      params: { merchantId },
    });
  },

  async getStudents(): Promise<StudentDto[]> {
    const res = await dashboardApi<StudentDto[]>('/SchoolAdmin/students', { method: 'GET' });
    return Array.isArray(res) ? res : [];
  },

  async getBanks(): Promise<BankDto[]> {
    const res = await dashboardApi<any>('/SchoolAdmin/banks', { method: 'GET' });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },
};
