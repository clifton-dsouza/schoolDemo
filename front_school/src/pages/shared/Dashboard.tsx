import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Banknote, BriefcaseBusiness, CalendarCheck, ChevronDown, CircleDollarSign, GraduationCap, IndianRupee, Plus, UserPlus, Users, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { activities, attendanceWeek, classDistribution, enrollment, feeTrend, financeYear, genderDistribution } from '../../data/adminDemo';
import { BarChart, DonutChart, LineChart } from '../../components/charts/AdminCharts';
import { getAdminDashboardSummary } from '../../services/dashboard';

const card = 'rounded-xl border border-[#303238] bg-[#1b1c20]';
const chartSeries = {
  income: [{ key: 'income', label: 'Income', color: '#27b89c' }, { key: 'expense', label: 'Expense', color: '#ef9b55' }],
  attendance: [{ key: 'present', label: 'Present', color: '#3fc6a1' }, { key: 'absent', label: 'Absent', color: '#ed786d' }, { key: 'late', label: 'Late', color: '#e9ad54' }],
  fee: [{ key: 'collected', label: 'Collected', color: '#45c4a5' }, { key: 'pending', label: 'Pending', color: '#638eea' }, { key: 'overdue', label: 'Overdue', color: '#ee796f' }],
};

const kpis = [
  { label: 'Total students', value: '1,466', note: '+32 this month', icon: Users, tone: 'blue', trend: 'up' },
  { label: 'Present today', value: '1,378', note: '94.0% attendance', icon: CalendarCheck, tone: 'green', trend: 'up' },
  { label: 'New admissions', value: '38', note: 'This academic year', icon: UserPlus, tone: 'purple', trend: 'up' },
  { label: 'Pending fees', value: '₹18.42L', note: '124 students due', icon: Wallet, tone: 'orange', trend: 'down' },
  { label: "Today's collection", value: '₹2,48,500', note: '+12.4% vs yesterday', icon: IndianRupee, tone: 'green', trend: 'up' },
  { label: 'Monthly income', value: '₹31.2L', note: '+8.6% vs last month', icon: CircleDollarSign, tone: 'blue', trend: 'up' },
  { label: 'Monthly expense', value: '₹21.3L', note: '68.3% of income', icon: Banknote, tone: 'orange', trend: 'down' },
  { label: 'Staff present', value: '86 / 92', note: '6 on leave today', icon: BriefcaseBusiness, tone: 'purple', trend: 'up' },
];

