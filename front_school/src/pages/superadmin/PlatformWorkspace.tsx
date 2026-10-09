import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, FilePlus2, Search, ShieldCheck, X } from 'lucide-react';

type Definition = {
  title: string;
  description: string;
  endpoint: string;
  columns: string[];
  fields?: string[];
  filters?: string[];
};

const panel = 'rounded-xl border border-slate-200 bg-white shadow-sm';
const reportColumns: Record<string, string[]> = {
  'login-logs': ['User', 'Login time', 'IP address', 'Device', 'Result'],
  'school-usage': ['School', 'Usage period', 'Active users', 'Metric', 'Value'],
  'fee-collections': ['School', 'Collection period', 'Fees collected', 'Outstanding amount', 'Payment result'],
  'income-expense': ['Transaction date', 'Category', 'Description', 'Income', 'Expense', 'Balance'],
  attendance: ['School', 'Period', 'Attendance rate', 'Present count', 'Absent count'],
  'engagement-audit': ['User or school', 'Activity type', 'Timestamp', 'Details'],
  'communication-reports': ['Channel', 'Campaign or message', 'Sent', 'Delivered', 'Failed'],
  'subscription-reports': ['School', 'Plan', 'Subscription state', 'Start date', 'Renewal date'],
  'revenue-reports': ['Revenue period', 'School', 'Revenue source', 'Amount', 'Payment result'],
  'student-statistics': ['School', 'Total students', 'Active students', 'Enrollment breakdown'],
  'teacher-statistics': ['School', 'Total teachers', 'Active teachers', 'Staffing breakdown'],
  'school-performance': ['School', 'Attendance metrics', 'Academic metrics', 'Engagement indicators'],
  'api-reports': ['Endpoint', 'Request count', 'Response status', 'Error count', 'Response time'],
  'ai-reports': ['Model or feature', 'Usage', 'Request count', 'Error count', 'Processing metrics'],
};

const settingsColumns: Record<string, string[]> = {
  settings: ['Setting area', 'Configuration', 'Scope', 'Last updated'],
  general: ['Platform name', 'Locale', 'Timezone', 'Configuration source'],
  'menu-builder': ['Menu item', 'Parent', 'Visibility', 'Permission'],
  'payments-settings': ['Provider', 'Mode', 'Supported methods', 'Connection state'],
  sms: ['Provider', 'Sender ID', 'Delivery route', 'Connection state'],
  email: ['Provider', 'From address', 'SMTP host', 'Connection state'],
  notifications: ['Channel', 'Template', 'Audience', 'Delivery rule'],
  appearance: ['Preference', 'Value', 'Scope', 'Updated by'],
  branding: ['Asset', 'Usage', 'File', 'Updated at'],
  authentication: ['Provider', 'Sign-in method', 'Policy', 'Connection state'],
  'roles-permissions': ['Role', 'Permission group', 'View', 'Create', 'Edit', 'Delete'],
  'feature-flags': ['Feature', 'Audience', 'Rule', 'State'],
  integrations: ['Service', 'Category', 'Connection state', 'Last sync'],
  storage: ['Provider', 'Bucket', 'Usage', 'Connection state'],
  backups: ['Backup job', 'Schedule', 'Last run', 'Result'],
  database: ['Connection', 'Database', 'Region', 'State'],
  'api-settings': ['Setting', 'Value', 'Scope', 'State'],
  'audit-logs': ['Actor', 'Action', 'Module', 'Timestamp', 'IP address'],
};

const websiteColumns: Record<string, string[]> = {
  landing: ['Section', 'Published content', 'Owner', 'Updated at'],
  'visual-builder': ['Page', 'Editable region', 'Draft state', 'Updated at'],
  'website-templates': ['Template', 'Type', 'Assigned schools', 'Updated at'],
  pages: ['Page', 'Slug', 'Publishing state', 'Updated at'],
  navigation: ['Menu', 'Location', 'Items', 'Updated at'],
  sitemap: ['URL', 'Priority', 'Last modified', 'Source page'],
  'preview-site': ['Page', 'Preview URL', 'Published state', 'Updated at'],
  templates: ['Template', 'Category', 'Variables', 'Updated at'],
};

