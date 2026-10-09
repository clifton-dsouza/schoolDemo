import { Link } from 'react-router-dom';
import { Activity, Building2, CircleDollarSign, Clock3, GraduationCap, Plus, Users } from 'lucide-react';

export interface PlatformSchool {
  id: string;
  name: string;
  city: string;
  students: number;
  teachers: number;
  staff: number;
  admin: string;
  plan: string;
  status: string;
  revenue: string;
  activity: string;
}

const panel = 'rounded-xl border border-slate-200 bg-white shadow-sm';
const metrics = [
  ['Total schools', Building2, '/api/superadmin/dashboard/metrics'],
  ['Active schools', Building2, '/api/superadmin/dashboard/metrics'],
  ['Total students', GraduationCap, '/api/superadmin/dashboard/metrics'],
  ['Total teachers', Users, '/api/superadmin/dashboard/metrics'],
  ['Platform revenue', CircleDollarSign, '/api/superadmin/dashboard/metrics'],
  ['Active subscriptions', Activity, '/api/superadmin/dashboard/metrics'],
  ['Online users', Users, '/api/superadmin/dashboard/metrics'],
  ['Annual recurring revenue', CircleDollarSign, '/api/superadmin/dashboard/metrics'],
  ['Trial schools', Clock3, '/api/superadmin/dashboard/metrics'],
  ['Newly registered schools', Building2, '/api/superadmin/dashboard/metrics'],
] as const;

export default function PlatformDashboard({ rows }: { rows: PlatformSchool[] }) {
  const hasRows = rows.length > 0;
  const actions = [
    ['Approve school', '/superadmin/schools'],
    ['Add school admin', '/superadmin/admins'],
    ['Create subscription', '/superadmin/subscriptions'],
  ] as const;

  return <div className="space-y-4 text-slate-900">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#7b1734]">Platform command center</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-950">Platform Overview</h1>
        <p className="mt-1 text-xs text-slate-500">Dashboard metrics will appear when the Super Admin dashboard API is connected.</p>
      </div>
      <div className="flex flex-wrap gap-2">{actions.map(([label, to]) => <Link key={to} to={to} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium hover:border-rose-300 hover:text-[#7b1734]"><Plus className="size-3.5" />{label}</Link>)}</div>
    </div>

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-5">
      {metrics.map(([label, Icon, endpoint]) => <article key={label} className={`${panel} p-3.5`}>
        <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-medium text-slate-500">{label}</span><span className="grid size-8 place-items-center rounded-lg bg-rose-50 text-[#7b1734]"><Icon className="size-4" /></span></div>
        <strong className="mt-2 block text-sm font-semibold tracking-tight text-slate-500">Unavailable</strong>
        <p className="mt-1 text-[9px] text-slate-500">Requires <code>{endpoint}</code></p>
      </article>)}
    </div>

    <section className={`${panel} p-5`}>
      <h2 className="text-sm font-semibold">Dashboard data connection</h2>
      <p className="mt-2 text-xs leading-6 text-slate-500">No fabricated metrics, charts, activity logs, or revenue figures are rendered. Connect the dashboard metrics, activity, revenue, subscription, and system-health endpoints to populate this page.</p>
    </section>

    <section className={`${panel} overflow-hidden`}>
      <div className="flex flex-wrap items-center justify-between gap-2 p-4">
        <div><h2 className="text-sm font-semibold">School usage and performance</h2><p className="mt-1 text-[10px] text-slate-500">Real school usage rows will appear from the schools API.</p></div>
        <Link to="/superadmin/schools" className="text-[10px] text-[#7b1734]">All schools</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[10px]">
          <thead className="bg-slate-50 text-[9px] uppercase text-slate-500"><tr>{['School', 'Students', 'Staff', 'Subscription', 'Last activity'].map((head) => <th className="p-3" key={head}>{head}</th>)}</tr></thead>
          <tbody>
            {hasRows ? rows.map((school) => <tr key={school.id} className="border-t"><td className="p-3"><Link className="font-medium text-slate-800 hover:text-[#7b1734]" to={`/superadmin/schools/${school.id}`}>{school.name}</Link><p className="mt-0.5 text-[9px] text-slate-400">{school.city}</p></td><td className="p-3">{school.students.toLocaleString('en-IN')}</td><td className="p-3">{(school.teachers + school.staff).toLocaleString('en-IN')}</td><td className="p-3">{school.plan}</td><td className="p-3">{school.activity || '-'}</td></tr>)
              : <tr><td colSpan={5} className="px-4 py-12 text-center text-xs text-slate-500">No school usage records available.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  </div>;
}
