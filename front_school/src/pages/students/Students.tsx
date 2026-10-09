import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ArrowDownToLine, ChevronLeft, ChevronRight, FileUp, Plus, Search, Settings2, SlidersHorizontal, Users } from 'lucide-react';
import { listStudents } from '../../services/students';
import { useDebounce } from '../../hooks/useDebounce';

const surface = 'rounded-xl border border-slate-200 bg-white shadow-sm';

export default function Students() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [classFilter, setClassFilter] = useState('All classes');
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const q = useDebounce(search.trim());

  useEffect(() => setPage(1), [q, pageSize]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['students', { page, pageSize, q }],
    queryFn: () => listStudents({ page, pageSize, q }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const items = data?.items ?? [];
  const classes = useMemo(() => [...new Set(items.map((student) => student.class_id).filter(Boolean))], [items]);
  const filtered = items.filter((student) => classFilter === 'All classes' || student.class_id === classFilter);
  const pages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  const csv = () => {
    const content = [
      'Admission Number,Name,Class,Section,Guardian,Phone',
      ...filtered.map((student) => [
        student.admission_no,
        `${student.first_name} ${student.last_name}`,
        student.class_id,
        student.section_id,
        student.guardian_name,
        student.guardian_phone,
      ].map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'students.csv';
    link.click();
    URL.revokeObjectURL(url);
    setNotice('Student list exported.');
  };

  const skeleton = <tr>{Array.from({ length: 8 }, (_, index) => <td key={index} className="px-3 py-5"><span className="block h-3 animate-pulse rounded bg-slate-200" /></td>)}</tr>;

  return <div className="space-y-5 pb-8 text-slate-900">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7b1734]">Student information</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Student list</h1>
        <p className="mt-1 text-xs text-slate-500">Search, filter and manage student records. Data is loaded from the backend.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setNotice('Bulk upload requires a connected import endpoint.')} className="flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-xs text-slate-700 hover:bg-slate-50"><FileUp className="size-3.5" />Bulk upload</button>
        <button onClick={csv} className="flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-xs text-slate-700 hover:bg-slate-50"><ArrowDownToLine className="size-3.5" />Export CSV</button>
        <button onClick={() => navigate('/app/modules/students/admission')} className="flex h-9 items-center gap-2 rounded-md bg-[#7b1734] px-3 text-xs font-medium text-white hover:bg-[#8f2142]"><Plus className="size-4" />Admit student</button>
      </div>
    </header>

    {notice && <button onClick={() => setNotice('')} className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">{notice} Dismiss</button>}

    <section className={`${surface} overflow-hidden`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-500" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or admission number" aria-label="Search students" className="h-8 w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#7b1734]" />
        </div>
        <label className="flex h-8 items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-500">
          <SlidersHorizontal className="size-3.5" />
          <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="max-w-32 bg-transparent text-xs text-slate-700 outline-none">
            <option>All classes</option>
            {classes.map((className) => <option key={className}>{className}</option>)}
          </select>
        </label>
        <button onClick={() => setNotice('Column customization requires a backend-backed student field configuration.')} title="Customize columns" className="grid size-8 place-items-center rounded-md border border-slate-300 text-slate-500 hover:bg-slate-50"><Settings2 className="size-3.5" /></button>
      </div>

      {selected.length > 0 && <div className="flex items-center justify-between border-b border-slate-200 bg-rose-50 px-4 py-2 text-xs text-[#7b1734]">{selected.length} selected<button onClick={() => { setSelected([]); setNotice('Selection cleared.'); }} className="font-medium">Clear</button></div>}
      {isError && <div className="m-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error.message}<button onClick={() => void refetch()} className="ml-3 underline">Retry</button></div>}

      <div className="overflow-x-auto">
        <table className={`w-full min-w-[900px] text-left text-xs ${isFetching ? 'opacity-60' : ''}`}>
          <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3"><input type="checkbox" aria-label="Select current page" checked={filtered.length > 0 && selected.length === filtered.length} onChange={() => setSelected(selected.length === filtered.length ? [] : filtered.map((student) => student.id))} /></th>
              <th className="px-3 py-3">Admission no.</th>
              <th className="px-3 py-3">Student</th>
              <th className="px-3 py-3">Class</th>
              <th className="px-3 py-3">Section</th>
              <th className="px-3 py-3">Guardian</th>
              <th className="px-3 py-3">Phone</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? Array.from({ length: 7 }, (_, index) => <tr key={index}>{skeleton.props.children}</tr>) : filtered.map((student) => <tr key={student.id} className="hover:bg-slate-50">
              <td className="px-3 py-3"><input type="checkbox" checked={selected.includes(student.id)} onChange={() => setSelected((current) => current.includes(student.id) ? current.filter((id) => id !== student.id) : [...current, student.id])} /></td>
              <td className="px-3 py-3 font-mono text-[10px] text-slate-500">{student.admission_no}</td>
              <td className="px-3 py-3"><div className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-full bg-rose-50 text-[10px] font-semibold text-[#7b1734]">{student.first_name[0]}{student.last_name[0]}</span><span className="font-medium text-slate-900">{student.first_name} {student.last_name}</span></div></td>
              <td className="px-3 py-3 text-slate-600">{student.class_id || '-'}</td>
              <td className="px-3 py-3 text-slate-600">{student.section_id || '-'}</td>
              <td className="px-3 py-3 text-slate-600">{student.guardian_name || '-'}</td>
              <td className="px-3 py-3 text-slate-600">{student.guardian_phone || '-'}</td>
              <td className="px-3 py-3"><button onClick={() => setNotice(`Profile route pending for ${student.first_name} ${student.last_name}.`)} className="rounded border border-slate-300 px-2 py-1 text-[10px] text-slate-700 hover:bg-slate-50">View profile</button></td>
            </tr>)}
            {!isLoading && !isError && !filtered.length && <tr><td colSpan={8} className="py-12 text-center"><Users className="mx-auto size-7 text-slate-300" /><p className="mt-2 text-xs text-slate-500">No students found.</p></td></tr>}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-3 py-3 text-[11px] text-slate-500">
        <span>Page {page} of {pages}</span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5">Rows<select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded border border-slate-300 bg-white px-1.5 py-1 text-slate-700">{[10, 25, 50, 100].map((size) => <option key={size}>{size}</option>)}</select></label>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="grid size-7 place-items-center rounded border border-slate-300 disabled:opacity-40"><ChevronLeft className="size-3.5" /></button>
          <span>Page {page}</span>
          <button disabled={!data || data.items.length < pageSize} onClick={() => setPage(page + 1)} className="grid size-7 place-items-center rounded border border-slate-300 disabled:opacity-40"><ChevronRight className="size-3.5" /></button>
        </div>
      </footer>
    </section>
  </div>;
}
