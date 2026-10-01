#!/usr/bin/env node
import { pbkdf2Sync, randomBytes, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wranglerCli = path.join(backendDir, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const email = 'student@test.com';
const name = 'Test Student';
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

  const ids = Object.fromEntries(['school', 'branch', 'class', 'section', 'user', 'student'].map((key) => [key, randomUUID()]));
  const admissionNo = `TEST-${randomBytes(4).toString('hex').toUpperCase()}`;
  const password = randomBytes(24).toString('base64url');
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  const passwordHash = `pbkdf2$${iterations}$${salt.toString('base64url')}$${hash.toString('base64url')}`;

  const results = runSql([
    `INSERT INTO schools (id, name, slug) VALUES (${quote(ids.school)}, 'SchoolOS Local Test School', ${quote(`local-test-${ids.school.slice(0, 8)}`)});`,
    `INSERT INTO branches (id, school_id, name, address) VALUES (${quote(ids.branch)}, ${quote(ids.school)}, 'Test Branch', 'Local development');`,
    `INSERT INTO classes (id, school_id, branch_id, name) VALUES (${quote(ids.class)}, ${quote(ids.school)}, ${quote(ids.branch)}, 'Grade 5');`,
    `INSERT INTO sections (id, school_id, class_id, name) VALUES (${quote(ids.section)}, ${quote(ids.school)}, ${quote(ids.class)}, 'A');`,
    `INSERT INTO users (id, school_id, branch_id, role, email, password_hash, name) VALUES (${quote(ids.user)}, ${quote(ids.school)}, ${quote(ids.branch)}, 'student', ${quote(email)}, ${quote(passwordHash)}, ${quote(name)});`,
    `INSERT INTO students (id, school_id, branch_id, user_id, admission_no, first_name, last_name, class_id, section_id) VALUES (${quote(ids.student)}, ${quote(ids.school)}, ${quote(ids.branch)}, ${quote(ids.user)}, ${quote(admissionNo)}, 'Test', 'Student', ${quote(ids.class)}, ${quote(ids.section)});`,
    `SELECT u.id, u.email, u.role, s.admission_no, c.name AS class_name, sec.name AS section_name FROM users u JOIN students s ON s.user_id = u.id JOIN classes c ON c.id = s.class_id JOIN sections sec ON sec.id = s.section_id WHERE u.id = ${quote(ids.user)} AND u.email = ${quote(email)};`,
  ].join('\n'));
  const created = results.at(-1)?.results?.[0];
  if (created?.id !== ids.user || created.role !== 'student') {
    throw new Error('The local student account could not be confirmed.');
  }

  console.log('\nLOCAL TEST STUDENT CREATED');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log(`School:   SchoolOS Local Test School`);
  console.log(`Class:    ${created.class_name}, Section ${created.section_name}`);
  console.log('\nSign in at http://localhost:5173/login. Save this generated password now.');
} catch (error) {
  console.error(`\nStudent seed failed: ${error.message}`);
  process.exitCode = 1;
}
