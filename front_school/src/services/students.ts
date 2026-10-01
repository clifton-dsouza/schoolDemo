import { api } from './api';
export interface Student {
  id: string; admission_no: string; first_name: string; last_name: string;
  class_id: string | null; section_id: string | null; guardian_name: string | null; guardian_phone: string | null;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
}
export const listStudents = (p: { page: number; pageSize: number; q: string }) =>
  api<{ items: Student[]; page: number; pageSize: number; total: number }>(
    `/api/students?${new URLSearchParams({ page: String(p.page), pageSize: String(p.pageSize), q: p.q })}`);
