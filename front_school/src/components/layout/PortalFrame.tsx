import { useMemo, useState, type ReactNode } from 'react';
import { Bell, BookOpen, Bus, CalendarCheck, ChevronLeft, ChevronRight, CreditCard, FileText, GraduationCap, LayoutDashboard, LogOut, Menu, MessageSquare, Search, Settings, Users, Wallet, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types/roles';

type NavigationItem = { label: string; to: string; icon: LucideIcon };

const roleNavigation: Record<Role, NavigationItem[]> = {
  platform_owner: [
    { label: 'Platform dashboard', to: '/superadmin/dashboard', icon: LayoutDashboard }, { label: 'Schools', to: '/superadmin/schools', icon: GraduationCap }, { label: 'Reports', to: '/superadmin/reports', icon: FileText }, { label: 'Audit logs', to: '/superadmin/security/audit-logs', icon: FileText }, { label: 'Settings', to: '/superadmin/settings', icon: Settings },
  ],
  school_admin: [
    { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard }, { label: 'Students', to: '/app/students', icon: Users }, { label: 'Attendance', to: '/app/modules/attendance/overview', icon: CalendarCheck }, { label: 'Fees', to: '/app/modules/finance/fees', icon: Wallet }, { label: 'Notices', to: '/app/modules/communication/notices', icon: Bell }, { label: 'Settings', to: '/app/modules/settings/profile', icon: Settings },
  ],
  branch_admin: [
    { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard }, { label: 'Students', to: '/app/students', icon: Users }, { label: 'Attendance', to: '/app/modules/attendance/overview', icon: CalendarCheck }, { label: 'Fees', to: '/app/modules/finance/fees', icon: Wallet }, { label: 'Notices', to: '/app/modules/communication/notices', icon: Bell }, { label: 'Settings', to: '/app/modules/settings/profile', icon: Settings },
  ],
  accountant: [
    { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard }, { label: 'Students', to: '/app/students', icon: Users }, { label: 'Fees', to: '/app/modules/finance/fees', icon: Wallet }, { label: 'Payments', to: '/app/modules/finance/payments', icon: CreditCard }, { label: 'Reports', to: '/app/modules/reports/overview', icon: FileText }, { label: 'Settings', to: '/app/modules/settings/profile', icon: Settings },
  ],
  teacher: [
    { label: 'Dashboard', to: '/teacher/dashboard', icon: LayoutDashboard }, { label: 'My classes', to: '/teacher/classes', icon: BookOpen }, { label: 'Students', to: '/teacher/students', icon: Users }, { label: 'Attendance', to: '/teacher/attendance', icon: CalendarCheck }, { label: 'Homework', to: '/teacher/homework', icon: FileText }, { label: 'Messages', to: '/teacher/messages', icon: MessageSquare }, { label: 'Profile', to: '/teacher/profile', icon: Settings },
  ],
  student: [
    { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard }, { label: 'My classes', to: '/student/subjects', icon: BookOpen }, { label: 'Attendance', to: '/student/attendance', icon: CalendarCheck }, { label: 'Homework', to: '/student/homework', icon: FileText }, { label: 'Fees', to: '/student/fees', icon: Wallet }, { label: 'Notices', to: '/student/notices', icon: Bell }, { label: 'Profile', to: '/student/profile', icon: Settings },
  ],
  parent: [
    { label: 'Dashboard', to: '/parent/dashboard', icon: LayoutDashboard }, { label: 'Children', to: '/parent/dashboard#children', icon: Users }, { label: 'Attendance', to: '/parent/dashboard#attendance', icon: CalendarCheck }, { label: 'Homework', to: '/parent/dashboard#homework', icon: FileText }, { label: 'Fees', to: '/parent/dashboard#fees', icon: Wallet }, { label: 'Notices', to: '/parent/dashboard#notices', icon: Bell }, { label: 'Profile', to: '/parent/dashboard#profile', icon: Settings },
  ],
  driver: [
    { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard }, { label: 'Routes', to: '/app/modules/transport/routes', icon: Bus }, { label: 'Students', to: '/app/students', icon: Users }, { label: 'Notices', to: '/app/modules/communication/notices', icon: Bell }, { label: 'Profile', to: '/app/modules/settings/profile', icon: Settings },
  ],
};

export function PortalFrame({ children, title }: { children: ReactNode; title: string }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigation = user ? roleNavigation[user.role] : [];
  const initials = useMemo(() => (user?.name ?? 'SchoolOS').split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase(), [user?.name]);

  if (!user) return null;
  const close = () => setMobileOpen(false);
  return <div className="schoolos-shell min-h-screen bg-[#f4f6f8] text-[#20242a]">
    {mobileOpen && <button className="fixed inset-0 z-40 bg-black/50 lg:hidden" aria-label="Close navigation" onClick={close} />}
    <aside className={`schoolos-sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#2f353b] bg-[#1b1e21] text-slate-200 transition-[width,transform] duration-200 ${collapsed ? 'w-[72px]' : 'w-[248px]'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className={`flex h-16 items-center border-b border-[#30353a] ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        <Link to={navigation[0]?.to ?? '/'} className="flex min-w-0 items-center gap-2.5"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#8b1e3f] text-white"><GraduationCap className="size-5" /></span>{!collapsed && <span className="min-w-0"><strong className="block truncate text-[13px]">SchoolOS</strong><small className="block text-[10px] text-slate-500">Connected campus</small></span>}</Link>
        <button className="lg:hidden" onClick={close} aria-label="Close navigation"><X className="size-4 text-slate-400" /></button>
      </div>
      <nav aria-label="Primary navigation" className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3">
        <p className={`mb-1.5 px-2.5 text-[9px] font-semibold uppercase tracking-[.14em] text-slate-500 ${collapsed ? 'sr-only' : ''}`}>Workspace</p>
        {navigation.map((item) => { const Icon = item.icon; return <NavLink key={item.label} to={item.to} end={item.to === navigation[0]?.to} onClick={close} title={collapsed ? item.label : undefined} className={({ isActive }) => `mb-0.5 flex min-h-9 items-center gap-3 rounded-md px-2.5 text-xs transition ${isActive ? 'bg-[#3b2029] font-medium text-rose-100' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}><Icon className="size-4 shrink-0" />{!collapsed && <span className="truncate">{item.label}</span>}</NavLink>; })}
      </nav>
      <div className="border-t border-[#30353a] p-2.5"><button onClick={() => { void signOut(); navigate('/login'); }} className="flex h-9 w-full items-center gap-3 rounded-md px-2.5 text-xs text-slate-400 hover:bg-rose-500/10 hover:text-rose-200"><LogOut className="size-4" />{!collapsed && 'Logout'}</button><button onClick={() => setCollapsed((value) => !value)} className="hidden h-8 w-full items-center justify-center rounded-md text-slate-500 hover:bg-white/5 lg:flex" aria-label="Toggle sidebar">{collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}</button></div>
    </aside>
    <div className={`min-h-screen transition-[margin] duration-200 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[248px]'}`}>
      <header className="schoolos-header sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#d8dde2] bg-white/95 px-3 backdrop-blur sm:px-5"><button onClick={() => setMobileOpen(true)} className="grid size-9 place-items-center rounded-md text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></button><button onClick={() => setCollapsed((value) => !value)} className="hidden size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 lg:grid" aria-label="Toggle sidebar">{collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}</button><div className="hidden min-w-0 text-xs text-slate-500 sm:block">SchoolOS <span className="px-1.5 text-slate-300">/</span><span className="font-medium text-slate-700">{title}</span></div><div className="relative ml-auto hidden w-full max-w-xs md:block"><Search className="absolute left-3 top-2.5 size-4 text-slate-400" /><input aria-label="Search workspace" placeholder="Search workspace" className="h-9 w-full rounded-md border border-[#d8dde2] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#8b1e3f]" /></div><button className="relative grid size-9 place-items-center rounded-md text-slate-600 hover:bg-slate-100" aria-label="Notifications"><Bell className="size-4" /></button><div className="relative"><button onClick={() => setProfileOpen((value) => !value)} className="flex items-center gap-2 rounded-md p-1 hover:bg-slate-100"><span className="grid size-8 place-items-center rounded-full bg-rose-100 text-[10px] font-semibold text-[#8b1e3f]">{initials}</span><span className="hidden text-left md:block"><strong className="block max-w-28 truncate text-[11px] font-medium">{user.name ?? 'SchoolOS user'}</strong><small className="block text-[9px] capitalize text-slate-500">{user.role.replace('_', ' ')}</small></span></button>{profileOpen && <div className="absolute right-0 top-11 z-50 w-44 rounded-md border border-[#d8dde2] bg-white p-1 shadow-lg"><button onClick={() => { void signOut(); navigate('/login'); }} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs text-rose-700 hover:bg-rose-50"><LogOut className="size-3.5" />Logout</button></div>}</div></header>
      <main className="mx-auto max-w-[1600px] p-4 sm:p-5 xl:p-6">{children}</main>
    </div>
  </div>;
}
