#!/usr/bin/env node
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wranglerCli = path.join(backendDir, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const email = process.argv[2]?.trim().toLowerCase();
const iterations = 100_000;

function runSql(sql) {
  const output = execFileSync(process.execPath, [
    wranglerCli, 'd1', 'execute', 'schoolos-db', '--local', '--json', '--command', sql,
  ], { cwd: backendDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  return JSON.parse(output);
}

const quote = (value) => `'${value.replaceAll("'", "''")}'`;
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: node scripts/reset-platform-owner-password.mjs <admin-email>');
  process.exit(1);
}

try {
  const [lookup] = runSql(
    `SELECT id, email FROM users WHERE email = ${quote(email)} AND role = 'platform_owner' AND is_active = 1;`,
  );
  if (lookup?.results?.length !== 1) {
    throw new Error(`Expected one active local platform owner for ${email}; no password was changed.`);
  }

  const user = lookup.results[0];
  const password = randomBytes(24).toString('base64url');
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  const passwordHash = `pbkdf2$${iterations}$${salt.toString('base64url')}$${hash.toString('base64url')}`;
  const [updated] = runSql(
    `UPDATE users SET password_hash = ${quote(passwordHash)} ` +
    `WHERE id = ${quote(user.id)} AND email = ${quote(email)} ` +
    `AND role = 'platform_owner' AND is_active = 1 RETURNING id;`,
  );
  if (updated?.results?.length !== 1 || updated.results[0].id !== user.id) {
    throw new Error('The local account was not updated exactly once; password not shown.');
  }

  console.log('\nLOCAL PLATFORM OWNER PASSWORD RESET SUCCESSFUL');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log('\nSign in at http://localhost:5173/login. Save this generated password now.');
} catch (error) {
  console.error(`\nPassword reset failed: ${error.message}`);
  process.exitCode = 1;
}
