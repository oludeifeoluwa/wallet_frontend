import { dashboardApi, setDashboardToken } from './client';
import {
  AdminLoginRequestDto,
  ChangePasswordDto,
  DashboardRole,
  DashboardUser,
  LoginResponseDto,
} from '../types/auth';

export const authApi = {
  async adminLogin(payload: AdminLoginRequestDto): Promise<LoginResponseDto> {
    const res = await dashboardApi<LoginResponseDto>('/Admin/login', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email.trim(),
        password: payload.password,
      }),
    });
    if (res?.token) {
      setDashboardToken(res.token);
    }
    return res;
  },

  async schoolAdminLogin(payload: AdminLoginRequestDto): Promise<LoginResponseDto> {
    const res = await dashboardApi<LoginResponseDto>('/SchoolAdmin/login', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email.trim(),
        password: payload.password,
      }),
    });
    if (res?.token) {
      setDashboardToken(res.token);
    }
    return res;
  },

  async getAdminProfile(): Promise<DashboardUser> {
    const profile = await dashboardApi<any>('/Admin/profile', { method: 'GET' });
    return {
      id: profile?.id || profile?.userId,
      email: profile?.email || '',
      firstname: profile?.firstname || 'CampusPay',
      lastname: profile?.lastname || 'Administrator',
      role: 'Admin',
      walletNumber: profile?.walletNumber,
    };
  },

  async getSchoolAdminProfile(): Promise<DashboardUser> {
    const profile = await dashboardApi<any>('/SchoolAdmin/profile', { method: 'GET' });
    return {
      id: profile?.id || profile?.userId,
      email: profile?.email || '',
      firstname: profile?.firstname || 'School',
      lastname: profile?.lastname || 'Administrator',
      role: 'SchoolAdmin',
      schoolCode: profile?.schoolCode,
      schoolName: profile?.schoolName,
      walletNumber: profile?.walletNumber,
    };
  },

  async changePassword(payload: ChangePasswordDto): Promise<any> {
    return dashboardApi('/Account/change_password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async logout(): Promise<void> {
    try {
      await dashboardApi('/Account/logout', { method: 'POST' });
    } catch {
      // If token expired, proceed with local logout
    } finally {
      setDashboardToken(null);
      sessionStorage.removeItem('cp_dash_user');
      sessionStorage.removeItem('cp_dash_role');
    }
  },
};
