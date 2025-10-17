import { clearTokenCookie, getTokenFromCookie } from './auth';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8008'; // <- match your backend port

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export async function api<T = any>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = getTokenFromCookie();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    let msg: string;
    try {
      const data = await res.json();
      msg =
        typeof data?.detail === 'string' ? data.detail : JSON.stringify(data);
    } catch {
      msg = await res.text();
    }

    if (typeof window !== 'undefined') {
      if (res.status === 401) {
        clearTokenCookie();
        const { pathname, search } = window.location;
        if (!pathname.startsWith('/login')) {
          const params = new URLSearchParams();
          const next = `${pathname}${search}`;
          if (next && next !== '/') {
            params.set('next', next);
          }
          const target = `/login${
            params.toString() ? `?${params.toString()}` : ''
          }`;
          if (window.location.href !== `${window.location.origin}${target}`) {
            window.location.href = target;
          }
        }
      } else if (res.status === 403) {
        if (window.location.pathname !== '/dashboard') {
          window.location.href = '/dashboard';
        }
      }
    }

    throw new ApiError(res.status, msg || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const swrFetcher =
  <T = any>() =>
  (url: string) =>
    api<T>(url);

export const post = <T = any>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) });

export const del = (path: string) => api<void>(path, { method: 'DELETE' });
