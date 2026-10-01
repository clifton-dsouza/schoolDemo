import { api } from './api';
import type { Role } from '../types/roles';
export interface Session { sub: string; role: Role; schoolId: string | null; branchId: string | null; exp: number }
export interface LoginUser { id: string; name: string; role: Role; schoolId: string | null; branchId: string | null }
export const login = (email: string, password: string) =>
  api<{ user: LoginUser }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const changePassword = (currentPassword: string, newPassword: string) =>
  api<null>('/api/auth/password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) });
export const logout = () => api<null>('/api/auth/logout', { method: 'POST' });
export const me = () => api<Session>('/api/auth/me');
