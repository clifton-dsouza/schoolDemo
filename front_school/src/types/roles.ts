export type Role = 'platform_owner' | 'school_admin' | 'branch_admin' | 'teacher' | 'accountant' | 'student' | 'parent' | 'driver';
export const ROLE_LABEL: Record<Role, string> = {
  platform_owner: 'Platform owner', school_admin: 'School admin', branch_admin: 'Branch admin', teacher: 'Teacher',
  accountant: 'Accountant', student: 'Student', parent: 'Parent', driver: 'Driver',
};
export const ALL_ROLES = Object.keys(ROLE_LABEL) as Role[];
/** Roles the backend allows on GET /api/students (PERMISSIONS['students:read']). */
export const STUDENT_READERS: Role[] = ['school_admin', 'branch_admin', 'teacher', 'accountant', 'parent'];
export const ADMIN_PANEL_ROLES: Role[] = ['school_admin', 'branch_admin', 'accountant'];
export const dashboardPath = (role: Role) => {
  if (role === 'platform_owner') return '/superadmin/dashboard';
  if (role === 'teacher') return '/teacher/dashboard';
  if (role === 'student') return '/student/dashboard';
  if (role === 'parent') return '/parent/dashboard';
  return '/app/dashboard';
};
