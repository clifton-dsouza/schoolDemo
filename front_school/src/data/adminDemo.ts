export type DemoRow = Record<string, string>;

export const enrollment = [
  { label: 'Jan', admissions: 24, total: 1180 }, { label: 'Feb', admissions: 32, total: 1212 },
  { label: 'Mar', admissions: 28, total: 1240 }, { label: 'Apr', admissions: 42, total: 1282 },
  { label: 'May', admissions: 35, total: 1317 }, { label: 'Jun', admissions: 26, total: 1343 },
  { label: 'Jul', admissions: 54, total: 1397 }, { label: 'Aug', admissions: 38, total: 1435 },
  { label: 'Sep', admissions: 31, total: 1466 }, { label: 'Oct', admissions: 0, total: 1466 },
  { label: 'Nov', admissions: 0, total: 1466 }, { label: 'Dec', admissions: 0, total: 1466 },
];

export const attendanceWeek = [
  { label: 'Mon', present: 1320, absent: 82, late: 24 }, { label: 'Tue', present: 1344, absent: 65, late: 19 },
  { label: 'Wed', present: 1298, absent: 102, late: 28 }, { label: 'Thu', present: 1360, absent: 51, late: 17 },
  { label: 'Fri', present: 1318, absent: 86, late: 24 }, { label: 'Sat', present: 0, absent: 0, late: 0 },
  { label: 'Today', present: 1378, absent: 68, late: 20 },
];

export const financeYear = [
  { label: 'Oct', income: 18.4, expense: 13.2 }, { label: 'Nov', income: 20.1, expense: 14.8 },
  { label: 'Dec', income: 19.3, expense: 15.1 }, { label: 'Jan', income: 22.8, expense: 16.2 },
  { label: 'Feb', income: 21.5, expense: 15.7 }, { label: 'Mar', income: 24.6, expense: 17.4 },
  { label: 'Apr', income: 23.2, expense: 16.8 }, { label: 'May', income: 26.7, expense: 18.5 },
  { label: 'Jun', income: 25.4, expense: 19.1 }, { label: 'Jul', income: 29.8, expense: 20.7 },
  { label: 'Aug', income: 27.9, expense: 19.8 }, { label: 'Sep', income: 31.2, expense: 21.3 },
];

export const classDistribution = [
  { label: 'Nursery–UKG', value: 210, color: '#5b8def' }, { label: 'I–IV', value: 408, color: '#25b8a5' },
  { label: 'V–VIII', value: 512, color: '#9a7af5' }, { label: 'IX–XII', value: 336, color: '#ed9f54' },
];
export const genderDistribution = [
  { label: 'Girls', value: 714, color: '#9a7af5' }, { label: 'Boys', value: 734, color: '#4fa9df' },
  { label: 'Other', value: 18, color: '#35bea2' },
];
export const feeTrend = [
  { label: 'Apr', collected: 18, pending: 8, overdue: 2 }, { label: 'May', collected: 21, pending: 7, overdue: 2.5 },
  { label: 'Jun', collected: 20, pending: 8, overdue: 3 }, { label: 'Jul', collected: 24, pending: 6, overdue: 2.2 },
  { label: 'Aug', collected: 23, pending: 7, overdue: 2.8 }, { label: 'Sep', collected: 27, pending: 5, overdue: 2 },
];

export const activities = [
  { icon: 'user', tone: 'blue', title: 'New admission', detail: 'Aarav Mehta · Class VIII-A', time: '12 min ago' },
  { icon: 'wallet', tone: 'green', title: 'Fee payment received', detail: '₹24,500 · Riya Kapoor', time: '28 min ago' },
  { icon: 'check', tone: 'purple', title: 'Attendance submitted', detail: 'Class VI-B · 38 students', time: '46 min ago' },
  { icon: 'file', tone: 'orange', title: 'Expense recorded', detail: 'Science lab supplies · ₹8,420', time: '1 hr ago' },
  { icon: 'bell', tone: 'blue', title: 'Notice published', detail: 'Annual sports day schedule', time: '2 hrs ago' },
];

