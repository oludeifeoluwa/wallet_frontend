import { dashboardApi } from './client';
import { SchoolDto, SchoolRequestDto, SchoolUpdateDto, SchoolUserDto } from '../types/school';

export const schoolApi = {
  async getAllSchools(): Promise<SchoolDto[]> {
    const res = await dashboardApi<SchoolDto[]>('/School', { method: 'GET' });
    return Array.isArray(res) ? res : [];
  },

  async getSchoolByCode(code: string): Promise<SchoolDto> {
    return dashboardApi<SchoolDto>(`/School/Code/${encodeURIComponent(code)}`, { method: 'GET' });
  },

  async getSchoolById(schoolId: string): Promise<SchoolDto> {
    return dashboardApi<SchoolDto>(`/School/ID/${encodeURIComponent(schoolId)}`, { method: 'GET' });
  },

  async createSchool(dto: SchoolRequestDto): Promise<SchoolDto> {
    return dashboardApi<SchoolDto>('/School/Add', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async updateSchool(schoolId: string, dto: SchoolUpdateDto): Promise<SchoolDto> {
    return dashboardApi<SchoolDto>(`/School/Update/${encodeURIComponent(schoolId)}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  async deleteSchool(schoolId: string): Promise<any> {
    return dashboardApi(`/School/Delete/${encodeURIComponent(schoolId)}`, {
      method: 'DELETE',
    });
  },

  async getSchoolUsers(): Promise<SchoolUserDto[]> {
    const res = await dashboardApi<SchoolUserDto[]>('/School/Users', { method: 'GET' });
    return Array.isArray(res) ? res : [];
  },
};
