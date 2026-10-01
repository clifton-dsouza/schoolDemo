PRAGMA foreign_keys = ON;

CREATE TABLE schools (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter', status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','suspended','trial')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE branches (
  id TEXT PRIMARY KEY, school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL, address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_branches_school ON branches(school_id);

-- school_id NULL only for platform owners
CREATE TABLE users (
  id TEXT PRIMARY KEY, school_id TEXT REFERENCES schools(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('platform_owner','school_admin','branch_admin','teacher','accountant','student','parent','driver')),
  email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1, last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_users_school ON users(school_id, role);

CREATE TABLE academic_years (
  id TEXT PRIMARY KEY, school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL, starts_on TEXT NOT NULL, ends_on TEXT NOT NULL, is_current INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE classes (
  id TEXT PRIMARY KEY, school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE, name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE sections (
  id TEXT PRIMARY KEY, school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE, name TEXT NOT NULL
);
CREATE TABLE subjects (
  id TEXT PRIMARY KEY, school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL, code TEXT
);

CREATE TABLE teachers (
  id TEXT PRIMARY KEY, school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES branches(id), user_id TEXT REFERENCES users(id),
  name TEXT NOT NULL, phone TEXT, email TEXT, joined_on TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_teachers_scope ON teachers(school_id, branch_id);

CREATE TABLE students (
  id TEXT PRIMARY KEY, school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES branches(id), user_id TEXT REFERENCES users(id),
  admission_no TEXT NOT NULL, first_name TEXT NOT NULL, last_name TEXT NOT NULL,
  dob TEXT, gender TEXT CHECK (gender IN ('male','female','other')),
  class_id TEXT REFERENCES classes(id), section_id TEXT REFERENCES sections(id),
  guardian_name TEXT, guardian_phone TEXT, guardian_email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','graduated','transferred')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (school_id, admission_no)
);
CREATE INDEX idx_students_scope ON students(school_id, branch_id, class_id);

CREATE TABLE attendance_records (
  id TEXT PRIMARY KEY, school_id TEXT NOT NULL, branch_id TEXT NOT NULL,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date TEXT NOT NULL, status TEXT NOT NULL CHECK (status IN ('present','absent','late','leave')),
  marked_by TEXT REFERENCES users(id),
  UNIQUE (student_id, date)
);
CREATE INDEX idx_att_scope_date ON attendance_records(school_id, branch_id, date);

CREATE TABLE fee_structures (
  id TEXT PRIMARY KEY, school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id TEXT REFERENCES classes(id), name TEXT NOT NULL, amount_cents INTEGER NOT NULL
);
CREATE TABLE student_fees (
  id TEXT PRIMARY KEY, school_id TEXT NOT NULL, branch_id TEXT NOT NULL,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_structure_id TEXT REFERENCES fee_structures(id),
  amount_cents INTEGER NOT NULL, due_on TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','partial','paid','overdue'))
);
CREATE INDEX idx_fees_scope ON student_fees(school_id, branch_id, status, due_on);
CREATE TABLE payments (
  id TEXT PRIMARY KEY, school_id TEXT NOT NULL, branch_id TEXT NOT NULL,
  student_fee_id TEXT NOT NULL REFERENCES student_fees(id), amount_cents INTEGER NOT NULL,
  method TEXT NOT NULL, receipt_no TEXT NOT NULL, received_by TEXT REFERENCES users(id),
  paid_at TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE (school_id, receipt_no)
);

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY, school_id TEXT, user_id TEXT, action TEXT NOT NULL,
  entity TEXT, entity_id TEXT, ip TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_audit_school ON audit_logs(school_id, created_at);
