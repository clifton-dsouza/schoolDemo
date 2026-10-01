import { z } from 'zod';

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  ALLOWED_ORIGIN: string;
}

type Role = 'platform_owner' | 'school_admin' | 'branch_admin' | 'teacher' | 'accountant' | 'student' | 'parent' | 'driver';
type TokenKind = 'access' | 'refresh';
interface Session { sub: string; sid: string; role: Role; schoolId: string | null; branchId: string | null; exp: number; kind: TokenKind }

// ---------- responses ----------
const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
const ok = (data: unknown, message = 'OK') => json({ success: true, data, message });
const fail = (status: number, message: string, errors: Record<string, string> = {}) =>
  json({ success: false, message, errors, error: { code: status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : status === 404 ? 'NOT_FOUND' : status === 422 ? 'VALIDATION_ERROR' : 'REQUEST_FAILED', message } }, status);

// ---------- crypto (Web Crypto only) ----------
const enc = new TextEncoder();
const b64u = (b: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function hmacKey(secret: string) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function signJwt(payload: Session, secret: string) {
  const body = `${b64u(enc.encode('{"alg":"HS256","typ":"JWT"}'))}.${b64u(enc.encode(JSON.stringify(payload)))}`;
  return `${body}.${b64u(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(body)))}`;
}
async function verifyJwt(token: string, secret: string): Promise<Session | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || parts.some((part) => !part)) return null;
    const [h, p, signature] = parts;
    const valid = await crypto.subtle.verify('HMAC', await hmacKey(secret), unb64u(signature), enc.encode(`${h}.${p}`));
    if (!valid) return null;
    const value = JSON.parse(new TextDecoder().decode(unb64u(p))) as Partial<Session>;
    const roles: Role[] = ['platform_owner', 'school_admin', 'branch_admin', 'teacher', 'accountant', 'student', 'parent', 'driver'];
    if (typeof value.sub !== 'string' || typeof value.sid !== 'string' || !roles.includes(value.role as Role) || !['access', 'refresh'].includes(value.kind as TokenKind) || typeof value.exp !== 'number' ||
        !(value.schoolId === null || typeof value.schoolId === 'string') || !(value.branchId === null || typeof value.branchId === 'string')) return null;
    return value.exp > Date.now() / 1000 ? value as Session : null;
  } catch {
    return null;
  }
}

