PRAGMA foreign_keys = ON;

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_sessions_user_active ON sessions(user_id, expires_at);

CREATE TABLE login_attempts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  success INTEGER NOT NULL,
  ip TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_login_attempts_email_time ON login_attempts(email, created_at);

CREATE TABLE password_resets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE teacher_assignments (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES sections(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(teacher_id, class_id, section_id, subject_id)
);
CREATE INDEX idx_teacher_assignments_scope ON teacher_assignments(school_id, teacher_id);

CREATE TABLE homework (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES sections(id) ON DELETE SET NULL,
  subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  instructions TEXT,
  due_at TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft','published','archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_homework_scope_due ON homework(school_id, class_id, section_id, due_at);

CREATE TABLE homework_submissions (
  id TEXT PRIMARY KEY,
  homework_id TEXT NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  body TEXT,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','reviewed','late')),
  score REAL,
  feedback TEXT,
  reviewed_by TEXT REFERENCES users(id),
  UNIQUE(homework_id, student_id)
);

CREATE TABLE exams (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id TEXT REFERENCES academic_years(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  starts_on TEXT NOT NULL,
  ends_on TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','scheduled','published','archived')),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_exams_school_date ON exams(school_id, starts_on);

CREATE TABLE exam_schedules (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES sections(id) ON DELETE SET NULL,
  subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  scheduled_at TEXT NOT NULL,
  ends_at TEXT,
  room TEXT
);
CREATE INDEX idx_exam_schedules_scope ON exam_schedules(school_id, class_id, scheduled_at);

CREATE TABLE marks (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  exam_schedule_id TEXT NOT NULL REFERENCES exam_schedules(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score REAL NOT NULL CHECK(score >= 0),
  maximum_score REAL NOT NULL CHECK(maximum_score > 0),
  entered_by TEXT NOT NULL REFERENCES users(id),
  updated_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(exam_schedule_id, student_id)
);
CREATE INDEX idx_marks_scope_student ON marks(school_id, student_id);

CREATE TABLE timetable_entries (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES sections(id) ON DELETE SET NULL,
  subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  room TEXT,
  UNIQUE(school_id, branch_id, class_id, section_id, day_of_week, starts_at)
);
CREATE INDEX idx_timetable_scope ON timetable_entries(school_id, class_id, section_id, day_of_week);

CREATE TABLE notices (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'school' CHECK(audience IN ('school','students','teachers','parents','staff')),
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  section_id TEXT REFERENCES sections(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
  published_at TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  updated_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_notices_scope_status ON notices(school_id, status, published_at);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  school_id TEXT REFERENCES schools(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  resource_type TEXT,
  resource_id TEXT,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_at, created_at);

CREATE TABLE message_threads (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  subject TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id),
  recipient_id TEXT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_messages_recipient ON messages(recipient_id, read_at, created_at);

CREATE TABLE leave_requests (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  starts_on TEXT NOT NULL,
  ends_on TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','cancelled')),
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TEXT,
  review_comment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_leave_scope_status ON leave_requests(school_id, status, starts_on);
