import { DashboardApiError, ApiErrorPayload } from '../types/api';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://campus-pay-na3y.onrender.com'
).replace(/\/$/, '');

const API_ROOT = `${API_BASE_URL}/api/v1.0`;

export function getDashboardApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_ROOT}${cleanPath}`;
}

export function getDashboardToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('cp_dash_token');
}

export function setDashboardToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    sessionStorage.setItem('cp_dash_token', token);
  } else {
    sessionStorage.removeItem('cp_dash_token');
  }
}

function parseErrorMessage(data: unknown, status: number): string {
  if (typeof data === 'string' && data.trim()) return data.trim();
  if (!data || typeof data !== 'object') {
    if (status === 401) return 'Session expired or unauthorized. Please sign in.';
    if (status === 403) return 'You do not have permission to perform this administrative action.';
    if (status === 404) return 'The requested resource was not found.';
    if (status >= 500) return 'The server encountered an error. Please try again later.';
    return 'An unexpected error occurred. Please try again.';
  }

  const payload = data as ApiErrorPayload;
  const messages: string[] = [];

  if (payload.message) messages.push(payload.message);
  if (payload.title) messages.push(payload.title);
  if (payload.error) messages.push(payload.error);
  if (payload.detail) messages.push(payload.detail);

  if (payload.errors && typeof payload.errors === 'object') {
    Object.values(payload.errors).forEach((val) => {
      if (Array.isArray(val)) {
        val.forEach((item) => typeof item === 'string' && messages.push(item));
      } else if (typeof val === 'string') {
        messages.push(val);
      }
    });
  }

  const unique = [...new Set(messages.filter(Boolean))];
  if (unique.length > 0) return unique.join(' • ');

  if (status === 401) return 'Invalid credentials or expired session.';
  if (status === 403) return 'Access denied.';
  if (status === 404) return 'Resource not found.';
  if (status >= 500) return 'Server error. Please try again later.';
  return 'Request failed. Please verify your input and try again.';
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function dashboardApi<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, body, ...fetchOptions } = options;
  const isFormData = body instanceof FormData;
  
  const headers = new Headers(customHeaders);
  const token = getDashboardToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!isFormData && body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let fullUrl = getDashboardApiUrl(path);
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
      body,
    });
  } catch (err: any) {
    throw new DashboardApiError(
      err?.message ? `Network error: ${err.message}` : 'Unable to connect to the CampusPay server. Please check your internet connection.',
      0,
      err
    );
  }

  let rawData: unknown = null;
  const contentType = response.headers.get('content-type') || '';
  if (response.status !== 204) {
    try {
      if (contentType.includes('application/json') || contentType.includes('+json')) {
        rawData = await response.json();
      } else {
        rawData = await response.text();
      }
    } catch {
      rawData = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized: clear dashboard token
      setDashboardToken(null);
    }
    const errMsg = parseErrorMessage(rawData, response.status);
    throw new DashboardApiError(errMsg, response.status, rawData);
  }

  // If backend returns enveloped data e.g. { status: true, data: [...] }
  if (rawData && typeof rawData === 'object' && 'data' in rawData && rawData.data !== undefined) {
    return rawData.data as T;
  }

  return rawData as T;
}