export const studentRows: DemoRow[] = [
  { admission: 'ADM-24081', roll: '08', name: 'Rahul Sharma', class: 'VIII', section: 'A', status: 'Active', father: 'Amit Sharma', phone: '+91 98765 43210', fees: '₹42,000' },
  { admission: 'ADM-24082', roll: '14', name: 'Ananya Desai', class: 'VII', section: 'B', status: 'Active', father: 'Kunal Desai', phone: '+91 98210 77431', fees: '₹38,500' },
  { admission: 'ADM-24083', roll: '03', name: 'Ishaan Gupta', class: 'IX', section: 'A', status: 'Active', father: 'Rajiv Gupta', phone: '+91 98901 22514', fees: '₹46,000' },
  { admission: 'ADM-24084', roll: '21', name: 'Diya Reddy', class: 'V', section: 'C', status: 'Active', father: 'Sanjay Reddy', phone: '+91 98490 66218', fees: '₹31,500' },
  { admission: 'ADM-24085', roll: '11', name: 'Shaurya Mishra', class: 'X', section: 'A', status: 'Pending', father: 'Prakash Mishra', phone: '+91 98111 83402', fees: '₹49,000' },
  { admission: 'ADM-24086', roll: '06', name: 'Kavya Joshi', class: 'VI', section: 'B', status: 'Active', father: 'Nilesh Joshi', phone: '+91 98222 54119', fees: '₹34,000' },
  { admission: 'ADM-24087', roll: '19', name: 'Atharv Kumar', class: 'VIII', section: 'A', status: 'Active', father: 'Manoj Kumar', phone: '+91 98730 11265', fees: '₹42,000' },
  { admission: 'ADM-24088', roll: '02', name: 'Kiara Soni', class: 'IV', section: 'A', status: 'Active', father: 'Deepak Soni', phone: '+91 98100 41982', fees: '₹28,500' },
  { admission: 'ADM-24089', roll: '16', name: 'Krish Yadav', class: 'XI', section: 'B', status: 'Active', father: 'Rohit Yadav', phone: '+91 98990 55106', fees: '₹54,000' },
  { admission: 'ADM-24090', roll: '12', name: 'Myra Khan', class: 'III', section: 'C', status: 'Active', father: 'Sameer Khan', phone: '+91 98330 07441', fees: '₹26,000' },
  { admission: 'ADM-24091', roll: '17', name: 'Vivaan Patel', class: 'II', section: 'B', status: 'Active', father: 'Harsh Patel', phone: '+91 98989 12650', fees: '₹24,000' },
  { admission: 'ADM-24092', roll: '04', name: 'Sara Thomas', class: 'XII', section: 'A', status: 'Active', father: 'George Thomas', phone: '+91 98470 88422', fees: '₹58,000' },
];

export const parentRows: DemoRow[] = [
  { name: 'Amit Sharma', phone: '+91 98765 43210', username: 'amit.sharma', children: 'Rahul Sharma · VIII-A', added: '12 Sep 2025', status: 'Active' },
  { name: 'Kunal Desai', phone: '+91 98210 77431', username: 'kunal.desai', children: 'Ananya Desai · VII-B', added: '10 Sep 2025', status: 'Active' },
  { name: 'Rajiv Gupta', phone: '+91 98901 22514', username: 'rajiv.gupta', children: 'Ishaan Gupta · IX-A', added: '08 Sep 2025', status: 'Active' },
  { name: 'Sanjay Reddy', phone: '+91 98490 66218', username: 'sanjay.reddy', children: 'Diya Reddy · V-C', added: '05 Sep 2025', status: 'Pending invite' },
];

export const activityRows: DemoRow[] = [
  { action: 'New admission', record: 'Aarav Mehta · VIII-A', user: 'Nisha Verma', time: 'Today, 10:42 AM', status: 'Complete' },
  { action: 'Fee payment', record: 'Receipt RC-24019 · ₹24,500', user: 'Priya Shah', time: 'Today, 10:26 AM', status: 'Complete' },
  { action: 'Attendance marked', record: 'Class VI-B · 38 students', user: 'Meera Nair', time: 'Today, 10:08 AM', status: 'Complete' },
  { action: 'Notice published', record: 'Annual sports day schedule', user: 'Nisha Verma', time: 'Today, 9:38 AM', status: 'Published' },
];

