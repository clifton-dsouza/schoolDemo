import { BookOpen, GraduationCap, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-xl bg-indigo-100 text-indigo-700"><GraduationCap className="size-6" /></span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teacher dashboard</h1>
          <p className="mt-1 text-slate-500">Welcome{user.name ? `, ${user.name.split(' ')[0]}` : ''}. You're signed in as a teacher.</p>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Users className="size-5" /></span>
          <h2 className="mt-4 font-semibold text-slate-900">Students</h2>
          <p className="mt-1 text-sm text-slate-500">Browse the student directory from the Students link.</p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><BookOpen className="size-5" /></span>
          <h2 className="mt-4 font-semibold text-slate-900">Classes and subjects</h2>
          <p className="mt-1 text-sm text-slate-500">Class and subject assignment views are not connected yet.</p>
        </section>
      </div>
    </>
  );
}
