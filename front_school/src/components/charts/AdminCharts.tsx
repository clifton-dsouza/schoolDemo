import { useMemo, useState } from 'react';

export interface SeriesPoint { label: string; [key: string]: string | number }
export interface ChartSeries { key: string; label: string; color: string }

export function LineChart({ data, series, height = 210, theme = 'dark' }: { data: SeriesPoint[]; series: ChartSeries[]; height?: number; theme?: 'dark'|'light' }) {
  const width = 640;
  const pad = { top: 18, right: 20, bottom: 30, left: 38 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...data.flatMap((point) => series.map((line) => Number(point[line.key] ?? 0))));
  const pointsFor = (key: string) => data.map((point, index) => {
    const value = Number(point[key] ?? 0);
    return { x: pad.left + (data.length < 2 ? 0 : index * innerW / (data.length - 1)), y: pad.top + innerH - value / max * innerH, value, label: point.label };
  });
  const gridColor=theme==='light'?'#e2e8f0':'#2a2c31';
  const labelColor=theme==='light'?'#64748b':'#777b84';
  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2">
        {series.map((line) => <span key={line.key} className={`flex items-center gap-2 text-xs ${theme==='light'?'text-slate-600':'text-slate-400'}`}><i className="size-2 rounded-full" style={{ backgroundColor: line.color }} />{line.label}</span>)}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={series.map((item) => item.label).join(' and ')} className="h-auto w-full overflow-visible">
        {[0, 1, 2, 3].map((tick) => { const y = pad.top + tick * innerH / 3; return <g key={tick}><line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke={gridColor} strokeDasharray="3 5" /><text x={pad.left - 9} y={y + 4} textAnchor="end" fill={labelColor} fontSize="10">{Math.round(max * (3 - tick) / 3)}</text></g>; })}
        {series.map((line) => {
          const pts = pointsFor(line.key);
          const path = pts.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
          return <g key={line.key}><path d={path} fill="none" stroke={line.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" className="chart-line" />{pts.map((point, index) => <g key={`${line.key}-${index}`}><title>{`${point.label}: ${line.label} ${point.value}`}</title><circle cx={point.x} cy={point.y} r="4" fill={line.color} stroke={theme==='light'?'#ffffff':'#191a1e'} strokeWidth="2" className="transition-all hover:r-6" /></g>)}</g>;
        })}
        {data.map((point, index) => <text key={point.label} x={pad.left + (data.length < 2 ? 0 : index * innerW / (data.length - 1))} y={height - 7} textAnchor="middle" fill={labelColor} fontSize="10">{point.label}</text>)}
      </svg>
    </div>
  );
}

export function BarChart({ data, series, horizontal = false, theme = 'dark' }: { data: SeriesPoint[]; series: ChartSeries[]; horizontal?: boolean; theme?: 'dark'|'light' }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.flatMap((point) => series.map((item) => Number(point[item.key] ?? 0))));
  if (horizontal) return (
      <div className="space-y-4">
      {data.map((point, index) => <div key={point.label} onMouseEnter={() => setActive(index)} onMouseLeave={() => setActive(null)}>
        <div className="mb-1.5 flex items-center justify-between text-xs"><span className={theme==='light'?'text-slate-700':'text-slate-300'}>{point.label}</span><span className="text-slate-500">{series.map((item) => `${item.label}: ${point[item.key]}`).join(' · ')}</span></div>
        <div className={`flex h-2 overflow-hidden rounded-full ${theme==='light'?'bg-slate-100':'bg-[#292b30]'}`}>{series.map((item) => <div key={item.key} className="h-full transition-all duration-500" style={{ width: `${Math.max(0, Number(point[item.key] ?? 0)) / max * 100}%`, backgroundColor: item.color, opacity: active === null || active === index ? 1 : 0.45 }} title={`${point.label}: ${point[item.key]}`} />)}</div>
      </div>)}
      <Legend series={series} theme={theme} />
    </div>
  );
  return (
    <div>
      <Legend series={series} theme={theme} />
      <div className={`flex h-48 items-end gap-2 border-b px-1 pt-5 sm:gap-3 ${theme==='light'?'border-slate-200':'border-[#303238]'}`}>
        {data.map((point, index) => <div key={point.label} className="group flex h-full min-w-0 flex-1 flex-col justify-end" onMouseEnter={() => setActive(index)} onMouseLeave={() => setActive(null)}>
          <div className="flex h-full items-end justify-center gap-1">{series.map((item) => <div key={item.key} className="relative w-full max-w-6 rounded-t transition-all duration-500" style={{ height: `${Math.max(2, Number(point[item.key] ?? 0) / max * 100)}%`, background: item.color, opacity: active === null || active === index ? 1 : 0.48 }} title={`${point.label} · ${item.label}: ${point[item.key]}`} />)}</div>
          <span className="mt-2 truncate text-center text-[10px] text-slate-500">{point.label}</span>
        </div>)}
      </div>
    </div>
  );
}

export function DonutChart({ data, totalLabel = 'Students', theme = 'dark' }: { data: { label: string; value: number; color: string }[]; totalLabel?: string; theme?: 'dark'|'light' }) {
  const [active, setActive] = useState<number | null>(null);
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  let cumulative = 0;
  const stops = data.map((item) => {
    const start = cumulative / total * 100;
    cumulative += item.value;
    return `${item.color} ${start}% ${cumulative / total * 100}%`;
  }).join(', ');
  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative grid size-36 shrink-0 place-items-center rounded-full transition-transform" style={{ background: `conic-gradient(${stops})` }} onMouseLeave={() => setActive(null)}>
        <div className={`grid size-24 place-content-center rounded-full text-center ${theme==='light'?'bg-white':'bg-[#1b1c20]'}`}><strong className={`text-xl font-semibold ${theme==='light'?'text-slate-900':'text-white'}`}>{active === null ? total.toLocaleString('en-IN') : data[active].value.toLocaleString('en-IN')}</strong><span className="text-[10px] text-slate-500">{active === null ? totalLabel : data[active].label}</span></div>
      </div>
      <div className="min-w-[130px] flex-1 space-y-2.5">
        {data.map((item, index) => <button key={item.label} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} onMouseLeave={() => setActive(null)} onBlur={() => setActive(null)} className={`flex w-full items-center justify-between gap-3 text-left text-xs transition ${active === null || active === index ? theme==='light'?'text-slate-700':'text-slate-300' : 'text-slate-500'}`}><span className="flex items-center gap-2"><i className="size-2 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span><span className="font-medium tabular-nums">{item.value.toLocaleString('en-IN')}</span></button>)}
      </div>
    </div>
  );
}

function Legend({ series,theme='dark' }: { series: ChartSeries[];theme?:'dark'|'light' }) {
  return <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">{series.map((item) => <span key={item.key} className={`flex items-center gap-2 text-[11px] ${theme==='light'?'text-slate-600':'text-slate-400'}`}><i className="size-2 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>)}</div>;
}
