#!/usr/bin/env node
import { pbkdf2Sync, randomBytes, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wranglerCli = path.join(backendDir, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const email = 'admin@test.com';
const name = 'Test Admin';
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

  const [schools] = runSql(
    `SELECT id, name FROM schools WHERE slug LIKE 'local-test-%' ORDER BY created_at DESC LIMIT 1;`,
  );
  const school = schools?.results?.[0];
  if (!school) throw new Error('No local test school exists. Run the local student seed first.');

  const userId = randomUUID();
  const password = randomBytes(24).toString('base64url');
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  const passwordHash = `pbkdf2$${iterations}$${salt.toString('base64url')}$${hash.toString('base64url')}`;
  runSql(
    `INSERT INTO users (id, school_id, branch_id, role, email, password_hash, name) ` +
    `VALUES (${quote(userId)}, ${quote(school.id)}, NULL, 'school_admin', ${quote(email)}, ${quote(passwordHash)}, ${quote(name)});`,
  );
  const [verified] = runSql(
    `SELECT id, email, name, role, school_id, branch_id FROM users WHERE id = ${quote(userId)} AND email = ${quote(email)};`,
  );
  const account = verified?.results?.[0];
  if (account?.id !== userId || account.role !== 'school_admin' || account.school_id !== school.id || account.branch_id !== null) {
    throw new Error('The local school admin account could not be confirmed.');
  }

  console.log('\nLOCAL TEST ADMIN CREATED');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Role:     ${account.role} (School admin)`);
  console.log(`School:   ${school.name}`);
  console.log('\nSign in at http://localhost:5173/login. Save this generated password now.');
} catch (error) {
  console.error(`\nAdmin seed failed: ${error.message}`);
  process.exitCode = 1;
}
