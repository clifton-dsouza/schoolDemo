import { useQuery } from '@tanstack/react-query';
import { BookOpen, CalendarCheck, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PortalFrame } from '../../components/layout/PortalFrame';
import { EmptyState, PageHeader, Surface } from '../../components/ui/PagePrimitives';
import { listStudents } from '../../services/students';

export default function ParentDashboard() {
  const children = useQuery({ queryKey: ['parent-children'], queryFn: () => listStudents({ page: 1, pageSize: 100, q: '' }), staleTime: 30_000 });
  const records = children.data?.items ?? [];

  return <PortalFrame title="Parent dashboard">
    <PageHeader eyebrow="Parent portal" title="Your children" description="Student access is limited to the children linked to your account." />
    {children.isLoading && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-md bg-slate-200" />)}</div>}
    {children.isError && <Surface className="border-rose-200 p-5 text-sm text-rose-700">Unable to load linked student records. Please refresh the page to try again.</Surface>}
    {!children.isLoading && !children.isError && !records.length && <Surface><EmptyState title="No linked students" detail="Ask your school office to link your account to a student record." /></Surface>}
    {!!records.length && <>
      <div id="children" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{records.map((student) => <Surface key={student.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-medium text-[#8b1e3f]">{student.admission_no}</p><h2 className="mt-1 text-base font-semibold text-slate-900">{student.first_name} {student.last_name}</h2><p className="mt-1 text-xs text-slate-500">Class: {student.class_id ?? 'Not assigned'}{student.section_id ? ` · ${student.section_id}` : ''}</p></div><span className="schoolos-badge">{student.status}</span></div><div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center text-[10px] text-slate-500"><Link to="#attendance" className="rounded-md p-2 hover:bg-slate-50"><CalendarCheck className="mx-auto mb-1 size-4 text-[#8b1e3f]" />Attendance</Link><Link to="#homework" className="rounded-md p-2 hover:bg-slate-50"><BookOpen className="mx-auto mb-1 size-4 text-[#8b1e3f]" />Homework</Link><Link to="#fees" className="rounded-md p-2 hover:bg-slate-50"><Wallet className="mx-auto mb-1 size-4 text-[#8b1e3f]" />Fees</Link></div></Surface>)}</div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3"><Surface className="p-5"><CalendarCheck className="size-5 text-[#8b1e3f]" /><h2 className="mt-3 text-sm font-semibold">Attendance</h2><p className="mt-1 text-xs text-slate-500">Attendance details will appear here when the school has recorded them.</p></Surface><Surface className="p-5"><BookOpen className="size-5 text-[#8b1e3f]" /><h2 className="mt-3 text-sm font-semibold">Homework</h2><p className="mt-1 text-xs text-slate-500">Assigned homework and submission status will appear here.</p></Surface><Surface className="p-5"><Wallet className="size-5 text-[#8b1e3f]" /><h2 className="mt-3 text-sm font-semibold">Fees</h2><p className="mt-1 text-xs text-slate-500">Fee balances and payment history will appear here.</p></Surface></div>
    </>}
  </PortalFrame>;
}
