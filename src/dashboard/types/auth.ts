import { DashboardRole } from './api';
export type { DashboardRole };

export interface AdminLoginRequestDto {
  email: string;
  password: string;
}

export interface CreateSchoolAdminDto {
  firstname?: string;
  lastname: string;
  schoolCode: string;
  email: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface DashboardUser {
  id?: string;
  userId?: string;
  email: string;
  firstname?: string;
  lastname?: string;
  name?: string;
  role: DashboardRole;
  schoolCode?: string;
  schoolName?: string;
  walletNumber?: string;
  token?: string;
}

export interface LoginResponseDto {
  token: string;
  refreshToken?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  role?: string;
  schoolCode?: string;
  walletNumber?: string;
  userId?: string;
  id?: string;
}

export interface BankDto {
  id: number | string;
  name: string;
  slug?: string;
  code: string;
  longcode?: string;
  active?: boolean;
  country?: string;
  currency?: string;
  type?: string;
  supports_transfer?: boolean;
}
