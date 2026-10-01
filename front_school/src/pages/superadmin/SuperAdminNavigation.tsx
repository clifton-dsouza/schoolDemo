import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Bell, BookOpen, Building2, ChevronRight, CircleDollarSign, CreditCard, FileText, Gauge, Globe2, GraduationCap, KeyRound, LayoutDashboard, Library, Megaphone, MessageCircle, MonitorCog, Palette, PanelTop, Shield, ShieldCheck, Sparkles, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SuperAdminNavItem = { label: string; to?: string; icon?: LucideIcon; children?: SuperAdminNavItem[] };
export type SuperAdminNavGroup = { label: string; icon?: LucideIcon; collapsible?: boolean; items: SuperAdminNavItem[] };

export const superAdminNavigation: SuperAdminNavGroup[] = [
  { label: 'PLATFORM', icon: LayoutDashboard, items: [
    { label: 'Dashboard', to: '/superadmin/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', to: '/superadmin/profile', icon: Users },
    { label: 'Schools', to: '/superadmin/schools', icon: Building2 },
    { label: 'Plans', to: '/superadmin/plans', icon: CreditCard },
    { label: 'Plan Add-ons', to: '/superadmin/plan-addons', icon: CircleDollarSign },
    { label: 'Team', to: '/superadmin/team', icon: Users },
    { label: 'Payments', to: '/superadmin/payments', icon: CreditCard },
    { label: 'Invoices', to: '/superadmin/invoices', icon: FileText },
    { label: 'Payment History', to: '/superadmin/payment-history', icon: Activity },
    { label: 'Subscriptions', to: '/superadmin/subscriptions', icon: CreditCard },
  ] },
  { label: 'REPORTS', icon: Activity, collapsible: true, items: [
    { label: 'Reports Dashboard', to: '/superadmin/reports', icon: LayoutDashboard },
    { label: 'Login Logs', to: '/superadmin/login-logs', icon: KeyRound },
    { label: 'School Usage', to: '/superadmin/school-usage', icon: Activity },
    { label: 'Fee Collections', to: '/superadmin/fee-collections', icon: CircleDollarSign },
    { label: 'Income & Expense', to: '/superadmin/income-expense', icon: CircleDollarSign },
    { label: 'Attendance Trends', to: '/superadmin/reports/attendance', icon: Activity },
    { label: 'Engagement Audit', to: '/superadmin/engagement-audit', icon: Users },
    { label: 'Communication Reports', to: '/superadmin/communication-reports', icon: MessageCircle },
    { label: 'Subscription Reports', to: '/superadmin/subscription-reports', icon: CreditCard },
    { label: 'Revenue Reports', to: '/superadmin/revenue-reports', icon: CircleDollarSign },
    { label: 'Student Statistics', to: '/superadmin/student-statistics', icon: GraduationCap },
    { label: 'Teacher Statistics', to: '/superadmin/teacher-statistics', icon: Users },
    { label: 'School Performance', to: '/superadmin/school-performance', icon: Building2 },
    { label: 'API Reports', to: '/superadmin/api-reports', icon: Globe2 },
    { label: 'AI Reports', to: '/superadmin/ai-reports', icon: Sparkles },
  ] },
  { label: 'SETTINGS', icon: Gauge, collapsible: true, items: [
    { label: 'Settings Center', to: '/superadmin/settings', icon: Gauge },
    { label: 'General', to: '/superadmin/general', icon: PanelTop },
    { label: 'Menu Builder', to: '/superadmin/menu-builder', icon: LayoutDashboard },
    { label: 'Payments', to: '/superadmin/payments-settings', icon: CreditCard },
    { label: 'SMS', to: '/superadmin/sms', icon: MessageCircle },
    { label: 'Email', to: '/superadmin/email', icon: Bell },
    { label: 'Notifications', to: '/superadmin/notifications', icon: Bell },
    { label: 'Appearance', to: '/superadmin/appearance', icon: Palette },
    { label: 'Branding', to: '/superadmin/branding', icon: PanelTop },
    { label: 'Security', to: '/superadmin/settings/security', icon: ShieldCheck },
    { label: 'Authentication', to: '/superadmin/authentication', icon: KeyRound },
    { label: 'Roles & Permissions', to: '/superadmin/roles-permissions', icon: Shield },
    { label: 'Feature Flags', to: '/superadmin/feature-flags', icon: MonitorCog },
    { label: 'Integrations', to: '/superadmin/integrations', icon: Globe2 },
    { label: 'Storage', to: '/superadmin/storage', icon: Library },
    { label: 'Backup', to: '/superadmin/backups', icon: FileText },
    { label: 'Database', to: '/superadmin/database', icon: Gauge },
    { label: 'API Settings', to: '/superadmin/settings/api', icon: Globe2 },
    { label: 'Audit Logs', to: '/superadmin/audit-logs', icon: FileText },
  ] },
  { label: 'COMMUNICATIONS', icon: MessageCircle, collapsible: true, items: [
    { label: 'Comms Wallet', to: '/superadmin/comms-wallet', icon: CircleDollarSign },
    { label: 'SMS Credits', to: '/superadmin/sms-credits', icon: MessageCircle },
    { label: 'WhatsApp Credits', to: '/superadmin/whatsapp-credits', icon: MessageCircle },
    { label: 'Email Credits', to: '/superadmin/email-credits', icon: Bell },
    { label: 'Usage History', to: '/superadmin/usage-history', icon: Activity },
    { label: 'Transactions', to: '/superadmin/transactions', icon: FileText },
    { label: 'Recharge / Purchase Credits', to: '/superadmin/comms-wallet', icon: CreditCard },
  ] },
  { label: 'DEVELOPER', icon: Globe2, collapsible: true, items: [
    { label: 'API Documentation', to: '/superadmin/api-docs', icon: FileText },
    { label: 'API Keys', to: '/superadmin/api-keys', icon: KeyRound },
    { label: 'Webhooks', to: '/superadmin/webhooks', icon: Activity },
    { label: 'Developer Settings', to: '/superadmin/developer-settings', icon: Gauge },
    { label: 'API Usage', to: '/superadmin/api-usage', icon: Activity },
    { label: 'Request Logs', to: '/superadmin/request-logs', icon: FileText },
  ] },
  { label: 'SUPPORT', icon: Bell, collapsible: true, items: [
    { label: 'Support Tickets', to: '/superadmin/support', icon: Bell },
    { label: 'Ticket Categories', to: '/superadmin/ticket-categories', icon: FileText },
    { label: 'Support Agents', to: '/superadmin/support-agents', icon: Users },
    { label: 'SLA / Priority', to: '/superadmin/sla-priority', icon: Gauge },
    { label: 'Support Analytics', to: '/superadmin/support-analytics', icon: Activity },
  ] },
  { label: 'WEBSITE', icon: Globe2, collapsible: true, items: [
    { label: 'Landing Page', to: '/superadmin/website/landing', icon: Globe2 },
    { label: 'Visual Builder', to: '/superadmin/visual-builder', icon: PanelTop },
    { label: 'Full Templates', to: '/superadmin/website-templates', icon: FileText },
    { label: 'Pages', to: '/superadmin/pages', icon: FileText },
    { label: 'Navigation & Footer', to: '/superadmin/navigation', icon: LayoutDashboard },
    { label: 'Sitemap', to: '/superadmin/sitemap', icon: Globe2 },
    { label: 'School Site Templates', to: '/superadmin/website-templates', icon: FileText },
    { label: 'Preview Site', to: '/superadmin/website/landing', icon: PanelTop },
    { label: 'Document Templates', icon: FileText, children: [
      { label: 'Template Library', to: '/superadmin/templates', icon: FileText },
      { label: 'Template Categories', to: '/superadmin/template-categories', icon: FileText },
      { label: 'Template Variables', to: '/superadmin/template-variables', icon: FileText },
      { label: 'Template Usage', to: '/superadmin/template-usage', icon: Activity },
    ] },
  ] },
  { label: 'AI & CONTENT', icon: Sparkles, collapsible: true, items: [
    { label: 'Blog', icon: BookOpen, children: [
      { label: 'Posts', to: '/superadmin/posts', icon: FileText },
      { label: 'Categories', to: '/superadmin/blog-categories', icon: BookOpen },
    ] },
    { label: 'Knowledge Base', icon: Library, children: [
      { label: 'Categories', to: '/superadmin/kb-categories', icon: Library },
      { label: 'Articles', to: '/superadmin/articles', icon: FileText },
    ] },
    { label: 'AI Management', icon: Sparkles, children: [
      { label: 'AI Dashboard', to: '/superadmin/ai', icon: LayoutDashboard },
      { label: 'AI Settings', to: '/superadmin/ai/settings', icon: Gauge },
      { label: 'AI Models', to: '/superadmin/ai-models', icon: Sparkles },
      { label: 'AI Analytics', to: '/superadmin/ai/analytics', icon: Activity },
      { label: 'AI Usage', to: '/superadmin/ai-usage', icon: Activity },
      { label: 'AI Credits', to: '/superadmin/ai-credits', icon: CreditCard },
      { label: 'AI Prompts', to: '/superadmin/ai-prompts', icon: FileText },
      { label: 'AI Activity', to: '/superadmin/ai-activity', icon: Activity },
      { label: 'Content Safety', to: '/superadmin/content-safety', icon: ShieldCheck },
    ] },
    { label: 'Onboarding Templates', to: '/superadmin/onboarding-templates', icon: FileText },
  ] },
  { label: 'ACCOUNT', icon: Users, items: [
    { label: 'Profile', to: '/superadmin/profile', icon: Users },
    { label: 'Security', to: '/superadmin/security', icon: ShieldCheck },
  ] },
];

