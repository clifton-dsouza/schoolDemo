import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as auth from '../services/auth';
import { setUnauthorizedHandler } from '../services/api';
import type { Role } from '../types/roles';

export interface User { name: string | null; role: Role; schoolId: string | null; branchId: string | null }
interface Ctx { user: User | null; loading: boolean; signIn: (email: string, password: string) => Promise<Role>; signOut: () => Promise<void> }
const AuthContext = createContext<Ctx | null>(null);
const NAME_KEY = 'sos_display_name'; // display name only; the session itself lives in the HttpOnly cookie

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => { setUser(null); qc.clear(); });
    auth.me()
      .then((s) => setUser({ name: localStorage.getItem(NAME_KEY), role: s.role, schoolId: s.schoolId, branchId: s.branchId }))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [qc]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { user: u } = await auth.login(email, password);
    if (u.role === 'platform_owner') sessionStorage.removeItem('schoolos_super_admin_2fa_ui');
    localStorage.setItem(NAME_KEY, u.name);
    setUser({ name: u.name, role: u.role, schoolId: u.schoolId, branchId: u.branchId });
    return u.role;
  }, []);
  const signOut = useCallback(async () => {
    sessionStorage.removeItem('schoolos_super_admin_2fa_ui');
    await auth.logout().catch(() => undefined);
    localStorage.removeItem(NAME_KEY); setUser(null); qc.clear();
  }, [qc]);

  const value = useMemo(() => ({ user, loading, signIn, signOut }), [user, loading, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => { const c = useContext(AuthContext); if (!c) throw new Error('useAuth outside AuthProvider'); return c; };