export const moduleRows: Record<string, DemoRow[]> = {
  'finance/fees': [
    { receipt: 'RC-24019', student: 'Riya Kapoor', class: 'VII-A', type: 'Tuition fee', amount: '₹24,500', method: 'UPI', date: '29 Sep 2026', status: 'Paid' },
    { receipt: 'RC-24018', student: 'Kabir Singh', class: 'IX-B', type: 'Transport', amount: '₹6,000', method: 'Bank transfer', date: '29 Sep 2026', status: 'Paid' },
    { receipt: 'RC-24017', student: 'Meera Iyer', class: 'V-A', type: 'Tuition fee', amount: '₹18,000', method: 'Cash', date: '28 Sep 2026', status: 'Paid' },
  ],
  'finance/pending': [
    { student: 'Shaurya Mishra', admission: 'ADM-24085', class: 'X-A', amount: '₹12,500', due: '15 Sep 2026', days: '14 days', status: 'Overdue' },
    { student: 'Aarav Mehta', admission: 'ADM-24081', class: 'VIII-A', amount: '₹8,000', due: '30 Sep 2026', days: 'Due today', status: 'Due soon' },
  ],
  'finance/structure': [
    { name: 'Tuition fee · Classes I–V', class: 'I–V', frequency: 'Quarterly', amount: '₹8,500', status: 'Active' },
    { name: 'Tuition fee · Classes VI–VIII', class: 'VI–VIII', frequency: 'Quarterly', amount: '₹10,500', status: 'Active' },
    { name: 'Transport · Zone 1', class: 'All classes', frequency: 'Monthly', amount: '₹2,000', status: 'Active' },
  ],
  'accounts/income': [
    { name: 'Annual day sponsorship', head: 'Miscellaneous income', date: '27 Sep 2026', amount: '₹45,000', status: 'Approved' },
    { name: 'Auditorium rent', head: 'Rent', date: '26 Sep 2026', amount: '₹18,000', status: 'Approved' },
  ],
  'accounts/expense': [
    { name: 'September electricity', head: 'Electricity bill', date: '28 Sep 2026', amount: '₹62,840', status: 'Paid' },
    { name: 'Science lab supplies', head: 'Stationery purchase', date: '28 Sep 2026', amount: '₹8,420', status: 'Approved' },
  ],
  'accounts/vouchers': [
    { voucher: 'PV-1092', name: 'September electricity', type: 'Expense', date: '28 Sep 2026', amount: '₹62,840', status: 'Paid' },
    { voucher: 'RV-0841', name: 'Auditorium rent', type: 'Income', date: '26 Sep 2026', amount: '₹18,000', status: 'Approved' },
  ],
  'academics/classes': [
    { name: 'Class VIII', sections: 'A, B, C', students: '118', classTeacher: 'Meera Nair', status: 'Active' },
    { name: 'Class IX', sections: 'A, B', students: '86', classTeacher: 'Arjun Rao', status: 'Active' },
  ],
  'academics/teachers': [
    { name: 'Meera Nair', subject: 'Mathematics', classes: 'VI-A, VIII-A', phone: '+91 98220 11445', status: 'Active' },
    { name: 'Arjun Rao', subject: 'Science', classes: 'IX-A, X-B', phone: '+91 98450 77126', status: 'Active' },
    { name: 'Nisha Verma', subject: 'English', classes: 'VII-A, VIII-B', phone: '+91 98100 22641', status: 'Active' },
  ],
  'academics/exams': [
    { name: 'Mid-term examinations', classes: 'I–XII', starts: '12 Oct 2026', ends: '24 Oct 2026', status: 'Scheduled' },
    { name: 'Science practicals', classes: 'XI–XII', starts: '05 Oct 2026', ends: '08 Oct 2026', status: 'Scheduled' },
  ],
  'hr/staff': [
    { name: 'Meera Nair', department: 'Academics', designation: 'Senior Teacher', phone: '+91 98220 11445', status: 'Present' },
    { name: 'Priya Shah', department: 'Accounts', designation: 'Accountant', phone: '+91 98201 64318', status: 'Present' },
    { name: 'Nisha Verma', department: 'Academics', designation: 'Teacher', phone: '+91 98100 22641', status: 'On leave' },
  ],
  'communication/notices': [
    { title: 'Annual sports day schedule', audience: 'All parents', published: '29 Sep 2026', author: 'Nisha Verma', status: 'Published' },
    { title: 'Mid-term exam instructions', audience: 'Classes VI–XII', published: '27 Sep 2026', author: 'Arjun Rao', status: 'Published' },
  ],
  'students/parents': parentRows,
  'students/behavior': [
    { student: 'Rahul Sharma', class: 'VIII-A', title: 'Excellent science project', type: 'Positive', date: '27 Sep 2026', reportedBy: 'Meera Nair' },
    { student: 'Kabir Singh', class: 'IX-B', title: 'Late to assembly', type: 'Needs attention', date: '26 Sep 2026', reportedBy: 'Arjun Rao' },
  ],
  'students/categories': [
    { name: 'General', students: '984', description: 'General admission category', status: 'Active' },
    { name: 'Reserved', students: '264', description: 'Reserved category', status: 'Active' },
  ],
  'students/houses': [
    { name: 'Cedar', captain: 'Ananya Desai', students: '312', points: '1,240', status: 'Active' },
    { name: 'Maple', captain: 'Ishaan Gupta', students: '298', points: '1,180', status: 'Active' },
    { name: 'Oak', captain: 'Diya Reddy', students: '306', points: '1,105', status: 'Active' },
  ],
  'front-office/visitors': [
    { visitor: 'Rohan Malhotra', purpose: 'Admission enquiry', host: 'Nisha Verma', time: '10:18 AM', status: 'Checked in' },
    { visitor: 'Anita Rao', purpose: 'Parent meeting', host: 'Meera Nair', time: '9:42 AM', status: 'Checked out' },
  ],
  'reports/admissions': [
    { report: 'Admissions by class', period: '2026–27', generated: 'Today, 9:10 AM', createdBy: 'Nisha Verma', status: 'Ready' },
    { report: 'Attendance summary', period: 'September 2026', generated: 'Yesterday', createdBy: 'Meera Nair', status: 'Ready' },
  ],
  'settings/users': [
    { name: 'schooluser', email: 'schooluser@gmail.com', role: 'Platform owner', lastLogin: 'Today, 10:32 AM', status: 'Active' },
    { name: 'Test Admin', email: 'admin@test.com', role: 'School admin', lastLogin: 'Today, 10:24 AM', status: 'Active' },
    { name: 'Test Teacher', email: 'teacher@test.com', role: 'Teacher', lastLogin: 'Today, 10:18 AM', status: 'Active' },
  ],
  'settings/audit-logs': activityRows.map((row) => ({ user: row.detail, action: row.title, module: 'SchoolOS', record: row.detail, ip: 'Local development', time: row.time })),
};
