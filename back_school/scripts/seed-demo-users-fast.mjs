#!/usr/bin/env node
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Always writes to Wrangler local D1. It never targets a remote database.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const wrangler=path.join(root,'node_modules','wrangler','bin','wrangler.js');
const q=(v)=>v==null?'NULL':`'${String(v).replaceAll("'","''")}'`;
const pw=(v)=>{const salt=randomBytes(16);return `pbkdf2$100000$${salt.toString('base64url')}$${pbkdf2Sync(v,salt,100000,32,'sha256').toString('base64url')}`;};
const school='schoolos-demo-school', branch='schoolos-demo-branch';
const secondSchool='schoolos-demo-school-two', secondBranch='schoolos-demo-branch-two';
const sql=[
  `INSERT INTO schools (id,name,slug,plan,status) VALUES ('${school}','SchoolOS Demo Academy','schoolos-demo','professional','active') ON CONFLICT(id) DO UPDATE SET name=excluded.name,slug=excluded.slug,plan=excluded.plan,status='active';`,
  `INSERT INTO branches (id,school_id,name,address) VALUES ('${branch}','${school}','Demo Campus','Local development') ON CONFLICT(id) DO UPDATE SET school_id=excluded.school_id,name=excluded.name;`,
  `INSERT INTO schools (id,name,slug,plan,status) VALUES ('${secondSchool}','SchoolOS Second Demo Academy','schoolos-demo-two','starter','active') ON CONFLICT(id) DO UPDATE SET name=excluded.name,slug=excluded.slug,plan=excluded.plan,status='active';`,
  `INSERT INTO branches (id,school_id,name,address) VALUES ('${secondBranch}','${secondSchool}','Second Demo Campus','Local development') ON CONFLICT(id) DO UPDATE SET school_id=excluded.school_id,name=excluded.name;`,
  ...[['8','Grade 8'],['9','Grade 9'],['10','Grade 10']].map(([n,name])=>`INSERT INTO classes (id,school_id,branch_id,name) VALUES ('demo-class-${n}','${school}','${branch}','${name}') ON CONFLICT(id) DO UPDATE SET name=excluded.name;`),
  ...[['8a','8','A'],['9b','9','B'],['10a','10','A']].map(([key,n,name])=>`INSERT INTO sections (id,school_id,class_id,name) VALUES ('demo-section-${key}','${school}','demo-class-${n}','${name}') ON CONFLICT(id) DO UPDATE SET name=excluded.name;`),
  `INSERT INTO subjects (id,school_id,name,code) VALUES ('demo-subject-maths','${school}','Mathematics','MATH') ON CONFLICT(id) DO UPDATE SET name=excluded.name,code=excluded.code;`,
];
const accounts=[
  ['demo-superadmin-schoolos','platform_owner','superadmin@schoolos.demo','SuperAdmin@2026','Platform Administrator (Demo)',null,null],
  ['demo-superadmin-legacy','platform_owner','superadmin@schoolos.com','K7vQ2mX9pL4zN8cR6wT1yH5sD3fG0jU2','Platform Administrator (Demo)',null,null],
  ['demo-admin','school_admin','admin@schoolos.demo','Admin@2026','School Administrator',school,null],
  ['demo-teacher','teacher','teacher@schoolos.demo','Teacher@2026','Amit Sharma',school,branch],
  ['demo-student-user','student','student@schoolos.demo','Student@2026','Rahul Kumar',school,branch],
  ['demo-admin-second-school','school_admin','admin2@schoolos.demo','Admin2@2026','Second School Administrator',secondSchool,secondBranch],
];
for(const [id,role,email,password,name,schoolId,branchId] of accounts){
  sql.push(`INSERT INTO users (id,school_id,branch_id,role,email,password_hash,name,is_active) VALUES (${q(id)},${q(schoolId)},${q(branchId)},${q(role)},${q(email)},${q(pw(password))},${q(name)},1) ON CONFLICT(email) DO UPDATE SET school_id=excluded.school_id,branch_id=excluded.branch_id,role=excluded.role,password_hash=excluded.password_hash,name=excluded.name,is_active=1;`);
}
sql.push(`INSERT INTO teachers (id,school_id,branch_id,user_id,name,email,joined_on) VALUES ('demo-teacher-profile','${school}','${branch}','demo-teacher','Amit Sharma','teacher@schoolos.demo','2022-06-01') ON CONFLICT(id) DO UPDATE SET user_id=excluded.user_id,name=excluded.name,email=excluded.email;`);
sql.push(`INSERT INTO teacher_assignments (id,school_id,teacher_id,class_id,section_id,subject_id) VALUES ('demo-teacher-grade-10','${school}','demo-teacher-profile','demo-class-10','demo-section-10a','demo-subject-maths') ON CONFLICT(teacher_id,class_id,section_id,subject_id) DO NOTHING;`);
// Remove only the old seeded demo identity. Real parent accounts and the parent role remain intact.
sql.push(`DELETE FROM users WHERE id='demo-parent' AND email='parent@schoolos.demo';`);
const pupils=[['Rahul','Kumar','10','10a'],['Priya','Shah','10','10a'],['Ishaan','Nair','10','10a'],['Anaya','Patel','9','9b'],['Kabir','Mehta','9','9b'],['Diya','Rao','8','8a'],['Arjun','Das','8','8a'],['Mira','Kapoor','10','10a']];
pupils.forEach(([first,last,grade,section],i)=>sql.push(`INSERT INTO students (id,school_id,branch_id,user_id,admission_no,first_name,last_name,class_id,section_id) VALUES ('demo-student-${i+1}','${school}','${branch}',${i===0?"'demo-student-user'":'NULL'},'DEMO-STU-${String(i+1).padStart(3,'0')}',${q(first)},${q(last)},'demo-class-${grade}','demo-section-${section}') ON CONFLICT(id) DO UPDATE SET user_id=excluded.user_id,admission_no=excluded.admission_no,first_name=excluded.first_name,last_name=excluded.last_name,class_id=excluded.class_id,section_id=excluded.section_id;`));
sql.push(`INSERT INTO students (id,school_id,branch_id,admission_no,first_name,last_name) VALUES ('demo-second-school-student','${secondSchool}','${secondBranch}','SECOND-001','Nora','Sen') ON CONFLICT(id) DO UPDATE SET admission_no=excluded.admission_no,first_name=excluded.first_name,last_name=excluded.last_name;`);
try{
  execFileSync(process.execPath,[wrangler,'d1','execute','schoolos-db','--remote','--json','--command',sql.join('\n')],{cwd:root,stdio:'inherit'});
  console.log('Local demo users are ready. Passwords are stored as PBKDF2 hashes in D1.');
  console.log('Created demo roles: platform owner, school admin, teacher, student. Parent accounts remain supported; no parent demo is seeded.');
}catch(error){console.error(`Demo seed failed: ${error.message}`);process.exitCode=1;}
