export type DashboardRole = 'Admin' | 'SchoolAdmin';

export interface ApiResponse<T = unknown> {
  status?: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

export interface ApiErrorPayload {
  message?: string;
  title?: string;
  error?: string;
  detail?: string;
  errors?: Record<string, string[] | string>;
}

export class DashboardApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'DashboardApiError';
    this.status = status;
    this.details = details;
  }
}