// Stored format: pbkdf2$<iterations>$<saltB64u>$<hashB64u>
const ITER = 100_000; // Workers caps PBKDF2 at 100k iterations
async function pbkdf2(password: string, salt: Uint8Array, iter: number) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const saltBuffer = new ArrayBuffer(salt.byteLength);
  new Uint8Array(saltBuffer).set(salt);
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: saltBuffer, iterations: iter }, key, 256);
}
export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITER}$${b64u(salt)}$${b64u(await pbkdf2(password, salt, ITER))}`;
}
async function checkPassword(password: string, stored: string) {
  try {
    const parts = stored.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
    const [, iterText, salt, hash] = parts;
    const iter = Number(iterText);
    if (!Number.isInteger(iter) || iter < 1 || iter > ITER || !salt || !hash) return false;
    const got = new Uint8Array(await pbkdf2(password, unb64u(salt), iter));
    const want = unb64u(hash);
  if (got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got[i] ^ want[i];
    return diff === 0;
  } catch {
    return false;
  }
}

// ---------- RBAC + tenant scope ----------
const PERMISSIONS: Record<string, Role[]> = {
  'students:read': ['platform_owner', 'school_admin', 'branch_admin', 'teacher', 'accountant', 'parent'],
  'schools:read': ['platform_owner'],
};
const can = (s: Session, perm: string) => PERMISSIONS[perm]?.includes(s.role) ?? false;

/** Tenant scope comes ONLY from the verified session, never from request params. */
function scope(s: Session): { sql: string; args: string[] } {
  if (s.role === 'platform_owner') return { sql: '1=1', args: [] };
  if (!s.schoolId) throw new Error('Session missing school');
  if (s.branchId && s.role !== 'school_admin') return { sql: 'school_id = ? AND branch_id = ?', args: [s.schoolId, s.branchId] };
  return { sql: 'school_id = ?', args: [s.schoolId] };
}

async function audit(env: Env, s: Session | null, action: string, req: Request, entity?: string, id?: string) {
  await env.DB.prepare('INSERT INTO audit_logs (id, school_id, user_id, action, entity, entity_id, ip) VALUES (?,?,?,?,?,?,?)')
    .bind(crypto.randomUUID(), s?.schoolId ?? null, s?.sub ?? null, action, entity ?? null, id ?? null, req.headers.get('CF-Connecting-IP')).run();
}

const accessSeconds = 15 * 60;
const refreshSeconds = 7 * 24 * 3600;
const maximumSessionSeconds = 30 * 24 * 3600;
const cookie = (name: string, token: string, maxAge: number, secure: boolean) => `${name}=${token}; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=${maxAge}`;
const cookieValue = (req: Request, name: string) => new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(req.headers.get('Cookie') ?? '')?.[1];
const secureCookies = (req: Request) => new URL(req.url).protocol === 'https:';
const withCookies = (res: Response, ...values: string[]) => { values.forEach((value) => res.headers.append('Set-Cookie', value)); return res; };

function sessionPayload(user: { id: string; role: Role; school_id: string | null; branch_id: string | null }, sid: string, kind: TokenKind, lifetime: number): Session {
  return { sub: user.id, sid, role: user.role, schoolId: user.school_id, branchId: user.branch_id, kind, exp: Math.floor(Date.now() / 1000) + lifetime };
}

async function authenticated(req: Request, env: Env): Promise<Session | null> {
  const token = cookieValue(req, 'sos_session');
  const session = token ? await verifyJwt(token, env.JWT_SECRET) : null;
  if (!session || session.kind !== 'access') return null;
  const stored = await env.DB.prepare("SELECT id FROM sessions WHERE id = ? AND user_id = ? AND revoked_at IS NULL AND expires_at > datetime('now') AND absolute_expires_at > datetime('now')")
    .bind(session.sid, session.sub).first<{ id: string }>();
  if (!stored) return null;
  await env.DB.prepare("UPDATE sessions SET last_seen_at = datetime('now') WHERE id = ?").bind(session.sid).run();
  return session;
}

async function refreshSession(req: Request, env: Env): Promise<Session | null> {
  const token = cookieValue(req, 'sos_refresh');
  const session = token ? await verifyJwt(token, env.JWT_SECRET) : null;
  if (!session || session.kind !== 'refresh') return null;
  const stored = await env.DB.prepare("SELECT id FROM sessions WHERE id = ? AND user_id = ? AND revoked_at IS NULL AND expires_at > datetime('now') AND absolute_expires_at > datetime('now')")
    .bind(session.sid, session.sub).first<{ id: string }>();
  return stored ? session : null;
}

const loginSchema = z.object({ email: z.string().trim().min(1).max(254), password: z.string().min(1).max(1024) });
const studentSchema = z.object({
  admissionNo: z.string().trim().min(1, 'Admission number is required').max(80),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  schoolId: z.string().uuid().optional(), branchId: z.string().uuid().optional(),
  classId: z.string().uuid().nullable().optional(), sectionId: z.string().uuid().nullable().optional(),
  guardianName: z.string().trim().max(200).nullable().optional(), guardianPhone: z.string().trim().max(40).nullable().optional(), guardianEmail: z.string().trim().email().max(254).nullable().optional(),
});
const validationFailure = (result: z.SafeParseError<unknown>) => fail(422, 'Please correct the highlighted fields.', Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0] ?? 'request'), issue.message])));

// ---------- handlers ----------
async function login(req: Request, env: Env) {
  const parsed = loginSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return validationFailure(parsed);
  const { password } = parsed.data;
  const identifier = parsed.data.email.toLowerCase();
  const ip = req.headers.get('CF-Connecting-IP') ?? 'unknown';
  const [sourceAttempts, accountSourceAttempts] = await env.DB.batch([
    env.DB.prepare("SELECT COUNT(*) AS count FROM login_attempts WHERE ip = ? AND success = 0 AND created_at >= datetime('now', '-15 minutes')").bind(ip),
    env.DB.prepare("SELECT COUNT(*) AS count FROM login_attempts WHERE email = ? AND ip = ? AND success = 0 AND created_at >= datetime('now', '-15 minutes')").bind(identifier, ip),
  ]);
  const sourceFailures = (sourceAttempts?.results[0] as { count: number } | undefined)?.count ?? 0;
  const accountSourceFailures = (accountSourceAttempts?.results[0] as { count: number } | undefined)?.count ?? 0;
  if (sourceFailures >= 20 || accountSourceFailures >= 5) {
    return fail(429, 'Too many sign-in attempts. Please wait before trying again.');
  }
  let u = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').bind(identifier).first<any>();
  // Students may sign in with their school-issued admission number. Require a unique,
  // linked student record so duplicate admission numbers across schools cannot select
  // an arbitrary account. Other roles continue to authenticate by email only.
  if (!u) {
    const matches = await env.DB.prepare(
      `SELECT u.* FROM users u JOIN students s ON s.user_id = u.id
       WHERE lower(s.admission_no) = ? AND u.role = 'student' AND u.is_active = 1 LIMIT 2`,
    ).bind(identifier).all<any>();
    if (matches.results.length === 1) u = matches.results[0];
  }
  // Same message for unknown user / wrong password to avoid account enumeration
  if (!u || !(await checkPassword(password, u.password_hash))) {
    await env.DB.prepare('INSERT INTO login_attempts (id, email, success, ip) VALUES (?,?,0,?)').bind(crypto.randomUUID(), identifier, ip).run();
    return fail(401, 'Invalid credentials');
  }
  const sid = crypto.randomUUID();
  const access = sessionPayload(u, sid, 'access', accessSeconds);
  const refresh = sessionPayload(u, sid, 'refresh', refreshSeconds);
  await env.DB.batch([
    env.DB.prepare("INSERT INTO sessions (id, user_id, expires_at, absolute_expires_at) VALUES (?, ?, datetime('now', '+7 days'), datetime('now', '+30 days'))").bind(sid, u.id),
    env.DB.prepare('INSERT INTO login_attempts (id, email, success, ip) VALUES (?,?,1,?)').bind(crypto.randomUUID(), identifier, ip),
  ]);
  await env.DB.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").bind(u.id).run();
  await audit(env, access, 'auth.login', req);
  return withCookies(
    json({ success: true, data: { user: { id: u.id, name: u.name, role: u.role, schoolId: u.school_id, branchId: u.branch_id } }, message: 'Signed in' }),
    cookie('sos_session', await signJwt(access, env.JWT_SECRET), accessSeconds, secureCookies(req)),
    cookie('sos_refresh', await signJwt(refresh, env.JWT_SECRET), refreshSeconds, secureCookies(req)),
  );
}

async function changePassword(req: Request, env: Env, session: Session) {
  const { currentPassword, newPassword } = (await req.json().catch(() => ({}))) as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword || newPassword.length < 12) {
    return fail(422, 'Enter your current password and a new password of at least 12 characters.', {
      currentPassword: currentPassword ? '' : 'Required', newPassword: !newPassword ? 'Required' : 'Use at least 12 characters',
    });
  }
  const user = await env.DB.prepare('SELECT password_hash FROM users WHERE id = ? AND is_active = 1').bind(session.sub).first<{ password_hash: string }>();
  if (!user || !(await checkPassword(currentPassword, user.password_hash))) return fail(401, 'Current password is incorrect.');
  if (await checkPassword(newPassword, user.password_hash)) return fail(422, 'Choose a password you have not used before.');
  const passwordHash = await hashPassword(newPassword);
  await env.DB.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").bind(passwordHash, session.sub).run();
  await audit(env, session, 'auth.password_changed', req, 'user', session.sub);
  return ok(null, 'Password updated');
}

async function listStudents(url: URL, s: Session, env: Env) {
  const rawPage = Number(url.searchParams.get('page') ?? 1);
  const rawSize = Number(url.searchParams.get('pageSize') ?? url.searchParams.get('limit') ?? 20);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const size = Number.isSafeInteger(rawSize) && rawSize > 0 ? Math.min(100, rawSize) : 20;
  const q = `%${(url.searchParams.get('q') ?? url.searchParams.get('search') ?? '').replace(/[%_]/g, '')}%`;
  const sc = scope(s);
  const teacherJoin = s.role === 'teacher'
    ? ` AND EXISTS (SELECT 1 FROM teacher_assignments ta JOIN teachers t ON t.id = ta.teacher_id WHERE t.user_id = ? AND ta.class_id = students.class_id AND (ta.section_id IS NULL OR ta.section_id = students.section_id))`
    : '';
  const parentJoin = s.role === 'parent' ? ' AND EXISTS (SELECT 1 FROM parent_students ps WHERE ps.parent_id = ? AND ps.student_id = students.id)' : '';
  const accessArgs = s.role === 'teacher' || s.role === 'parent' ? [s.sub] : [];
  const rows = await env.DB.prepare(
    `SELECT id, admission_no, first_name, last_name, class_id, section_id, guardian_name, guardian_phone, status FROM students
     WHERE ${sc.sql}${teacherJoin}${parentJoin} AND (first_name LIKE ? OR last_name LIKE ? OR admission_no LIKE ?)
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
  ).bind(...sc.args, ...accessArgs, q, q, q, size, (page - 1) * size).all();
  const total = await env.DB.prepare(
    `SELECT COUNT(*) AS count FROM students WHERE ${sc.sql}${teacherJoin}${parentJoin} AND (first_name LIKE ? OR last_name LIKE ? OR admission_no LIKE ?)`,
  ).bind(...sc.args, ...accessArgs, q, q, q).first<{ count: number }>();
  return ok({ items: rows.results, page, pageSize: size, total: total?.count ?? 0 });
}

