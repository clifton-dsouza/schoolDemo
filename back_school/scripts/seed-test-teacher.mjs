#!/usr/bin/env node
import { pbkdf2Sync, randomBytes, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wranglerCli = path.join(backendDir, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const email = 'teacher@test.com';
const name = 'Test Teacher';
const iterations = 100_000;

function runSql(sql) {
  const output = execFileSync(process.execPath, [
    wranglerCli, 'd1', 'execute', 'schoolos-db', '--local', '--json', '--command', sql,
  ], { cwd: backendDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  return JSON.parse(output);
}

const quote = (value) => `'${value.replaceAll("'", "''")}'`;
try {
  const [existing] = runSql(`SELECT id FROM users WHERE email = ${quote(email)};`);
  if (existing?.results?.length) throw new Error(`${email} already exists in local D1; no records were changed.`);

  const [scope] = runSql(
    `SELECT sc.id AS school_id, br.id AS branch_id, sc.name AS school_name ` +
    `FROM schools sc JOIN branches br ON br.school_id = sc.id ` +
    `WHERE sc.slug LIKE 'local-test-%' AND br.name = 'Test Branch' ` +
    `ORDER BY sc.created_at DESC LIMIT 1;`,
  );
  const localSchool = scope?.results?.[0];
  if (!localSchool) throw new Error('No local test school/branch exists. Run the local student seed first.');

  const userId = randomUUID();
  const teacherId = randomUUID();
  const password = randomBytes(24).toString('base64url');
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  const passwordHash = `pbkdf2$${iterations}$${salt.toString('base64url')}$${hash.toString('base64url')}`;

  const results = runSql([
    `INSERT INTO users (id, school_id, branch_id, role, email, password_hash, name) ` +
    `VALUES (${quote(userId)}, ${quote(localSchool.school_id)}, ${quote(localSchool.branch_id)}, 'teacher', ${quote(email)}, ${quote(passwordHash)}, ${quote(name)});`,
    `INSERT INTO teachers (id, school_id, branch_id, user_id, name, email) ` +
    `VALUES (${quote(teacherId)}, ${quote(localSchool.school_id)}, ${quote(localSchool.branch_id)}, ${quote(userId)}, ${quote(name)}, ${quote(email)});`,
    `SELECT u.id, u.email, u.role, t.id AS teacher_id, t.school_id, t.branch_id ` +
    `FROM users u JOIN teachers t ON t.user_id = u.id ` +
    `WHERE u.id = ${quote(userId)} AND u.email = ${quote(email)};`,
  ].join('\n'));
  const created = results.at(-1)?.results?.[0];
  if (created?.id !== userId || created.role !== 'teacher' || created.teacher_id !== teacherId) {
    throw new Error('The local teacher account could not be confirmed.');
  }

  console.log('\nLOCAL TEST TEACHER CREATED');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log(`School:   ${localSchool.school_name}`);
  console.log('\nSign in at http://localhost:5173/login. Save this generated password now.');
} catch (error) {
  console.error(`\nTeacher seed failed: ${error.message}`);
  process.exitCode = 1;
}
