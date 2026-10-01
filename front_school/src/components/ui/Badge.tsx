const TONES = { green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', slate: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20', indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' };
export function Badge({ tone = 'slate', children }: { tone?: keyof typeof TONES; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}>{children}</span>;
}
