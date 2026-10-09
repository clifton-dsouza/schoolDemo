import { useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CalendarCheck, Check, FileDown, Plus, Search, Users, X } from 'lucide-react';
import { adminNav, type NavLinkItem } from '../../data/adminNavigation';

type Column = { key: string; label: string };
type ModuleConfig = {
  title: string;
  group: string;
  description: string;
  endpoint: string;
  columns: Column[];
  fields?: { key: string; label: string; type?: string; required?: boolean }[];
  filters?: string[];
  empty: string;
};

const panel = 'rounded-xl border border-slate-200 bg-white shadow-sm';
const input = 'mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#7b1734] focus:ring-2 focus:ring-[#7b1734]/10';
const examTypes = [
  { slug: 'fa1', label: 'FA1' },
  { slug: 'fa2', label: 'FA2' },
  { slug: 'mid-term', label: 'Mid-Term' },
  { slug: 'fa3', label: 'FA3' },
  { slug: 'fa4', label: 'FA4' },
  { slug: 'final', label: 'Final' },
];

const moduleConfigs: Record<string, ModuleConfig> = {
  'students/dashboard': {
    title: 'Student Dashboard',
    group: 'Student information',
    description: 'Student summary widgets will appear after the student dashboard API is connected.',
    endpoint: '/api/student-dashboard',
    columns: [{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }],
    empty: 'No student dashboard records available.',
  },
  'students/profile': {
    title: 'Student Profiles',
    group: 'Student information',
    description: 'Search student profiles without exposing personal details outside authorized modules.',
    endpoint: '/api/students/:id/profile',
    columns: [
      { key: 'admission_no', label: 'Admission number' },
      { key: 'student_name', label: 'Student name' },
      { key: 'class', label: 'Class' },
      { key: 'section', label: 'Section' },
    ],
    empty: 'No student profile records available.',
  },
  'students/religion': {
    title: 'Student Religion',
    group: 'Student information',
    description: 'Authorized users can maintain student religion values when the backend endpoint is available.',
    endpoint: '/api/students/religion',
    columns: [
      { key: 'admission_no', label: 'Admission number' },
      { key: 'student_name', label: 'Student name' },
      { key: 'class', label: 'Class' },
      { key: 'section', label: 'Section' },
      { key: 'religion', label: 'Religion' },
    ],
    fields: [
      { key: 'admission_no', label: 'Student admission number', required: true },
      { key: 'religion', label: 'Religion', required: true },
    ],
    filters: ['Class', 'Section'],
    empty: 'No student religion records available.',
  },
  'students/attendance': {
    title: 'Student Attendance',
    group: 'Attendance',
    description: 'Mark and review attendance records returned by the attendance API.',
    endpoint: '/api/attendance/students',
    columns: [
      { key: 'admission_no', label: 'Admission number' },
      { key: 'student_name', label: 'Student name' },
      { key: 'class', label: 'Class' },
      { key: 'section', label: 'Section' },
      { key: 'date', label: 'Date' },
      { key: 'session', label: 'Session' },
      { key: 'remark', label: 'Remark' },
    ],
    fields: [
      { key: 'admission_no', label: 'Student admission number', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'session', label: 'Session' },
      { key: 'remark', label: 'Remark' },
    ],
    filters: ['Class', 'Section', 'Date'],
    empty: 'No attendance records available.',
  },
  'hr/attendance': {
    title: 'Teacher & Staff Attendance',
    group: 'Attendance',
    description: 'Attendance-only staff records. Payroll and salary fields are intentionally excluded.',
    endpoint: '/api/staff/attendance',
    columns: [
      { key: 'staff_id', label: 'Staff ID' },
      { key: 'staff_name', label: 'Staff name' },
      { key: 'date', label: 'Date' },
      { key: 'check_in', label: 'Check-in time' },
      { key: 'check_out', label: 'Check-out time' },
      { key: 'remark', label: 'Remark' },
    ],
    fields: [
      { key: 'staff_id', label: 'Staff ID', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'check_in', label: 'Check-in time', type: 'time' },
      { key: 'check_out', label: 'Check-out time', type: 'time' },
      { key: 'remark', label: 'Remark' },
    ],
    filters: ['Date', 'Department'],
    empty: 'No teacher or staff attendance records available.',
  },
  'academics/exams': {
    title: 'Examinations',
    group: 'Academics',
    description: 'Select an examination type to retrieve schedules, marks entry, and report-card data.',
    endpoint: '/api/examinations?type={examType}',
    columns: [
      { key: 'academic_year', label: 'Academic year' },
      { key: 'class', label: 'Class' },
      { key: 'section', label: 'Section' },
      { key: 'subject', label: 'Subject' },
      { key: 'exam_date', label: 'Exam date' },
      { key: 'maximum_marks', label: 'Maximum marks' },
    ],
    fields: [
      { key: 'academic_year', label: 'Academic year', required: true },
      { key: 'class', label: 'Class', required: true },
      { key: 'section', label: 'Section' },
      { key: 'subject', label: 'Subject', required: true },
      { key: 'exam_date', label: 'Exam date', type: 'date' },
      { key: 'maximum_marks', label: 'Maximum marks', type: 'number' },
    ],
    filters: ['Academic year', 'Class', 'Section', 'Subject'],
    empty: 'No examination records available.',
  },
  'academics/marks': {
    title: 'Marks & Report Cards',
    group: 'Academics',
    description: 'Marks entry and report-card access are scoped to the selected examination type.',
    endpoint: '/api/examinations/{examType}/marks',
    columns: [
      { key: 'admission_no', label: 'Admission number' },
      { key: 'student_name', label: 'Student name' },
      { key: 'subject', label: 'Subject' },
      { key: 'marks_obtained', label: 'Marks obtained' },
      { key: 'maximum_marks', label: 'Maximum marks' },
    ],
    fields: [
      { key: 'admission_no', label: 'Student admission number', required: true },
      { key: 'subject', label: 'Subject', required: true },
      { key: 'marks_obtained', label: 'Marks obtained', type: 'number', required: true },
      { key: 'maximum_marks', label: 'Maximum marks', type: 'number', required: true },
    ],
    filters: ['Class', 'Section', 'Subject'],
    empty: 'No marks or report-card records available.',
  },
};

