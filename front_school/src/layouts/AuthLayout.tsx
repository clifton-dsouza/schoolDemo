import { GraduationCap } from 'lucide-react';
import { Outlet } from 'react-router-dom';
export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#1B1E21] p-12 text-[#E7E9EC] lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold"><GraduationCap /> SchoolOS</div>
        <div className="max-w-md">
          <h2 className="text-4xl font-bold leading-tight text-white">Every school, branch and classroom in one place.</h2>
          <p className="mt-4 text-indigo-100">Attendance, students, staff and fees for the whole network, with each person seeing only what belongs to them.</p>
        </div>
        <p className="text-sm text-indigo-200">© SchoolOS</p>
        <div aria-hidden className="absolute -right-24 -top-24 size-96 rounded-full bg-[#8B1E3F]/40" />
      </aside>
      <main className="flex items-center justify-center bg-[#F1F3F5] p-6"><Outlet /></main>
    </div>
  );
}
