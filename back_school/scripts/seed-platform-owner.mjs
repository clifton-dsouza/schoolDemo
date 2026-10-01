#!/usr/bin/env node
import { randomBytes, randomUUID, pbkdf2Sync } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wranglerCli = path.join(backendDir, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const iterations = 100_000;

function runSql(sql) {
  const output = execFileSync(process.execPath, [
    wranglerCli, 'd1', 'execute', 'schoolos-db', '--local', '--json', '--command', sql,
  ], { cwd: backendDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  return JSON.parse(output);
}

const rl = createInterface({ input: stdin, output: stdout });
try {
  const [owners] = runSql("SELECT COUNT(*) AS count FROM users WHERE role = 'platform_owner';");
  if (Number(owners?.results?.[0]?.count) > 0) {
    throw new Error('A platform owner already exists in the local database. Refusing to create another.');
  }

  const email = (await rl.question('Platform owner email: ')).trim().toLowerCase();
  const name = (await rl.question('Platform owner name: ')).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  if (!name) throw new Error('Name cannot be empty.');

  const password = randomBytes(24).toString('base64url');
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  const passwordHash = `pbkdf2$${iterations}$${salt.toString('base64url')}$${hash.toString('base64url')}`;
  const quote = (value) => `'${value.replaceAll("'", "''")}'`;
  const id = randomUUID();

  // Guard the insert itself too, so a second concurrent run cannot add another owner.
  const result = runSql(
    `INSERT INTO users (id, school_id, branch_id, role, email, password_hash, name) ` +
    `SELECT ${quote(id)}, NULL, NULL, 'platform_owner', ${quote(email)}, ${quote(passwordHash)}, ${quote(name)} ` +
    `WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'platform_owner');`,
  );
  if (Number(result?.[0]?.meta?.changes) !== 1) {
    throw new Error('A platform owner already exists; no account was created.');
  }

  console.log('\nLocal platform owner created. Save this generated password now; it will not be shown again.');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log('\nSign in at http://localhost:5173/login while the local backend is running.');
} catch (error) {
  console.error(`\nSeed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  rl.close();
}