const schoolManagers: Role[] = ['platform_owner', 'school_admin', 'branch_admin'];
const canManageStudents = (session: Session) => schoolManagers.includes(session.role);

async function getStudent(id: string, s: Session, env: Env) {
  const sc = scope(s);
  const own = s.role === 'student' ? ' AND students.user_id = ?' : '';
  const teacherJoin = s.role === 'teacher'
    ? ` AND EXISTS (SELECT 1 FROM teacher_assignments ta JOIN teachers t ON t.id = ta.teacher_id WHERE t.user_id = ? AND ta.class_id = students.class_id AND (ta.section_id IS NULL OR ta.section_id = students.section_id))`
    : '';
  const parentJoin = s.role === 'parent' ? ' AND EXISTS (SELECT 1 FROM parent_students ps WHERE ps.parent_id = ? AND ps.student_id = students.id)' : '';
  const accessArgs = s.role === 'student' || s.role === 'teacher' || s.role === 'parent' ? [s.sub] : [];
  const row = await env.DB.prepare(
    `SELECT students.id, admission_no, first_name, last_name, dob, gender, class_id, section_id, guardian_name, guardian_phone, guardian_email, status
     FROM students WHERE students.id = ? AND ${sc.sql}${own}${teacherJoin}${parentJoin}`,
  ).bind(id, ...sc.args, ...accessArgs).first();
  return row ? ok(row) : fail(404, 'Student not found');
}

