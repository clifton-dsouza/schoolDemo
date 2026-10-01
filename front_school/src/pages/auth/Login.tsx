import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardPath } from '../../types/roles';
import { DEMO_ACCOUNTS } from '../../services/demoAccounts';

const schema = z.object({ email: z.string().min(1, 'Enter your email').email('Enter a valid email'), password: z.string().min(1, 'Enter your password') });
type Form = z.infer<typeof schema>;
const input = 'mt-1.5 w-full rounded-lg border border-[#D6DADE] bg-white px-3.5 py-2.5 text-sm text-[#20242A] shadow-sm caret-[#8B1E3F] placeholder:text-[#7A828C] focus:border-[#8B1E3F] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/20';

export default function Login() {
  const { user, signIn } = useAuth();
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });
  if (user) return <Navigate to={dashboardPath(user.role)} replace />;

  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    try { const role = await signIn(v.email, v.password); nav(dashboardPath(role), { replace: true }); }
    catch (e) { setError(e instanceof Error ? e.message : 'Sign in failed'); }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="w-full max-w-sm rounded-xl border border-[#D6DADE] bg-white p-6 shadow-sm sm:p-7">
      <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Sign in to your SchoolOS account.</p>
      {error && <div role="alert" className="mt-6 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 size-4 shrink-0" />{error}</div>}
      <label className="mt-6 block text-sm font-medium">Email
        <input type="email" autoComplete="username" placeholder="you@school.edu" className={input} aria-invalid={!!errors.email} {...register('email')} />
        {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email.message}</span>}
      </label>
      <label className="mt-4 block text-sm font-medium">Password
        <div className="relative">
          <input type={show ? 'text' : 'password'} autoComplete="current-password" className={input + ' pr-11'} aria-invalid={!!errors.password} {...register('password')} />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-3 rounded p-1 text-slate-400 hover:text-slate-600">
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && <span className="mt-1 block text-xs text-red-600">{errors.password.message}</span>}
      </label>
      <button disabled={isSubmitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#8B1E3F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#741832] disabled:opacity-60">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}{isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
      <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3" aria-label="Development demo accounts">
        <div className="mb-2"><h2 className="text-xs font-semibold text-slate-800">Demo accounts · Development</h2><p className="mt-0.5 text-[10px] text-slate-500">Select a role to fill the form. Click Sign in to continue.</p></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{DEMO_ACCOUNTS.map((account) => <button key={account.role} type="button" onClick={() => { setValue('email', account.email, { shouldValidate: true }); setValue('password', account.password, { shouldValidate: true }); setError(null); }} className="rounded-md border border-slate-200 bg-white px-2 py-2 text-[10px] font-medium text-slate-700 transition hover:border-[#B52D55] hover:bg-[#F9EEF1]">{account.label}</button>)}</div>
      </section>
    </form>
  );
}
