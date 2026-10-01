import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import StudentLayout from './layouts/StudentLayout';
import { ProtectedRoute, RoleGuard } from './routes/guards';
import { ADMIN_PANEL_ROLES, STUDENT_READERS } from './types/roles';
import { useAuth } from './context/AuthContext';
import { dashboardPath } from './types/roles';

const Login = lazy(() => import('./pages/auth/Login'));
const Dashboard = lazy(() => import('./pages/shared/Dashboard'));
const Students = lazy(() => import('./pages/students/Students'));
const NotFound = lazy(() => import('./pages/shared/StatusPages'));
const Unauthorized = lazy(() => import('./pages/shared/StatusPages').then((m) => ({ default: m.Unauthorized })));
const StudentPortalPage = lazy(() => import('./pages/student/StudentPortalPage'));
const StudentExtraPages = lazy(() => import('./pages/student/StudentExtraPages'));
const StudentLogin = lazy(() => import('./pages/student/StudentLogin'));
const TeacherPortal = lazy(() => import('./pages/teacher/TeacherPortal'));
const ParentDashboard = lazy(() => import('./pages/parent/ParentDashboard'));
const AdminModulePage = lazy(() => import('./components/admin/AdminModulePage'));
const SuperAdminApp = lazy(() => import('./pages/superadmin/SuperAdminApp'));

function DashboardHomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? dashboardPath(user.role) : '/login'} replace />;
}

function AdminPathRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-50"><Loader2 className="size-6 animate-spin text-indigo-600" aria-label="Loading session" /></div>;
  return <Navigate to={user ? dashboardPath(user.role) : '/login'} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-slate-50" role="status" aria-label="Loading SchoolOS"><Loader2 className="size-6 animate-spin text-indigo-600" /></div>}>
      <Routes>
        <Route path="/superadmin/*" element={<SuperAdminApp />} />
        <Route element={<AuthLayout />}><Route path="/login" element={<Login />} /><Route path="/teacher/login" element={<Login />} /><Route path="/admin/login" element={<Login />} /><Route path="/parent/login" element={<StudentLogin />} /></Route>
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard roles={['teacher']} />}><Route path="/teacher/*" element={<TeacherPortal />} /></Route>
          <Route element={<RoleGuard roles={['parent']} />}><Route path="/parent/dashboard" element={<ParentDashboard />} /></Route>
          <Route element={<RoleGuard roles={['student']} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              {['dashboard','profile','academics','subjects','timetable','attendance','exams','results','assignments','submit','homework','classwork','evaluated-sheets','syllabus','materials','fees','payments','notices','messages','events','notifications','documents','support','ptm','surveys','live-classes'].map((page) => <Route key={page} path={page} element={<StudentPortalPage />} />)}
              {['online-exams','study-center','calendar','visits','health','gallery','library','transport'].map((page) => <Route key={page} path={page} element={<StudentExtraPages />} />)}
              <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
            </Route>
          </Route>
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<DashboardHomeRedirect />} />
            <Route element={<RoleGuard roles={ADMIN_PANEL_ROLES} />}><Route path="dashboard" element={<Dashboard />} /></Route>
            <Route element={<RoleGuard roles={STUDENT_READERS} />}><Route path="students" element={<Students />} /></Route>
            <Route path="student-dashboard" element={<Navigate to="/student/dashboard" replace />} />
            <Route element={<RoleGuard roles={['teacher']} />}><Route path="teacher-dashboard" element={<Navigate to="/teacher/dashboard" replace />} /></Route>
            <Route element={<RoleGuard roles={ADMIN_PANEL_ROLES} />}><Route path="modules/:module/:page?" element={<AdminModulePage />} /></Route>
          </Route>
        </Route>
        <Route path="/admin/*" element={<AdminPathRedirect />} />
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