async function createStudent(req: Request, s: Session, env: Env) {
  if (!canManageStudents(s)) return fail(403, 'You do not have permission to create students.');
  const parsed = studentSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return validationFailure(parsed);
  const value = parsed.data;
  const schoolId = s.role === 'platform_owner' ? value.schoolId : s.schoolId;
  if (!schoolId) return fail(422, 'Select a school before adding a student.', { schoolId: 'Required for platform owners' });
  const branchId = s.role === 'platform_owner'
    ? value.branchId ?? (await env.DB.prepare('SELECT id FROM branches WHERE school_id = ? ORDER BY created_at LIMIT 1').bind(schoolId).first<{ id: string }>())?.id
    : s.branchId ?? (await env.DB.prepare('SELECT id FROM branches WHERE school_id = ? ORDER BY created_at LIMIT 1').bind(schoolId).first<{ id: string }>())?.id;
  if (!branchId) return fail(422, 'A school branch is required before adding students.');
  const branch = await env.DB.prepare('SELECT id FROM branches WHERE id = ? AND school_id = ?').bind(branchId, schoolId).first();
  if (!branch) return fail(422, 'The selected branch does not belong to the selected school.', { branchId: 'Invalid branch' });
  if (value.classId) {
    const classRow = await env.DB.prepare('SELECT id FROM classes WHERE id = ? AND school_id = ? AND branch_id = ?').bind(value.classId, schoolId, branchId).first();
    if (!classRow) return fail(422, 'The selected class does not belong to this branch.', { classId: 'Invalid class' });
  }
  if (value.sectionId) {
    const section = await env.DB.prepare('SELECT id FROM sections WHERE id = ? AND school_id = ? AND class_id = ?').bind(value.sectionId, schoolId, value.classId).first();
    if (!section) return fail(422, 'The selected section does not belong to the selected class.', { sectionId: 'Invalid section' });
  }
  const id = crypto.randomUUID();
  try {
    await env.DB.prepare('INSERT INTO students (id, school_id, branch_id, admission_no, first_name, last_name, class_id, section_id, guardian_name, guardian_phone, guardian_email) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .bind(id, schoolId, branchId, value.admissionNo, value.firstName, value.lastName, value.classId ?? null, value.sectionId ?? null, value.guardianName ?? null, value.guardianPhone ?? null, value.guardianEmail ?? null).run();
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (/unique constraint failed: students\.school_id, students\.admission_no/i.test(message)) return fail(409, 'A student with this admission number already exists.');
    if (/foreign key constraint failed/i.test(message)) return fail(422, 'One of the selected relationships no longer exists.');
    if (/database|connection|d1_error|network/i.test(message)) return fail(503, 'Unable to complete the request. Please try again.');
    console.error('student.create', error);
    return fail(500, 'Unable to create the student right now.');
  }
  await audit(env, s, 'student.created', req, 'student', id);
  return ok({ id }, 'Student created');
}

async function updateStudent(req: Request, id: string, s: Session, env: Env) {
  if (!canManageStudents(s)) return fail(403, 'You do not have permission to update students.');
  const value = await req.json().catch(() => ({})) as Record<string, unknown>;
  const allowed = ['firstName', 'lastName', 'classId', 'sectionId', 'guardianName', 'guardianPhone', 'guardianEmail', 'status'] as const;
  const columns: Record<string, string> = { firstName: 'first_name', lastName: 'last_name', classId: 'class_id', sectionId: 'section_id', guardianName: 'guardian_name', guardianPhone: 'guardian_phone', guardianEmail: 'guardian_email', status: 'status' };
  const values = allowed.filter((key) => value[key] !== undefined);
  if (!values.length) return fail(422, 'No supported changes were provided.');
  if (typeof value.status === 'string' && !['active', 'inactive', 'graduated', 'transferred'].includes(value.status)) return fail(422, 'Invalid student status.');
  const sc = scope(s);
  const result = await env.DB.prepare(`UPDATE students SET ${values.map((key) => `${columns[key]} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ? AND ${sc.sql}`)
    .bind(...values.map((key) => value[key] ?? null), id, ...sc.args).run();
  if (!result.meta.changes) return fail(404, 'Student not found');
  await audit(env, s, 'student.updated', req, 'student', id);
  return ok({ id }, 'Student updated');
}

async function deleteStudent(req: Request, id: string, s: Session, env: Env) {
  if (!canManageStudents(s)) return fail(403, 'You do not have permission to delete students.');
  const sc = scope(s);
  const result = await env.DB.prepare(`DELETE FROM students WHERE id = ? AND ${sc.sql}`).bind(id, ...sc.args).run();
  if (!result.meta.changes) return fail(404, 'Student not found');
  await audit(env, s, 'student.deleted', req, 'student', id);
  return ok(null, 'Student deleted');
}

async function refresh(req: Request, env: Env, session: Session) {
  const user = await env.DB.prepare('SELECT id, role, school_id, branch_id FROM users WHERE id = ? AND is_active = 1').bind(session.sub).first<{ id: string; role: Role; school_id: string | null; branch_id: string | null }>();
  if (!user) return fail(401, 'Not authenticated');
  const sid = crypto.randomUUID();
  const access = sessionPayload(user, sid, 'access', accessSeconds);
  const nextRefresh = sessionPayload(user, sid, 'refresh', refreshSeconds);
  const rotated = await env.DB.batch([
    env.DB.prepare("UPDATE sessions SET revoked_at = datetime('now') WHERE id = ? AND revoked_at IS NULL").bind(session.sid),
    env.DB.prepare("INSERT INTO sessions (id, user_id, expires_at, absolute_expires_at) SELECT ?, ?, datetime('now', '+7 days'), absolute_expires_at FROM sessions WHERE id = ? AND absolute_expires_at > datetime('now')").bind(sid, session.sub, session.sid),
  ]);
  if (!rotated[1].meta.changes) return fail(401, 'Session has expired. Please sign in again.');
  return withCookies(
    json({ success: true, data: { expiresAt: access.exp }, message: 'Session refreshed' }),
    cookie('sos_session', await signJwt(access, env.JWT_SECRET), accessSeconds, secureCookies(req)),
    cookie('sos_refresh', await signJwt(nextRefresh, env.JWT_SECRET), refreshSeconds, secureCookies(req)),
  );
}

async function listNotifications(url: URL, s: Session, env: Env) {
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') ?? 30) || 30));
  const rows = await env.DB.prepare('SELECT id, type, title, body, resource_type, resource_id, read_at, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
    .bind(s.sub, limit).all();
  const unread = await env.DB.prepare('SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read_at IS NULL').bind(s.sub).first<{ count: number }>();
  return ok({ items: rows.results, unreadCount: unread?.count ?? 0 });
}

async function markNotificationRead(req: Request, id: string, s: Session, env: Env) {
  const result = await env.DB.prepare("UPDATE notifications SET read_at = COALESCE(read_at, datetime('now')) WHERE id = ? AND user_id = ?").bind(id, s.sub).run();
  if (!result.meta.changes) return fail(404, 'Notification not found');
  await audit(env, s, 'notification.read', req, 'notification', id);
  return ok({ id }, 'Notification marked as read');
}

async function dashboard(s: Session, env: Env) {
  const sc = scope(s);
  const [students, teachers, attendance, fees] = await env.DB.batch([
    env.DB.prepare(`SELECT COUNT(*) AS count FROM students WHERE ${sc.sql}`).bind(...sc.args),
    env.DB.prepare(`SELECT COUNT(*) AS count FROM teachers WHERE ${sc.sql}`).bind(...sc.args),
    env.DB.prepare(`SELECT COUNT(*) AS count, SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present FROM attendance_records WHERE ${sc.sql} AND date = date('now')`).bind(...sc.args),
    env.DB.prepare(`SELECT COUNT(*) AS count, COALESCE(SUM(amount_cents), 0) AS outstandingCents FROM student_fees WHERE ${sc.sql} AND status IN ('pending','partial','overdue')`).bind(...sc.args),
  ]);
  return ok({ students: students.results[0], teachers: teachers.results[0], attendance: attendance.results[0], fees: fees.results[0] });
}

async function studentRecord(s: Session, env: Env) {
  return env.DB.prepare('SELECT id, class_id, section_id FROM students WHERE user_id = ? AND school_id = ?').bind(s.sub, s.schoolId).first<{ id: string; class_id: string; section_id: string | null }>();
}

async function studentDashboard(s: Session, env: Env) {
  if (s.role !== 'student') return fail(403, 'Forbidden');
  const student = await studentRecord(s, env);
  if (!student) return fail(404, 'Student profile not found');
  const [attendance, homework, exams, fees] = await env.DB.batch([
    env.DB.prepare("SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END), 0) AS present FROM attendance_records WHERE student_id = ?").bind(student.id),
    env.DB.prepare("SELECT COUNT(*) AS count FROM homework h WHERE h.school_id = ? AND h.status = 'published' AND h.class_id = ? AND (h.section_id IS NULL OR h.section_id = ?) AND NOT EXISTS (SELECT 1 FROM homework_submissions hs WHERE hs.homework_id = h.id AND hs.student_id = ?)").bind(s.schoolId, student.class_id, student.section_id, student.id),
    env.DB.prepare("SELECT COUNT(*) AS count FROM exam_schedules es JOIN exams e ON e.id = es.exam_id WHERE es.school_id = ? AND es.class_id = ? AND (es.section_id IS NULL OR es.section_id = ?) AND e.status IN ('scheduled','published') AND es.scheduled_at >= datetime('now')").bind(s.schoolId, student.class_id, student.section_id),
    env.DB.prepare("SELECT COUNT(*) AS count, COALESCE(SUM(amount_cents), 0) AS outstandingCents FROM student_fees WHERE student_id = ? AND status IN ('pending','partial','overdue')").bind(student.id),
  ]);
  const record = attendance.results[0] as { total: number; present: number };
  return ok({ attendancePercent: record.total ? Math.round((record.present / record.total) * 10000) / 100 : 0, homeworkPending: homework.results[0], upcomingExams: exams.results[0], fees: fees.results[0] });
}

async function teacherDashboard(s: Session, env: Env) {
  if (s.role !== 'teacher') return fail(403, 'Forbidden');
  const teacher = await env.DB.prepare('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?').bind(s.sub, s.schoolId).first<{ id: string }>();
  if (!teacher) return fail(404, 'Teacher profile not found');
  const [classes, students, timetable, homework] = await env.DB.batch([
    env.DB.prepare('SELECT COUNT(*) AS count FROM teacher_assignments WHERE teacher_id = ?').bind(teacher.id),
    env.DB.prepare('SELECT COUNT(DISTINCT s.id) AS count FROM students s JOIN teacher_assignments ta ON ta.class_id = s.class_id AND (ta.section_id IS NULL OR ta.section_id = s.section_id) WHERE ta.teacher_id = ?').bind(teacher.id),
    env.DB.prepare("SELECT COUNT(*) AS count FROM timetable_entries WHERE teacher_id = ? AND day_of_week = cast(strftime('%w', 'now') AS INTEGER)").bind(teacher.id),
    env.DB.prepare("SELECT COUNT(*) AS count FROM homework WHERE created_by = ? AND status = 'draft'").bind(s.sub),
  ]);
  return ok({ assignedClasses: classes.results[0], students: students.results[0], todaysClasses: timetable.results[0], draftHomework: homework.results[0] });
}

async function listHomework(url: URL, s: Session, env: Env) {
  const sc = scope(s);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') ?? 30) || 30));
  if (s.role === 'student') {
    const student = await studentRecord(s, env);
    if (!student) return fail(404, 'Student profile not found');
    const rows = await env.DB.prepare("SELECT h.id, h.title, h.instructions, h.due_at, h.status, hs.status AS submission_status FROM homework h LEFT JOIN homework_submissions hs ON hs.homework_id = h.id AND hs.student_id = ? WHERE h.school_id = ? AND h.status = 'published' AND h.class_id = ? AND (h.section_id IS NULL OR h.section_id = ?) ORDER BY h.due_at ASC LIMIT ?").bind(student.id, s.schoolId, student.class_id, student.section_id, limit).all();
    return ok({ items: rows.results });
  }
  if (!['teacher', 'school_admin', 'branch_admin', 'platform_owner'].includes(s.role)) return fail(403, 'Forbidden');
  const creator = s.role === 'teacher' ? ' AND h.created_by = ?' : '';
  const rows = await env.DB.prepare(`SELECT h.id, h.title, h.instructions, h.due_at, h.status, h.class_id, h.section_id, h.created_at FROM homework h WHERE ${sc.sql}${creator} ORDER BY h.created_at DESC LIMIT ?`).bind(...sc.args, ...(s.role === 'teacher' ? [s.sub] : []), limit).all();
  return ok({ items: rows.results });
}

async function listNotices(url: URL, s: Session, env: Env) {
  const sc = scope(s); const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') ?? 30) || 30));
  let audience = ''; let args: unknown[] = [...sc.args];
  if (s.role === 'student') { const student = await studentRecord(s, env); if (!student) return fail(404, 'Student profile not found'); audience = " AND (audience IN ('school','students') AND (class_id IS NULL OR class_id = ?) AND (section_id IS NULL OR section_id = ?))"; args.push(student.class_id, student.section_id); }
  const rows = await env.DB.prepare(`SELECT id, title, body, audience, class_id, section_id, published_at, created_at FROM notices WHERE ${sc.sql} AND status = 'published'${audience} ORDER BY COALESCE(published_at, created_at) DESC LIMIT ?`).bind(...args, limit).all();
  return ok({ items: rows.results });
}

async function listTimetable(s: Session, env: Env) {
  const sc = scope(s); let predicate = ''; let args: unknown[] = [...sc.args];
  if (s.role === 'student') { const student = await studentRecord(s, env); if (!student) return fail(404, 'Student profile not found'); predicate = ' AND t.class_id = ? AND (t.section_id IS NULL OR t.section_id = ?)'; args.push(student.class_id, student.section_id); }
  else if (s.role === 'teacher') { const teacher = await env.DB.prepare('SELECT id FROM teachers WHERE user_id = ? AND school_id = ?').bind(s.sub, s.schoolId).first<{ id: string }>(); if (!teacher) return fail(404, 'Teacher profile not found'); predicate = ' AND t.teacher_id = ?'; args.push(teacher.id); }
  else if (!['school_admin', 'branch_admin', 'platform_owner'].includes(s.role)) return fail(403, 'Forbidden');
  const rows = await env.DB.prepare(`SELECT t.id, t.class_id, t.section_id, t.subject_id, t.teacher_id, t.day_of_week, t.starts_at, t.ends_at, t.room FROM timetable_entries t WHERE ${sc.sql}${predicate} ORDER BY t.day_of_week, t.starts_at`).bind(...args).all();
  return ok({ items: rows.results });
}

// ---------- router ----------
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api\/v1(?=\/|$)/, '/api');
    const cors = { 'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS' };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    try {
      let res: Response;
      if (path === '/api/auth/login' && req.method === 'POST') res = await login(req, env);
      else if (path === '/api/auth/forgot-password' && req.method === 'POST')
        res = fail(503, 'Password reset email delivery is not configured. Contact your school administrator.');
      else if (path === '/api/auth/refresh' && req.method === 'POST') {
        const refreshToken = await refreshSession(req, env);
        res = refreshToken ? await refresh(req, env, refreshToken) : fail(401, 'Not authenticated');
      } else {
        const session = await authenticated(req, env);
        if (!session) res = fail(401, 'Not authenticated');
        else if (path === '/api/auth/logout' && req.method === 'POST') {
          await env.DB.prepare("UPDATE sessions SET revoked_at = datetime('now') WHERE id = ?").bind(session.sid).run();
          await audit(env, session, 'auth.logout', req);
          res = withCookies(json({ success: true, data: null, message: 'Signed out' }), cookie('sos_session', '', 0, secureCookies(req)), cookie('sos_refresh', '', 0, secureCookies(req)));
        }
        else if (path === '/api/auth/me' && req.method === 'GET') res = ok({ sub: session.sub, role: session.role, schoolId: session.schoolId, branchId: session.branchId, exp: session.exp });
        else if ((path === '/api/auth/password' || path === '/api/auth/change-password') && req.method === 'POST') res = await changePassword(req, env, session);
        else if ((path === '/api/students' || path === '/api/v1/students') && req.method === 'GET')
          res = can(session, 'students:read') ? await listStudents(url, session, env) : fail(403, 'Forbidden');
        else if (path === '/api/students' && req.method === 'POST') res = await createStudent(req, session, env);
        else if (/^\/api\/students\/[^/]+$/.test(path) && req.method === 'GET') res = await getStudent(path.split('/').pop()!, session, env);
        else if (/^\/api\/students\/[^/]+$/.test(path) && req.method === 'PUT') res = await updateStudent(req, path.split('/').pop()!, session, env);
        else if (/^\/api\/students\/[^/]+$/.test(path) && req.method === 'DELETE') res = await deleteStudent(req, path.split('/').pop()!, session, env);
        else if (path === '/api/notifications' && req.method === 'GET') res = await listNotifications(url, session, env);
        else if (/^\/api\/notifications\/[^/]+\/read$/.test(path) && req.method === 'PUT') res = await markNotificationRead(req, path.split('/')[3]!, session, env);
        else if (path === '/api/dashboard/admin' && req.method === 'GET') res = schoolManagers.includes(session.role) ? await dashboard(session, env) : fail(403, 'Forbidden');
        else if (path === '/api/dashboard/student' && req.method === 'GET') res = await studentDashboard(session, env);
        else if (path === '/api/dashboard/teacher' && req.method === 'GET') res = await teacherDashboard(session, env);
        else if (path === '/api/homework' && req.method === 'GET') res = await listHomework(url, session, env);
        else if (path === '/api/notices' && req.method === 'GET') res = await listNotices(url, session, env);
        else if (path === '/api/timetable' && req.method === 'GET') res = await listTimetable(session, env);
        else res = fail(404, 'Not found');
      }
      Object.entries(cors).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    } catch (e) {
      console.error(e);
      const res = fail(500, 'Something went wrong on the server.');
      Object.entries(cors).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }
  },
};
