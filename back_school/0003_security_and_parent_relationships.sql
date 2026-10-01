PRAGMA foreign_keys = ON;

-- An idle refresh expiry is renewable; this expiry is deliberately not.
ALTER TABLE sessions ADD COLUMN absolute_expires_at TEXT;
UPDATE sessions SET absolute_expires_at = expires_at WHERE absolute_expires_at IS NULL;
CREATE INDEX idx_sessions_absolute_expiry ON sessions(absolute_expires_at);

-- A parent may be linked to more than one child, and all reads are enforced through this table.
CREATE TABLE parent_students (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  parent_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(parent_id, student_id)
);
CREATE INDEX idx_parent_students_parent_scope ON parent_students(parent_id, school_id);
CREATE INDEX idx_parent_students_student_scope ON parent_students(student_id, school_id);

-- Account protection is evaluated per source and per account/source pair, not by email alone.
CREATE INDEX idx_login_attempts_ip_time ON login_attempts(ip, created_at);
CREATE INDEX idx_login_attempts_email_ip_time ON login_attempts(email, ip, created_at);
