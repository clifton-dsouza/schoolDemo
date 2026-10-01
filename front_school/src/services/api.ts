const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787').replace(/\/$/, '');
export class ApiError extends Error {
  constructor(public status: number, message: string, public errors: Record<string, string> = {}) { super(message); }
}
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: () => void) => { onUnauthorized = fn; };
const FALLBACK: Record<number, string> = {
  400: 'The request was invalid.', 401: 'Incorrect email or password.', 403: 'You do not have permission to access this area.', 404: 'That could not be found.', 500: 'Something went wrong on the server.',
};
interface Envelope<T> { success: boolean; data: T; message: string; errors?: Record<string, string> }
/** Backend contract: { success, data, message } on success, { success:false, message, errors } on failure. Auth is the HttpOnly sos_session cookie. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...init.headers } });
  } catch {
    throw new ApiError(0, 'Unable to connect to the SchoolOS server.');
  }
  const body = (await res.json().catch(() => null)) as Envelope<T> | null;
  if (!res.ok || !body?.success) {
    if (res.status === 401 && !path.includes('/auth/login')) onUnauthorized?.();
    const message = res.status === 401 ? 'Incorrect email or password.'
      : res.status === 403 ? 'You do not have permission to access this area.'
      : res.status >= 500 ? 'Something went wrong on the server.'
      : body?.message ?? FALLBACK[res.status] ?? 'Something went wrong.';
    throw new ApiError(res.status, message, body?.errors);
  }
  return body.data;
}
