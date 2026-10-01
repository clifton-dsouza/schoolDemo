import { api } from './api';

interface Count { count: number }
interface Attendance extends Count { present: number | null }
interface Fees extends Count { outstandingCents: number }
export interface AdminDashboardSummary { students: Count; teachers: Count; attendance: Attendance; fees: Fees }

export const getAdminDashboardSummary = () => api<AdminDashboardSummary>('/api/dashboard/admin');