function defaultConfig(key: string): ModuleConfig {
  const keyParts = key.split('/');
  const label = humanize(keyParts[keyParts.length - 1] || 'Records');
  return {
    title: label,
    group: titleFor(key).group,
    description: `${label} is ready for backend data. Records are not fabricated in the frontend.`,
    endpoint: `/api/${key}`,
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'updated_at', label: 'Updated at' },
    ],
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'description', label: 'Description' },
    ],
    empty: 'No records available.',
  };
}

export default function AdminModulePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const module = location.pathname.split('/modules/')[1]?.split('/')[0] || 'navigator';
  const page = location.pathname.split('/modules/')[1]?.split('/')[1] || 'overview';
  const key = `${module}/${page}`;
  const config = moduleConfigs[key] ?? defaultConfig(key);
  const isExam = key === 'academics/exams' || key === 'academics/marks';
  const selectedExam = searchParams.get('exam') || 'fa1';
  const [dialog, setDialog] = useState(false);
  const [notice, setNotice] = useState('');
  const columns = useMemo(() => config.columns, [config]);
  const endpoint = config.endpoint.replace('{examType}', selectedExam);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(`Save is waiting for backend support: POST ${endpoint}. No local record was created.`);
    setDialog(false);
  };

  return <div className="space-y-5 pb-8 text-slate-900">
    <PageHeading title={config.title} group={config.group} description={config.description} />
    {isExam && <ExamSelector selected={selectedExam} onSelect={(exam) => setSearchParams({ exam })} />}
    <section className={`${panel} p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <input readOnly placeholder="Search will use backend query parameters" className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 text-xs outline-none" />
        </div>
        <div className="flex flex-wrap gap-2">
          {config.filters?.map((filter) => <select key={filter} disabled className="h-9 rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-500"><option>{filter}</option></select>)}
          <button onClick={() => setNotice(`Export requires backend support: GET ${endpoint}/export`)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 px-3 text-xs text-slate-700"><FileDown className="size-3.5" />Export</button>
          {config.fields && <button onClick={() => setDialog(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#7b1734] px-3 text-xs font-medium text-white"><Plus className="size-3.5" />Add</button>}
        </div>
      </div>
      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        Endpoint contract pending: <code className="font-mono">{endpoint}</code>
      </p>
    </section>
    {notice && <p role="status" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">{notice}</p>}
    <section className={`${panel} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>{columns.map((column) => <th key={column.key} className="px-4 py-3">{column.label}</th>)}<th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length + 1} className="px-4 py-14 text-center">
                <Users className="mx-auto size-8 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-700">{config.empty}</p>
                <p className="mt-1 text-xs text-slate-500">Data will appear here when records are available from the backend.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    {dialog && <RecordDialog title={config.title} fields={config.fields ?? []} onClose={() => setDialog(false)} onSubmit={submit} />}
  </div>;
}

function ExamSelector({ selected, onSelect }: { selected: string; onSelect: (value: string) => void }) {
  return <div className={`${panel} overflow-x-auto p-2`}>
    <div className="flex min-w-max gap-1" role="tablist" aria-label="Examination type">
      {examTypes.map((exam) => <button key={exam.slug} onClick={() => onSelect(exam.slug)} role="tab" aria-selected={selected === exam.slug} className={`rounded-lg px-4 py-2 text-xs font-medium ${selected === exam.slug ? 'bg-[#7b1734] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{exam.label}</button>)}
    </div>
  </div>;
}

function RecordDialog({ title, fields, onClose, onSubmit }: { title: string; fields: NonNullable<ModuleConfig['fields']>; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <form onSubmit={onSubmit} className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#7b1734]">Backend required</p><h2 className="mt-1 text-lg font-semibold text-slate-900">Add {title}</h2></div>
        <button type="button" onClick={onClose} aria-label="Close form" className="text-slate-500"><X className="size-5" /></button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {fields.map((field) => <label key={field.key} className="text-xs font-medium text-slate-600">{field.label}<input name={field.key} type={field.type ?? 'text'} required={field.required} className={input} /></label>)}
      </div>
      <p className="mt-4 flex gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600"><AlertCircle className="size-4 shrink-0" />Submitting this form will not create a local fake record. Connect the backend endpoint to persist changes.</p>
      <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-xs">Cancel</button>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[#7b1734] px-4 py-2 text-xs font-medium text-white"><Check className="size-3.5" />Submit</button>
      </div>
    </form>
  </div>;
}

function PageHeading({ title, group, description }: { title: string; group: string; description: string }) {
  return <header><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7b1734]">{group}</p><h1 className="mt-1 text-2xl font-semibold text-slate-950">{title}</h1><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">{description}</p></header>;
}

function humanize(value: string) { return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase()); }
function titleFor(key: string) {
  for (const group of adminNav) {
    const found = flattenGroup(group.items).find((item) => item.to?.endsWith(`/modules/${key}`));
    if (found) return { title: found.label, group: group.label };
  }
  return { title: humanize(key), group: humanize(key.split('/')[0] || 'Workspace') };
}
function flattenGroup(items: NavLinkItem[]): NavLinkItem[] {
  return items.flatMap((item) => [item, ...(item.children ? flattenGroup(item.children) : [])]);
}
