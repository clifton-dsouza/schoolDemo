import type { Role } from '../types/roles';

/** Local development identities only. The backend seed script stores PBKDF2 hashes in local D1. */
export const DEMO_ACCOUNTS: ReadonlyArray<{ label: string; email: string; password: string; role: Role }> = [
  { label: 'Super Admin Demo', email: 'superadmin@schoolos.demo', password: 'SuperAdmin@2026', role: 'platform_owner' },
  { label: 'Admin Demo', email: 'admin@schoolos.demo', password: 'Admin@2026', role: 'school_admin' },
  { label: 'Teacher Demo', email: 'teacher@schoolos.demo', password: 'Teacher@2026', role: 'teacher' },
  { label: 'Student Demo', email: 'student@schoolos.demo', password: 'Student@2026', role: 'student' },
];