function titleFromSlug(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function definitionFor(pathname: string): Definition {
  const parts = pathname.split('/').filter(Boolean);
  const slug = parts[parts.length - 1] || 'workspace';
  if (pathname === '/superadmin/reports') {
    return {
      title: 'Reports Dashboard',
      description: 'Report catalogue, generation status, date filters, and export controls will use the reporting API.',
      endpoint: '/api/superadmin/reports',
      columns: ['Report', 'Category', 'Generation status', 'Last generated', 'Export formats'],
      filters: ['Date range', 'Category'],
    };
  }
  if (pathname.includes('/reports/attendance')) {
    return reportDefinition('attendance', 'Attendance Trends');
  }
  if (reportColumns[slug]) return reportDefinition(slug, titleFromSlug(slug));
  if (pathname.startsWith('/superadmin/settings/api')) return settingsDefinition('api-settings', 'API Settings');
  if (pathname.startsWith('/superadmin/settings/security')) return settingsDefinition('security', 'Security');
  if (settingsColumns[slug]) return settingsDefinition(slug, titleFromSlug(slug));
  if (pathname.startsWith('/superadmin/website/landing')) return websiteDefinition('landing', 'Landing Page');
  if (websiteColumns[slug]) return websiteDefinition(slug, titleFromSlug(slug));
  if (slug === 'plans') return billingDefinition('plans', 'Plans', ['Plan', 'Price', 'Billing cycle', 'Limits', 'Features']);
  if (slug === 'plan-addons') return billingDefinition('plan-addons', 'Plan Add-ons', ['Add-on', 'Type', 'Price', 'Billing cycle', 'Included plans']);
  if (slug === 'subscriptions') return billingDefinition('subscriptions', 'Subscriptions', ['School', 'Plan', 'Subscription state', 'Start date', 'Renewal date']);
  if (slug === 'payments') return billingDefinition('payments', 'Payments', ['Transaction ID', 'School', 'Invoice', 'Amount', 'Payment result']);
  if (slug === 'invoices') return billingDefinition('invoices', 'Invoices & Billing', ['Invoice ID', 'School', 'Plan', 'Amount', 'Due date', 'Payment result']);
  if (slug === 'payment-history') return billingDefinition('payment-history', 'Payment History', ['Transaction ID', 'School', 'Invoice', 'Amount', 'Method', 'Payment result']);
  if (slug.includes('credits') || slug.includes('comms') || slug === 'usage-history' || slug === 'transactions') {
    return { title: titleFromSlug(slug), description: 'Communication usage and credits require the communications billing API.', endpoint: `/api/superadmin/communication/${slug}`, columns: ['Channel', 'Period', 'Usage', 'Balance', 'Result'], filters: ['Channel', 'Date range'] };
  }
  if (slug === 'support' || slug.includes('ticket') || slug.includes('support') || slug === 'sla-priority') {
    return { title: titleFromSlug(slug === 'support' ? 'support-tickets' : slug), description: 'Support records will appear when the support desk API is connected.', endpoint: `/api/superadmin/support/${slug}`, columns: ['Ticket', 'School', 'Category', 'Priority', 'Assigned agent', 'Updated'], fields: ['Ticket', 'School', 'Category', 'Priority'] };
  }
  if (slug.startsWith('api') || slug === 'webhooks' || slug === 'developer-settings' || slug === 'request-logs') {
    return { title: titleFromSlug(slug), description: 'Developer settings and logs are read from secure backend endpoints.', endpoint: `/api/superadmin/developer/${slug}`, columns: ['Name', 'Scope', 'Last used', 'State'], fields: slug === 'api-keys' ? ['Name', 'Scope'] : undefined };
  }
  return {
    title: titleFromSlug(slug),
    description: 'This workspace is prepared for backend data. No local demonstration records are shown.',
    endpoint: `/api/superadmin/${slug}`,
    columns: ['Name', 'Description', 'Updated at'],
    fields: ['Name', 'Description'],
  };
}

function reportDefinition(slug: string, title: string): Definition {
  return { title, description: `${title} uses dedicated columns, filters, and export controls backed by reporting endpoints.`, endpoint: `/api/superadmin/reports/${slug}`, columns: reportColumns[slug], filters: ['Date range', 'School'] };
}
function settingsDefinition(slug: string, title: string): Definition {
  return { title, description: `${title} settings require secure backend endpoints. Secret values are not exposed in frontend code.`, endpoint: `/api/superadmin/settings/${slug}`, columns: settingsColumns[slug] ?? ['Setting', 'Value', 'Scope', 'Updated at'], fields: ['Setting', 'Value', 'Scope'] };
}
function websiteDefinition(slug: string, title: string): Definition {
  return { title, description: `${title} is separated from other website tools and waits for the CMS/publishing backend.`, endpoint: `/api/superadmin/website/${slug}`, columns: websiteColumns[slug], fields: ['Name', 'Description'] };
}
function billingDefinition(slug: string, title: string, columns: string[]): Definition {
  return { title, description: `${title} will show real billing records from the backend. No payment or subscription values are fabricated.`, endpoint: `/api/superadmin/billing/${slug}`, columns, fields: columns.slice(0, 4), filters: ['School', 'Date range'] };
}

export default function PlatformWorkspace() {
  const { pathname } = useLocation();
  const definition = useMemo(() => definitionFor(pathname), [pathname]);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [dialog, setDialog] = useState(false);

  const exportCsv = () => setNotice(`Export requires backend support: GET ${definition.endpoint}/export. No file was generated.`);
  const save = () => {
    setDialog(false);
    setNotice(`Save requires backend support: POST ${definition.endpoint}. No local record was created.`);
  };

  return <main className="space-y-5 text-slate-900">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#7b1734]">SchoolOS platform</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{definition.title}</h1>
        <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">{definition.description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"><Download className="size-3.5" />Export</button>
        {definition.fields && <button onClick={() => setDialog(true)} className="inline-flex items-center gap-2 rounded-md bg-[#7b1734] px-3 py-2 text-xs font-semibold text-white hover:bg-[#8f2142]"><FilePlus2 className="size-3.5" />Create</button>}
      </div>
    </header>

    {notice && <p role="status" className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notice"><X className="size-3.5" /></button></p>}

    <section className={`${panel} p-4`}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-2.5 size-3.5 text-slate-500" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${definition.title.toLowerCase()}`} className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#7b1734]" />
        </div>
        {definition.filters?.map((filter) => <select key={filter} disabled className="h-9 rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-500"><option>{filter}</option></select>)}
      </div>
      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">Endpoint contract pending: <code>{definition.endpoint}</code></p>
    </section>

    <section className={`${panel} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="bg-slate-50 text-[9px] uppercase tracking-wide text-slate-500">
            <tr>{definition.columns.map((column) => <th key={column} className="whitespace-nowrap px-3 py-3 font-semibold">{column}</th>)}<th className="px-3 py-3">Actions</th></tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={definition.columns.length + 1} className="px-4 py-14 text-center">
                <ShieldCheck className="mx-auto size-8 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-700">No records available.</p>
                <p className="mt-1 text-xs text-slate-500">Data will appear here when records are available from the backend.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-3 py-2.5 text-[10px] text-slate-500">
        <span>Showing 0 records</span>
        <span>No production API action was sent from this page.</span>
      </footer>
    </section>

    {dialog && <div role="dialog" aria-modal="true" className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(false); }}>
      <form onSubmit={(event) => { event.preventDefault(); save(); }} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="text-base font-semibold text-slate-950">Create {definition.title} record</h2><p className="mt-1 text-[10px] text-slate-500">This form will require backend persistence before it can save records.</p></div>
          <button type="button" onClick={() => setDialog(false)} aria-label="Close form" className="text-slate-500"><X className="size-4" /></button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{definition.fields?.map((field) => <label key={field} className="text-[10px] font-medium text-slate-600">{field}<input className="mt-1.5 h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-[#7b1734]" /></label>)}</div>
        <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setDialog(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700">Cancel</button><button className="rounded-lg bg-[#7b1734] px-3 py-2 text-xs font-semibold text-white">Submit</button></div>
      </form>
    </div>}
  </main>;
}
