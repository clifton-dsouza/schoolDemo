import type { LucideIcon } from 'lucide-react';
import { Activity, Banknote, BookOpen, Building2, CalendarCheck, ChartNoAxesCombined, ClipboardList, FileBarChart, Globe, HandCoins, Headset, LayoutDashboard, Search, School, Settings, ShieldCheck, UserRound, Users, Wallet, BriefcaseBusiness, ContactRound, NotebookTabs, ReceiptIndianRupee, Landmark, ClipboardCheck, HeartHandshake, BellRing, BadgeIndianRupee, DoorOpen, GraduationCap, MessageSquare } from 'lucide-react';

export interface NavLinkItem { label: string; to?: string; icon?: LucideIcon; children?: NavLinkItem[] }
export interface NavGroup { label: string; icon: LucideIcon; items: NavLinkItem[] }

/** School level shortcuts. Keep the shared dashboard and navigator routes stable. */
export const mainNav: NavLinkItem[] = [
  { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard },
  { label: 'School profile', to: '/app/modules/settings/school-profile', icon: School },
  { label: 'ERP Navigator', to: '/app/modules/navigator/overview', icon: Search },
];

export const accountNav: NavLinkItem[] = [
  { label: 'Profile', to: '/app/modules/settings/profile', icon: UserRound },
  { label: 'Security', to: '/app/modules/settings/permissions', icon: ShieldCheck },
  { label: 'Notifications', to: '/app/modules/settings/notifications', icon: BellRing },
];