function ChartCard({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return <section className={`${card} min-w-0 p-4 sm:p-5 ${className}`}><div className="mb-5"><h2 className="text-sm font-semibold text-slate-100">{title}</h2>{subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}</div>{children}</section>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('This academic year');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const { data: summary } = useQuery({ queryKey: ['admin-dashboard-summary'], queryFn: getAdminDashboardSummary, staleTime: 30_000 });
  if (!user) return null;

  const liveKpis = kpis.map((item) => {
    if (!summary) return item;
    if (item.label === 'Total students') return { ...item, value: summary.students.count.toLocaleString('en-IN'), note: 'Current active records' };
    if (item.label === 'Present today') return { ...item, value: String(summary.attendance.present ?? 0), note: `${summary.attendance.count} attendance records today` };
    if (item.label === 'Pending fees') return { ...item, value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(summary.fees.outstandingCents / 100), note: `${summary.fees.count} outstanding fee records` };
    if (item.label === 'Staff present') return { ...item, value: `${summary.teachers.count} teachers`, note: 'Current teacher records' };
    return item;
  });

  const quickActions = [
    { label: 'Add student', icon: UserPlus, to: '/app/modules/students/admission', tone: 'blue' },
    { label: 'Collect fee', icon: IndianRupee, to: '/app/modules/finance/fees', tone: 'green' },
    { label: 'Add expense', icon: Wallet, to: '/app/modules/accounts/expense', tone: 'orange' },
    { label: 'Add staff', icon: BriefcaseBusiness, to: '/app/modules/hr/staff', tone: 'purple' },
    { label: 'Mark attendance', icon: CalendarCheck, to: '/app/modules/students/attendance', tone: 'blue' },
    { label: 'Create notice', icon: Plus, to: '/app/modules/communication/notices', tone: 'purple' },
    { label: 'Generate report', icon: Banknote, to: '/app/modules/reports/overview', tone: 'green' },
    { label: 'Send message', icon: Users, to: '/app/modules/communication/messages', tone: 'orange' },
  ];

  return (
    <div className="space-y-5 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-sky-400">School overview</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Good morning, {user.name?.split(' ')[0] ?? 'Admin'}</h1><p className="mt-1 text-sm text-slate-400">Here’s what’s happening at your school today.</p></div>
        <div className="flex items-center gap-2">
          <div className="relative"><button onClick={() => setPeriodOpen(!periodOpen)} className="flex h-9 items-center gap-2 rounded-lg border border-[#37393f] bg-[#1b1c20] px-3 text-xs text-slate-300 hover:border-slate-500">{period}<ChevronDown className="size-3.5" /></button>{periodOpen && <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-[#383a40] bg-[#222328] p-1 shadow-xl">{['Today', 'This month', 'This academic year'].map((item) => <button key={item} onClick={() => { setPeriod(item); setPeriodOpen(false); }} className="block w-full rounded px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/5">{item}</button>)}</div>}</div>
          <button onClick={() => navigate('/app/modules/students/admission')} className="flex h-9 items-center gap-2 rounded-lg bg-sky-600 px-3 text-xs font-semibold text-white transition hover:bg-sky-500"><Plus className="size-4" />Quick add</button>
        </div>
      </header>

      {notice && <div role="status" className="flex items-center justify-between rounded-lg border border-emerald-900 bg-emerald-950/40 px-4 py-2 text-sm text-emerald-300">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss" className="text-emerald-200">×</button></div>}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {liveKpis.map(({ label, value, note, icon: Icon, tone, trend }) => <div key={label} className={`${card} p-4 transition hover:border-[#494c54]`}>
          <div className="flex items-start justify-between"><span className="text-xs font-medium text-slate-400">{label}</span><span className={`grid size-8 place-items-center rounded-lg ${tone === 'blue' ? 'bg-blue-500/10 text-blue-400' : tone === 'green' ? 'bg-emerald-500/10 text-emerald-400' : tone === 'purple' ? 'bg-violet-500/10 text-violet-400' : 'bg-orange-500/10 text-orange-300'}`}><Icon className="size-4" /></span></div>
          <div className="mt-3 flex items-end justify-between gap-2"><strong className="text-[1.35rem] font-semibold tracking-tight text-white">{value}</strong>{trend === 'up' ? <ArrowUpRight className="mb-1 size-4 text-emerald-400" /> : <ArrowDownRight className="mb-1 size-4 text-orange-300" />}</div>
          <p className="mt-1 text-[11px] text-slate-500">{note}</p>
        </div>)}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Student enrollment trend" subtitle="Admissions and total strength · 2026–27"><LineChart data={enrollment} series={[{ key: 'admissions', label: 'New admissions', color: '#37bda4' }, { key: 'total', label: 'Total students', color: '#6594f4' }]} /></ChartCard>
        <ChartCard title="Attendance overview" subtitle="Daily attendance · last 7 days"><LineChart data={attendanceWeek} series={chartSeries.attendance} /></ChartCard>
        <ChartCard title="Income vs expense" subtitle="Monthly totals · ₹ lakhs · last 12 months"><BarChart data={financeYear} series={chartSeries.income} /></ChartCard>
        <ChartCard title="Fee collection" subtitle="Monthly fee status · ₹ lakhs"><LineChart data={feeTrend} series={chartSeries.fee} /></ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Students by class" subtitle="1,466 enrolled"><DonutChart data={classDistribution} /></ChartCard>
        <ChartCard title="Gender distribution" subtitle="Student population"><DonutChart data={genderDistribution} /></ChartCard>
        <ChartCard title="Admission sources" subtitle="Current academic year"><BarChart horizontal data={[{ label: 'Online portal', value: 142 }, { label: 'Walk-in', value: 98 }, { label: 'Parent referral', value: 84 }, { label: 'School website', value: 63 }, { label: 'Transfer', value: 31 }]} series={[{ key: 'value', label: 'Admissions', color: '#7096ef' }]} /></ChartCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Attendance by class" subtitle="Present and absent students · today"><BarChart horizontal data={[{ label: 'Nursery–UKG', present: 98, absent: 7 }, { label: 'Classes I–IV', present: 386, absent: 22 }, { label: 'Classes V–VIII', present: 482, absent: 30 }, { label: 'Classes IX–XII', present: 412, absent: 29 }]} series={[{ key: 'present', label: 'Present', color: '#3fc6a1' }, { key: 'absent', label: 'Absent', color: '#ed786d' }]} /></ChartCard>
        <ChartCard title="Expense breakdown" subtitle="Monthly spend · ₹21.3L"><DonutChart data={[{ label: 'Staff salary', value: 12.4, color: '#5b8def' }, { label: 'Transport', value: 2.8, color: '#25b8a5' }, { label: 'Electricity', value: 1.8, color: '#ed9f54' }, { label: 'Stationery', value: 1.4, color: '#9a7af5' }, { label: 'Maintenance', value: 1.2, color: '#df6c76' }, { label: 'Other', value: 1.7, color: '#65a7b5' }]} totalLabel="₹ lakhs" /></ChartCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartCard title="Recent activity" subtitle="Latest updates across your school">
          <div className="divide-y divide-[#2a2c31]">{activities.map((item) => <div key={item.title} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><span className={`grid size-9 shrink-0 place-items-center rounded-lg ${item.tone === 'green' ? 'bg-emerald-500/10 text-emerald-400' : item.tone === 'purple' ? 'bg-violet-500/10 text-violet-400' : item.tone === 'orange' ? 'bg-orange-500/10 text-orange-300' : 'bg-sky-500/10 text-sky-400'}`}><ActivityIcon kind={item.icon} /></span><div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-200">{item.title}</p><p className="mt-0.5 truncate text-[11px] text-slate-500">{item.detail}</p></div><time className="shrink-0 text-[10px] text-slate-500">{item.time}</time></div>)}</div>
        </ChartCard>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <ChartCard title="Upcoming events" subtitle="Next 7 days"><div className="space-y-3">{[
            { date: '02 OCT', title: 'Gandhi Jayanti', meta: 'School holiday', color: 'text-orange-300 bg-orange-400/10' },
            { date: '05 OCT', title: 'Science practicals', meta: 'Classes XI–XII', color: 'text-sky-300 bg-sky-400/10' },
            { date: '12 OCT', title: 'Mid-term examinations', meta: 'Classes I–XII', color: 'text-violet-300 bg-violet-400/10' },
          ].map((event) => <div key={event.title} className="flex items-center gap-3"><span className={`w-12 rounded-md px-1.5 py-2 text-center text-[9px] font-bold tracking-wide ${event.color}`}>{event.date}</span><div><p className="text-xs font-medium text-slate-200">{event.title}</p><p className="mt-0.5 text-[10px] text-slate-500">{event.meta}</p></div></div>)}</div></ChartCard>
          <ChartCard title="Upcoming birthdays" subtitle="Next 30 days"><div className="space-y-3">{[
            ['AK', 'Aarav Kapoor', 'Class IV-B · 02 Oct'], ['MR', 'Mira Rao', 'Class IX-A · 05 Oct'], ['SP', 'Sana Patel', 'Class II-C · 08 Oct'],
          ].map(([initials, student, date]) => <div key={student} className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-[#30333b] text-[10px] font-semibold text-slate-300">{initials}</span><div className="flex-1"><p className="text-xs text-slate-200">{student}</p><p className="text-[10px] text-slate-500">{date}</p></div><span className="text-xs">🎂</span></div>)}</div></ChartCard>
        </div>
      </section>

      <ChartCard title="Quick actions" subtitle="Common tasks, one click away">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-8">{quickActions.map(({ label, icon: Icon, to, tone }) => <button key={label} onClick={() => navigate(to)} className="group flex items-center gap-2.5 rounded-lg border border-[#303238] bg-[#202126] p-3 text-left transition hover:border-slate-500 hover:bg-[#27292e]"><span className={`grid size-8 shrink-0 place-items-center rounded-md ${tone === 'green' ? 'bg-emerald-500/10 text-emerald-400' : tone === 'orange' ? 'bg-orange-500/10 text-orange-300' : tone === 'purple' ? 'bg-violet-500/10 text-violet-400' : 'bg-sky-500/10 text-sky-400'}`}><Icon className="size-4" /></span><span className="text-[11px] font-medium text-slate-300">{label}</span><ArrowRight className="ml-auto size-3 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300" /></button>)}</div>
        <div className="sr-only">{notice}</div>
      </ChartCard>
    </div>
  );
}

function ActivityIcon({ kind }: { kind: string }) {
  if (kind === 'wallet') return <Wallet className="size-4" />;
  if (kind === 'check') return <CalendarCheck className="size-4" />;
  if (kind === 'file') return <Banknote className="size-4" />;
  if (kind === 'bell') return <GraduationCap className="size-4" />;
  return <UserPlus className="size-4" />;
}
