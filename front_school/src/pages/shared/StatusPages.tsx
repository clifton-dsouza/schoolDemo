import { Link } from 'react-router-dom';
export function Unauthorized() { return <Status code="403" title="You don't have access to this page" />; }
export function NotFound() { return <Status code="404" title="We couldn't find that page" />; }
function Status({ code, title }: { code: string; title: string }) {
  return <div className="grid min-h-screen place-items-center p-6 text-center"><div><p className="text-5xl font-bold text-indigo-600">{code}</p>
    <h1 className="mt-3 text-xl font-semibold text-slate-900">{title}</h1>
    <Link to="/app/dashboard" className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">Back to dashboard</Link></div></div>;
}
export default NotFound;
