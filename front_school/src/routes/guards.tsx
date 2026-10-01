import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types/roles';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin text-indigo-600" aria-label="Loading" /></div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
export function RoleGuard({ roles }: { roles: Role[] }) {
  const { user } = useAuth();
  return user && roles.includes(user.role) ? <Outlet /> : <Navigate to="/unauthorized" replace />;
}