const stateKey = 'schoolos-superadmin-sidebar-open-v1';
type OpenState = Record<string, boolean>;

export function SuperAdminSidebarNavigation({ collapsed, onNavigate }: { collapsed: boolean; onNavigate: () => void }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState<OpenState>(() => {
    try { return JSON.parse(sessionStorage.getItem(stateKey) ?? '{}') as OpenState; } catch { return {}; }
  });
  const saveOpen = (next: OpenState) => {
    setOpen(next);
    try { sessionStorage.setItem(stateKey, JSON.stringify(next)); } catch { /* Navigation still works without storage. */ }
  };
  const active = (item: SuperAdminNavItem): boolean => Boolean(item.to && (pathname === item.to || (item.to === '/superadmin/schools' && pathname.startsWith(`${item.to}/`)))) || Boolean(item.children?.some(active));
  const allNodes = (items: SuperAdminNavItem[], prefix: string, ancestors: string[]): { item: SuperAdminNavItem; ancestors: string[] }[] => items.flatMap(item => {
    const key = `${prefix}/${item.label}`;
    const openAncestors = item.children ? [...ancestors, key] : ancestors;
    return [{ item, ancestors: openAncestors }, ...(item.children ? allNodes(item.children, key, [...ancestors, key]) : [])];
  });
  useEffect(() => {
    const next = { ...open };
    let changed = false;
    for (const group of superAdminNavigation) {
      const nodes = allNodes(group.items, group.label, [group.label]);
      const matched = nodes.find(({ item }) => Boolean(item.to && active(item)));
      if (matched) for (const ancestor of matched.ancestors) if (!next[ancestor]) { next[ancestor] = true; changed = true; }
    }
    if (changed) saveOpen(next);
    // Active-route expansion runs only when the URL changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggle = (key: string) => saveOpen({ ...open, [key]: !open[key] });
  const renderItem = (item: SuperAdminNavItem, prefix: string, depth: number): ReactNode => {
    const key = `${prefix}/${item.label}`;
    const isOpen = Boolean(open[key]);
    const isActive = active(item);
    const Icon = item.icon;
    const indent = depth === 0 ? '' : depth === 1 ? 'pl-5' : 'pl-8';
    const rowClass = `group mb-0.5 flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-[11px] transition-colors duration-150 ${isActive ? 'bg-[#7b1734]/35 text-white' : 'text-slate-300 hover:bg-white/[.06] hover:text-white'} ${indent}`;
    if (item.children) return <div key={key}>
      <button type="button" title={collapsed ? item.label : undefined} aria-expanded={isOpen} onClick={() => toggle(key)} className={rowClass}>
        {Icon && <Icon className="size-4 shrink-0 text-slate-400 group-hover:text-slate-200"/>}
        {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
        <ChevronRight className={`size-3.5 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}/>
      </button>
      {isOpen && <div className="ml-2 border-l border-white/10 pl-1">{item.children.map(child => renderItem(child, key, depth + 1))}</div>}
    </div>;
    return <Link key={key} to={item.to ?? '/superadmin/dashboard'} title={collapsed ? item.label : undefined} onClick={onNavigate} className={rowClass} aria-current={pathname === item.to ? 'page' : undefined}>
      {Icon && <Icon className={`size-4 shrink-0 ${isActive ? 'text-rose-200' : 'text-slate-500 group-hover:text-slate-300'}`}/>} {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>;
  };

  return <nav aria-label="Super Admin navigation" className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3 [scrollbar-color:#454a51_transparent] [scrollbar-width:thin]">
    {superAdminNavigation.map(group => {
      const groupOpen = Boolean(open[group.label]);
      const groupActive = group.items.some(active);
      if (!group.collapsible) return <section key={group.label} className="mb-3">
        {!collapsed && <p className="mb-1 px-2.5 pt-2 text-[9px] font-semibold tracking-[.15em] text-slate-500">{group.label}</p>}
        {group.items.map(item => renderItem(item, group.label, 0))}
      </section>;
      const GroupIcon = group.icon;
      return <section key={group.label} className="mb-1.5">
        <button type="button" title={collapsed ? group.label : undefined} aria-expanded={groupOpen} onClick={() => toggle(group.label)} className={`group flex min-h-10 w-full items-center gap-2 rounded-md px-2.5 text-left text-[10px] font-semibold tracking-[.08em] transition-colors duration-150 ${groupActive ? 'text-white' : 'text-slate-300 hover:bg-white/[.05] hover:text-white'}`}>
          {GroupIcon && <GroupIcon className="size-4 shrink-0 text-slate-400"/>}
          {!collapsed && <span className="min-w-0 flex-1 truncate">{group.label}</span>}
          <ChevronRight className={`size-3.5 shrink-0 text-slate-500 transition-transform duration-200 ${groupOpen ? 'rotate-90' : ''}`}/>
        </button>
        {groupOpen && <div className="ml-2 border-l border-white/10 pl-1">{group.items.map(item => renderItem(item, group.label, 1))}</div>}
      </section>;
    })}
  </nav>;
}
