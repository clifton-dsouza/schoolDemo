const base='http://localhost:8787';
const accounts=[
  ['Super Admin','superadmin@schoolos.demo','SuperAdmin@2026','platform_owner'],
  ['Super Admin legacy','superadmin@schoolos.com','K7vQ2mX9pL4zN8cR6wT1yH5sD3fG0jU2','platform_owner'],
  ['Admin','admin@schoolos.demo','Admin@2026','school_admin'],
  ['Teacher','teacher@schoolos.demo','Teacher@2026','teacher'],
  ['Student','student@schoolos.demo','Student@2026','student'],
];
let failed=false;
const check=(ok,message)=>{console.log(`${ok?'PASS':'FAIL'} ${message}`);if(!ok)failed=true;};
for(const [label,email,password,expectedRole] of accounts){
  try{
    const response=await fetch(`${base}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
    const body=await response.json();
    const cookie=(response.headers.get('set-cookie')||'').split(';')[0];
    check(response.status===200&&body.success&&body.data?.user?.role===expectedRole,`${label} login returns ${expectedRole}`);
    check(cookie.startsWith('sos_session='),`${label} receives the shared session cookie`);
    const me=await fetch(`${base}/api/auth/me`,{headers:{Cookie:cookie}});const session=await me.json();
    check(me.status===200&&session.data?.role===expectedRole,`${label} session survives /api/auth/me refresh`);
    if(['platform_owner','school_admin','teacher'].includes(expectedRole)){
      const scoped=await fetch(`${base}/api/students?page=1&pageSize=5&q=`,{headers:{Cookie:cookie}});
      check(scoped.status===200,`${label} has authorized school/student read access`);
    }
    if(expectedRole==='student'){
      const blocked=await fetch(`${base}/api/students?page=1&pageSize=5&q=`,{headers:{Cookie:cookie}});
      check(blocked.status===403,`${label} is blocked from teacher/admin student API`);
    }
    if(expectedRole==='teacher'){
      const students=await fetch(`${base}/api/students?page=1&pageSize=100&q=`,{headers:{Cookie:cookie}});const list=await students.json();
      check(students.status===200&&Array.isArray(list.data?.items)&&list.data.items.length>0,'Teacher can read school-scoped student roster');
    }
    const logout=await fetch(`${base}/api/auth/logout`,{method:'POST',headers:{Cookie:cookie}});
    check(logout.status===200&&(logout.headers.get('set-cookie')||'').includes('Max-Age=0'),`${label} logout clears the session cookie`);
    const revoked=await fetch(`${base}/api/auth/me`,{headers:{Cookie:cookie}});
    check(revoked.status===401,`${label} revoked server session rejects the previous cookie`);
    const after=await fetch(`${base}/api/auth/me`);
    check(after.status===401,`${label} protected API rejects a request after logout`);
  }catch(error){check(false,`${label} API check (${error.message})`);}
}
const invalid=await fetch(`${base}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'teacher@schoolos.demo',password:'wrong'})});
check(invalid.status===401,'Incorrect password is rejected');
const preflight=await fetch(`${base}/api/auth/login`,{method:'OPTIONS',headers:{Origin:'http://localhost:5173','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}});
check(preflight.status===204&&preflight.headers.get('access-control-allow-origin')==='http://localhost:5173'&&preflight.headers.get('access-control-allow-credentials')==='true','Vite development origin passes credentialed CORS preflight');
const dashboardLogin=await fetch(`${base}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@schoolos.demo',password:'Admin@2026'})});
const dashboardCookie=(dashboardLogin.headers.get('set-cookie')||'').split(';')[0];
const dashboard=await fetch(`${base}/api/dashboard/admin`,{headers:{Cookie:dashboardCookie}});const dashboardBody=await dashboard.json();
check(dashboard.status===200&&typeof dashboardBody.data?.students?.count==='number'&&typeof dashboardBody.data?.fees?.outstandingCents==='number','Admin dashboard reads D1-backed aggregations');
const crossSchool=await fetch(`${base}/api/students/demo-second-school-student`,{headers:{Cookie:dashboardCookie}});
check(crossSchool.status===404,'School admin cannot retrieve another school\'s student');
if(failed)process.exitCode=1;
