import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, ChevronsLeft, ChevronsRight, Command, GraduationCap, Grid2X2, LayoutDashboard, LogOut, Menu, Plus, Search, Settings, Shield, UserRound, Wallet, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { accountNav, adminNav, flattenAdminNavigation, mainNav, type NavGroup, type NavLinkItem } from '../data/adminNavigation';
import { dashboardPath, ROLE_LABEL } from '../types/roles';
import { studentRows } from '../data/adminDemo';

const adminRoles = ['platform_owner', 'school_admin', 'branch_admin', 'accountant'];
const sideLink = ({ isActive }: { isActive: boolean }) => `group flex min-h-9 items-center gap-3 rounded-md px-2.5 text-[12px] transition ${isActive ? 'bg-[#3a2630] font-medium text-[#f1c7d4] shadow-[inset_3px_0_0_#b52d55]' : 'text-[#9BA2AA] hover:bg-white/[0.045] hover:text-[#E7E9EC]'}`;

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = !!user && adminRoles.includes(user.role);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState('Students');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [popup, setPopup] = useState<'quick' | 'apps' | 'notifications' | 'profile' | null>(null);
  const [unread, setUnread] = useState(3);

  useEffect(() => {
    const group = adminNav.find((section) => flattenAdminNavigation([section]).some((item) => item.to === location.pathname));
    if (group) setOpenGroup(group.label);
    setMobileOpen(false);
    setPopup(null);
  }, [location.pathname]);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  const title = useMemo(() => {
    for (const item of [...mainNav, ...flattenAdminNavigation()]) if (item.to === location.pathname) return item.label;
    if (location.pathname === '/app/dashboard') return user?.role === 'school_admin' ? 'Admin dashboard' : 'Dashboard';
    if (location.pathname === '/app/students') return 'Student list';
    return 'SchoolOS';
  }, [location.pathname, user?.role]);

  if (!user) return null;
  const suggestions = query.trim() ? [
    ...flattenAdminNavigation().filter((item): item is NavLinkItem & { to: string } => !!item.to && item.label.toLowerCase().includes(query.toLowerCase())).slice(0, 5),
    ...studentRows.filter((row) => row.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map((row) => ({ label: row.name, to: '/app/students', icon: UserRound })),
  ] : [];
  const quickItems: NavLinkItem[] = [
    { label: 'Admit student', to: '/app/modules/students/admission' }, { label: 'Collect fee', to: '/app/modules/finance/fees' },
    { label: 'Add staff', to: '/app/modules/hr/staff' }, { label: 'Record expense', to: '/app/modules/accounts/expense' },
  ];
  const closePopup = () => setPopup(null);

  return (
    <div className="admin-portal min-h-screen bg-[#151719] text-[#20242A]">
      {mobileOpen && <button className="fixed inset-0 z-40 bg-black/65 lg:hidden" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-[width,transform] duration-200 ${collapsed ? 'w-[72px]' : 'w-[254px]'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className={`flex h-[66px] shrink-0 items-center border-b border-[#2d2f34] ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          <Link to={dashboardPath(user.role)} className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#8B1E3F] text-white"><GraduationCap className="size-5" /></span>
            {!collapsed && <span className="min-w-0"><strong className="block truncate text-[13px] font-semibold text-slate-100">Northstar Academy</strong><span className="block text-[10px] text-slate-500">School management</span></span>}
          </Link>
          <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-1 text-slate-500 lg:hidden"><X className="size-4" /></button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3 [scrollbar-width:thin] [scrollbar-color:#34363c_transparent]">
          {collapsed ? <div className="mb-2 flex flex-col items-center gap-1">{mainNav.map((item) => <SidebarLink key={item.to} item={item} collapsed={collapsed} />)}</div> : <>
            <p className="mb-1.5 px-2.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">Main navigation</p>
            {mainNav.map((item) => <SidebarLink key={item.to} item={item} collapsed={collapsed} />)}
          </>}

          {isAdmin && <div className="mt-5">
            {!collapsed && <p className="mb-1.5 px-2.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">Management</p>}
            {adminNav.map((group) => <SidebarGroup key={group.label} group={group} open={openGroup === group.label} collapsed={collapsed} openItems={openItems} onToggle={() => collapsed ? setCollapsed(false) : setOpenGroup(openGroup === group.label ? '' : group.label)} onItemToggle={(label) => setOpenItems((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label])} />)}
          </div>}

          {!isAdmin && <div className="mt-5">{user.role === 'teacher' && <SidebarLink item={{ label: 'Students', to: '/app/students', icon: UserRound }} collapsed={collapsed} />}{user.role === 'student' && <SidebarLink item={{ label: 'My dashboard', to: '/app/student-dashboard', icon: GraduationCap }} collapsed={collapsed} />}</div>}
        </div>
        <div className="shrink-0 border-t border-[#30353A] p-2.5">
          {!collapsed && <><p className="mb-1 px-2.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#9BA2AA]">Account</p>{accountNav.map((item) => <SidebarLink key={item.to} item={item} collapsed={collapsed} />)}</>}
          {collapsed && accountNav.map((item) => <SidebarLink key={item.to} item={item} collapsed={collapsed} />)}
          <button onClick={() => { void signOut(); navigate('/login'); }} className="mt-1 flex min-h-9 w-full items-center gap-3 rounded-md px-2.5 text-left text-[12px] text-[#E7E9EC] transition hover:bg-rose-500/15 hover:text-rose-200" title={collapsed ? 'Logout' : undefined}><LogOut className="size-4 shrink-0" />{!collapsed && <span>Logout</span>}</button>
          {!collapsed && <div className="mb-2 rounded-md bg-[#202126] px-3 py-2"><div className="flex items-center justify-between text-[10px] text-slate-400"><span>Academic session</span><span className="text-emerald-400">● Active</span></div><p className="mt-1 text-xs font-medium text-slate-200">2026 – 2027</p></div>}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden h-8 w-full items-center justify-center gap-2 rounded-md text-[11px] text-slate-500 hover:bg-white/5 hover:text-slate-200 lg:flex" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <ChevronsRight className="size-4" /> : <><ChevronsLeft className="size-4" />Collapse menu</>}</button>
        </div>
      </aside>

      <div className={`min-h-screen transition-[margin] duration-200 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[254px]'}`}>
        <header className="admin-header sticky top-0 z-30 flex h-[62px] items-center gap-3 border-b px-3 backdrop-blur-xl sm:px-5">
          <button className="grid size-8 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-white/5 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu className="size-5" /></button>
          <button className="hidden size-8 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-white/5 lg:grid" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">{collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}</button>
          <div className="hidden min-w-0 text-xs text-slate-500 sm:block">SchoolOS <span className="px-1.5 text-slate-700">/</span><span className="text-slate-200">{title}</span></div>
          <div className="relative ml-auto w-full max-w-[340px]">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-500" />
            <input ref={searchRef} value={query} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} onKeyDown={(event) => { if (event.key === 'Enter' && query.trim()) { navigate(`/app/modules/search/results?q=${encodeURIComponent(query.trim())}`); setSearchOpen(false); } if (event.key === 'Escape') setSearchOpen(false); }} placeholder="Search students, payments, pages…" className="h-9 w-full rounded-md border border-[#37393f] bg-[#222328] pl-9 pr-12 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-[#527cae]" />
            <kbd className="absolute right-2.5 top-2 rounded border border-[#3b3d43] px-1 text-[9px] text-slate-500">⌘ K</kbd>
            {searchOpen && query && <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-lg border border-[#3c3e44] bg-[#202126] p-1 shadow-2xl">{suggestions.length ? suggestions.map((item) => { const Icon = item.icon ?? Search; return <button key={`${item.to}-${item.label}`} onMouseDown={(event) => event.preventDefault()} onClick={() => { navigate(item.to); setSearchOpen(false); setQuery(''); }} className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-xs text-slate-300 hover:bg-white/5"><Icon className="size-3.5 text-slate-500" />{item.label}</button>; }) : <p className="px-3 py-3 text-xs text-slate-500">Press Enter to search all records for “{query}”.</p>}</div>}
          </div>
          <div className="relative">
            <button onClick={() => setPopup(popup === 'quick' ? null : 'quick')} className="grid size-9 shrink-0 place-items-center rounded-md border border-[#3b3d43] text-slate-300 transition hover:bg-white/5" aria-label="Quick add"><Plus className="size-4" /></button>
            {popup === 'quick' && <Popup className="right-0 w-48">{quickItems.map((item) => <PopupLink key={item.to} item={item} onChoose={closePopup} />)}</Popup>}
          </div>
          <div className="relative hidden sm:block">
            <button onClick={() => setPopup(popup === 'apps' ? null : 'apps')} className="grid size-9 place-items-center rounded-md text-slate-400 hover:bg-white/5 hover:text-white" aria-label="App launcher"><Grid2X2 className="size-4" /></button>
            {popup === 'apps' && <Popup className="right-0 w-56"><p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Workspace</p>{[{ label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard }, { label: 'Student information', to: '/app/students', icon: UserRound }, { label: 'Finance & fees', to: '/app/modules/finance/dashboard', icon: Wallet }, { label: 'Reports', to: '/app/modules/reports/overview', icon: Settings }].map((item) => <PopupLink key={item.to} item={item} onChoose={closePopup} />)}</Popup>}
          </div>
          <div className="relative">
            <button onClick={() => { setPopup(popup === 'notifications' ? null : 'notifications'); setUnread(0); }} aria-label="Notifications" className="relative grid size-9 place-items-center rounded-md text-slate-400 hover:bg-white/5 hover:text-white"><Bell className="size-4" />{unread > 0 && <span className="absolute right-1 top-1 size-2 rounded-full border border-[#191a1e] bg-rose-500" />}</button>
            {popup === 'notifications' && <Popup className="right-0 w-[310px]"><div className="flex items-center justify-between border-b border-[#32343a] px-2 pb-2"><strong className="text-xs text-slate-100">Notifications</strong><span className="text-[10px] text-slate-500">{unread} unread</span></div>{[['New admission received', 'Aarav Mehta · 12 min ago'], ['Fee payment recorded', '₹24,500 · 28 min ago'], ['Attendance is incomplete', 'Class IV-C · 1 hour ago']].map(([label, detail]) => <div key={label} className="border-b border-[#2c2e33] px-2 py-3 last:border-0"><p className="text-xs text-slate-200">{label}</p><p className="mt-1 text-[10px] text-slate-500">{detail}</p></div>)}</Popup>}
          </div>
          <div className="relative">
            <button onClick={() => setPopup(popup === 'profile' ? null : 'profile')} className="flex shrink-0 items-center gap-2 rounded-md p-1 hover:bg-white/5"><span className="grid size-8 place-items-center rounded-full border border-[#456182] bg-[#26364a] text-[10px] font-semibold text-sky-200">{(user.name ?? ROLE_LABEL[user.role]).split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase()}</span><span className="hidden min-w-0 text-left md:block"><strong className="block max-w-24 truncate text-[11px] font-medium text-slate-200">{user.name ?? 'Administrator'}</strong><small className="block text-[9px] text-slate-500">{ROLE_LABEL[user.role]}</small></span><ChevronDown className="hidden size-3 text-slate-500 md:block" /></button>
            {popup === 'profile' && <Popup className="right-0 w-48">{[{ label: 'Profile', to: '/app/modules/settings/profile', icon: UserRound }, { label: 'Security', to: '/app/modules/settings/permissions', icon: Shield }, { label: 'Notifications', to: '/app/modules/settings/notifications', icon: Bell }].map((item) => <PopupLink key={item.to} item={item} onChoose={closePopup} />)}<button onClick={() => { void signOut(); navigate('/login'); closePopup(); }} className="mt-1 flex w-full items-center gap-2 border-t border-[#34363b] px-2 py-2.5 text-left text-xs text-rose-300 hover:bg-rose-500/10"><LogOut className="size-3.5" />Logout</button></Popup>}
          </div>
        </header>
        <main className="admin-content mx-auto max-w-[1640px] p-3 sm:p-5 xl:p-6"><Outlet /></main>
      </div>
    </div>
  );
}

function SidebarLink({ item, collapsed }: { item: NavLinkItem; collapsed: boolean }) {
  const Icon = item.icon ?? Command;
  return <NavLink to={item.to ?? '/app/dashboard'} title={collapsed ? item.label : undefined} className={sideLink}><Icon className="size-4 shrink-0" />{!collapsed && <span className="truncate">{item.label}</span>}</NavLink>;
}

function SidebarGroup({ group, open, collapsed, openItems, onToggle, onItemToggle }: { group: NavGroup; open: boolean; collapsed: boolean; openItems: string[]; onToggle: () => void; onItemToggle: (label: string) => void }) {
  const Icon = group.icon;
  const location = useLocation();
  const active = flattenAdminNavigation([group]).some((item) => item.to === location.pathname);
  return <div className="mt-0.5">
    <button title={collapsed ? group.label : undefined} onClick={onToggle} className={`flex min-h-9 w-full items-center gap-3 rounded-md px-2.5 text-left text-[12px] transition ${active ? 'text-slate-100' : 'text-slate-400 hover:bg-white/[0.045] hover:text-slate-100'}`}><Icon className="size-4 shrink-0" />{!collapsed && <><span className="flex-1 truncate">{group.label}</span><ChevronDown className={`size-3 shrink-0 text-slate-600 transition ${open ? 'rotate-180' : ''}`} /></>}</button>
    {!collapsed && open && <div className="ml-[18px] border-l border-[#30353A] py-0.5 pl-2">{group.items.map((item) => <SidebarTreeItem key={item.label} item={item} depth={0} openItems={openItems} onToggle={onItemToggle} />)}</div>}
  </div>;
}

function SidebarTreeItem({ item, depth, openItems, onToggle }: { item: NavLinkItem; depth: number; openItems: string[]; onToggle: (label: string) => void }) {
  const Icon = item.icon ?? Command;
  const hasChildren = !!item.children?.length;
  const isOpen = openItems.includes(item.label);
  if (!hasChildren && item.to) return <NavLink to={item.to} className={sideLink}><Icon className="size-3.5 shrink-0" /><span className="truncate">{item.label}</span></NavLink>;
  return <div>
    <button onClick={() => onToggle(item.label)} className="flex min-h-9 w-full items-center gap-3 rounded-md px-2.5 text-left text-[12px] text-[#9BA2AA] transition hover:bg-white/[0.045] hover:text-[#E7E9EC]"><Icon className="size-3.5 shrink-0" /><span className="flex-1 truncate">{item.label}</span><ChevronDown className={`size-3 shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} /></button>
    {isOpen && <div className={`ml-3 border-l border-[#30353A] pl-2 ${depth ? 'ml-2' : ''}`}>{item.children?.map((child) => <SidebarTreeItem key={child.label} item={child} depth={depth + 1} openItems={openItems} onToggle={onToggle} />)}</div>}
  </div>;
}

function Popup({ children, className = '' }: { children: ReactNode; className?: string }) { return <div className={`absolute top-11 z-50 rounded-lg border border-[#393b41] bg-[#202126] p-2 shadow-2xl ${className}`}>{children}</div>; }
function PopupLink({ item, onChoose }: { item: NavLinkItem; onChoose: () => void }) { const Icon = item.icon ?? Plus; return <Link to={item.to ?? '/app/dashboard'} onClick={onChoose} className="flex items-center gap-2 rounded px-2 py-2 text-xs text-slate-300 hover:bg-white/5"><Icon className="size-3.5 text-slate-500" />{item.label}</Link>; }