/** Hierarchical navigation for the existing school scoped Admin modules. */
export const adminNav: NavGroup[] = [
  { label: 'Academics', icon: BookOpen, items: [
    { label: 'Academic dashboard', to: '/app/modules/academics/dashboard', icon: ChartNoAxesCombined },
    { label: 'Classes', to: '/app/modules/academics/classes', icon: School },
    { label: 'Sections', to: '/app/modules/academics/sections', icon: DoorOpen },
    { label: 'Subjects', to: '/app/modules/academics/subjects', icon: NotebookTabs },
    { label: 'Teachers', to: '/app/modules/academics/teachers', icon: Users },
    { label: 'Homework & materials', to: '/app/modules/academics/homework', icon: BookOpen },
  ] },
  { label: 'Students', icon: GraduationCap, items: [
    { label: 'Student dashboard', to: '/app/modules/students/dashboard', icon: ChartNoAxesCombined },
    { label: 'Student admission', to: '/app/modules/students/admission', icon: UserRound },
    { label: 'Student list', to: '/app/students', icon: Users },
    { label: 'Student profiles', to: '/app/modules/students/profile', icon: ContactRound },
    { label: 'Search by photo', to: '/app/modules/students/photo-search', icon: Search },
    { label: 'Behavior records', to: '/app/modules/students/behavior', icon: Activity },
    { label: 'Student categories', to: '/app/modules/students/categories', icon: ContactRound },
    { label: 'Student houses', to: '/app/modules/students/houses', icon: Building2 },
  ] },
  { label: 'Teachers & Staff', icon: BriefcaseBusiness, items: [
    { label: 'Teacher directory', to: '/app/modules/academics/teachers', icon: GraduationCap },
    { label: 'Staff directory', to: '/app/modules/hr/staff', icon: Users },
    { label: 'Leave management', to: '/app/modules/hr/leave', icon: ClipboardCheck },
    { label: 'Payroll', to: '/app/modules/hr/payroll', icon: Banknote },
  ] },
  { label: 'Attendance', icon: CalendarCheck, items: [
    { label: 'Student attendance', to: '/app/modules/students/attendance', icon: Users },
    { label: 'Teacher & staff attendance', to: '/app/modules/hr/attendance', icon: BriefcaseBusiness },
    { label: 'Attendance reports', to: '/app/modules/reports/attendance', icon: FileBarChart },
  ] },
  { label: 'Examinations', icon: ClipboardCheck, items: [
    { label: 'Exams & schedules', to: '/app/modules/academics/exams', icon: CalendarCheck },
    { label: 'Marks & report cards', to: '/app/modules/academics/marks', icon: FileBarChart },
  ] },
  { label: 'Fees & Finance', icon: Wallet, items: [
    { label: 'Finance dashboard', to: '/app/modules/finance/dashboard', icon: ChartNoAxesCombined },
    { label: 'Fee collection', to: '/app/modules/finance/fees', icon: HandCoins },
    { label: 'Fee structure', to: '/app/modules/finance/structure', icon: NotebookTabs },
    { label: 'Student fee ledger', to: '/app/modules/finance/ledger', icon: ContactRound },
    { label: 'Pending fees', to: '/app/modules/finance/pending', icon: BellRing },
    { label: 'Payment history', to: '/app/modules/finance/payments', icon: ReceiptIndianRupee },
    { label: 'Discounts & refunds', to: '/app/modules/finance/discounts', icon: BadgeIndianRupee },
    { label: 'Receipts', to: '/app/modules/finance/receipts', icon: ReceiptIndianRupee },
    { label: 'Accounts', icon: Banknote, children: [
      { label: 'Accounts dashboard', to: '/app/modules/accounts/dashboard', icon: ChartNoAxesCombined },
      { label: 'Income', to: '/app/modules/accounts/income', icon: HandCoins },
      { label: 'Expense', to: '/app/modules/accounts/expense', icon: Wallet },
      { label: 'Day book', to: '/app/modules/accounts/vouchers', icon: ClipboardList },
      { label: 'Chart of accounts', to: '/app/modules/accounts/chart', icon: NotebookTabs },
      { label: 'Income heads', to: '/app/modules/accounts/income-heads', icon: Activity },
      { label: 'Expense heads', to: '/app/modules/accounts/expense-heads', icon: Activity },
      { label: 'Bank accounts', to: '/app/modules/accounts/banks', icon: Landmark },
    ] },
  ] },
  { label: 'Communication', icon: MessageSquare, items: [
    { label: 'Notices', to: '/app/modules/communication/notices', icon: BellRing },
    { label: 'Messages', to: '/app/modules/communication/messages', icon: MessageSquare },
    { label: 'SMS logs', to: '/app/modules/communication/sms', icon: ClipboardList },
  ] },
  { label: 'Parents', icon: HeartHandshake, items: [
    { label: 'Parents & guardians', to: '/app/modules/students/parents', icon: Users },
  ] },
  { label: 'Timetable', icon: CalendarCheck, items: [
    { label: 'Class timetable', to: '/app/modules/academics/timetable', icon: CalendarCheck },
  ] },
  { label: 'Reports', icon: FileBarChart, items: [
    { label: 'Reports overview', to: '/app/modules/reports/overview', icon: FileBarChart },
    { label: 'Student reports', to: '/app/modules/reports/students', icon: Users },
    { label: 'Attendance reports', to: '/app/modules/reports/attendance', icon: CalendarCheck },
    { label: 'Fee & finance reports', to: '/app/modules/reports/finance', icon: Banknote },
    { label: 'Academic reports', to: '/app/modules/reports/academics', icon: BookOpen },
    { label: 'Admission reports', to: '/app/modules/reports/admissions', icon: UserRound },
  ] },
  { label: 'School website', icon: Globe, items: [
    { label: 'Website pages', to: '/app/modules/website/pages', icon: Globe },
    { label: 'Notices & events', to: '/app/modules/website/notices', icon: BellRing },
  ] },
  { label: 'Front office', icon: DoorOpen, items: [
    { label: 'Visitors', to: '/app/modules/front-office/visitors', icon: ContactRound },
    { label: 'Enquiries', to: '/app/modules/front-office/enquiries', icon: MessageSquare },
    { label: 'Complaints', to: '/app/modules/front-office/complaints', icon: ClipboardList },
  ] },
  { label: 'Support / help', icon: Headset, items: [
    { label: 'Contact support', to: '/app/modules/support/tickets', icon: Headset },
  ] },
  { label: 'Settings', icon: Settings, items: [
    { label: 'School profile', to: '/app/modules/settings/school-profile', icon: School },
    { label: 'Academic session', to: '/app/modules/settings/session', icon: CalendarCheck },
    { label: 'Users', to: '/app/modules/settings/users', icon: Users },
    { label: 'Roles & permissions', to: '/app/modules/settings/permissions', icon: ShieldCheck },
    { label: 'Notifications', to: '/app/modules/settings/notifications', icon: BellRing },
    { label: 'Payment settings', to: '/app/modules/settings/payment', icon: Wallet },
    { label: 'System settings', to: '/app/modules/settings/system', icon: Settings },
    { label: 'Backup & audit logs', to: '/app/modules/settings/audit-logs', icon: ClipboardList },
  ] },
];

export function flattenAdminNavigation(groups: NavGroup[] = adminNav): NavLinkItem[] {
  return groups.flatMap((group) => group.items.flatMap((item) => [item, ...(item.children ? flattenChildren(item.children) : [])]));
}

function flattenChildren(items: NavLinkItem[]): NavLinkItem[] {
  return items.flatMap((item) => [item, ...(item.children ? flattenChildren(item.children) : [])]);
}
