import type { Book, HealthRecord, SchoolVisit, Transport } from '../types/studentPortal';

export const subjects = [
  { name: 'Mathematics', teacher: 'Meera Nair', room: '204', mark: 92, attendance: 95, color: '#60a5fa', icon: '∑' },
  { name: 'Science', teacher: 'Arjun Rao', room: 'Lab 2', mark: 87, attendance: 92.8, color: '#34d399', icon: '⚗' },
  { name: 'English', teacher: 'David Thomas', room: '105', mark: 91, attendance: 92.1, color: '#c084fc', icon: 'A' },
  { name: 'Social Science', teacher: 'Nisha Verma', room: '201', mark: 84, attendance: 90, color: '#fbbf24', icon: '◎' },
  { name: 'Computer Science', teacher: 'Ravi Kumar', room: 'Lab 1', mark: 95, attendance: 97, color: '#fb7185', icon: '</>' },
];

export const assignments = [
  { id: 'AS-104', subject: 'Mathematics', title: 'Quadratic Equations', teacher: 'Meera Nair', assigned: '28 Sep 2026', due: '02 Oct 2026', status: 'Pending' },
  { id: 'AS-102', subject: 'Science', title: 'Human Digestive System', teacher: 'Arjun Rao', assigned: '26 Sep 2026', due: '04 Oct 2026', status: 'Pending' },
  { id: 'AS-101', subject: 'Computer Science', title: 'Java Assignment', teacher: 'Ravi Kumar', assigned: '24 Sep 2026', due: '06 Oct 2026', status: 'Submitted' },
  { id: 'AS-099', subject: 'English', title: 'A descriptive essay', teacher: 'David Thomas', assigned: '18 Sep 2026', due: '25 Sep 2026', status: 'Graded' },
  { id: 'AS-096', subject: 'Social Science', title: 'The Indian Constitution', teacher: 'Nisha Verma', assigned: '12 Sep 2026', due: '20 Sep 2026', status: 'Late' },
];

export const exams = [
  { name: 'Mathematics', exam: 'Mid Term Examination', date: '05 Oct 2026', time: '10:00 AM', room: '201', syllabus: 'Chapters 1–6', marks: 84, total: 100, grade: 'A' },
  { name: 'Science', exam: 'Mid Term Examination', date: '08 Oct 2026', time: '10:00 AM', room: '203', syllabus: 'Units 1–4', marks: 78, total: 100, grade: 'B+' },
  { name: 'English', exam: 'Mid Term Examination', date: '10 Oct 2026', time: '10:00 AM', room: '105', syllabus: 'Prose 1–5 · Grammar', marks: 91, total: 100, grade: 'A+' },
  { name: 'Computer Science', exam: 'Unit Test 2', date: '13 Oct 2026', time: '09:00 AM', room: 'Lab 1', syllabus: 'Java basics · loops', marks: 0, total: 100, grade: '—' },
];

export const timetable = [
  { time: '08:00', subject: 'Mathematics', teacher: 'Meera Nair', room: '204' },
  { time: '09:00', subject: 'Science', teacher: 'Arjun Rao', room: 'Lab 2' },
  { time: '10:00', subject: 'English', teacher: 'David Thomas', room: '105' },
  { time: '11:00', subject: 'Social Science', teacher: 'Nisha Verma', room: '201' },
  { time: '12:00', subject: 'Lunch break', teacher: '', room: 'Cafeteria' },
  { time: '13:00', subject: 'Computer Science', teacher: 'Ravi Kumar', room: 'Lab 1' },
];

export const notices = [
  { title: 'Mid Term Examination schedule published', category: 'Exam', date: '29 Sep 2026', text: 'The mid term examination schedule is now available. Review your subjects, dates and room assignments before exam week.', important: true },
  { title: 'Science lab safety briefing', category: 'Academic', date: '28 Sep 2026', text: 'All students should attend the short lab safety briefing at the start of Thursday’s practical session.', important: false },
  { title: 'Gandhi Jayanti holiday', category: 'Holiday', date: '26 Sep 2026', text: 'The school will remain closed on 2 October. Classes resume on Monday, 5 October.', important: false },
  { title: 'September fee reminder', category: 'Fee', date: '25 Sep 2026', text: 'Please review your fee statement. Contact the accounts office if you have questions about a balance.', important: false },
];

export const materials = [
  { subject: 'Mathematics', title: 'Quadratic Equations · Revision Notes', teacher: 'Meera Nair', date: '28 Sep 2026', type: 'PDF' },
  { subject: 'Science', title: 'Digestive System · Chapter Video', teacher: 'Arjun Rao', date: '27 Sep 2026', type: 'Video' },
  { subject: 'English', title: 'Descriptive Writing Guide', teacher: 'David Thomas', date: '24 Sep 2026', type: 'Document' },
  { subject: 'Computer Science', title: 'Java Loops · Slides', teacher: 'Ravi Kumar', date: '22 Sep 2026', type: 'Presentation' },
  { subject: 'Social Science', title: 'Indian Constitution resource', teacher: 'Nisha Verma', date: '20 Sep 2026', type: 'Link' },
];

export const payments = [
  { receipt: 'YIS-26-09124', date: '10 Sep 2026', amount: '₹15,000', method: 'UPI', status: 'Paid' },
  { receipt: 'YIS-26-08102', date: '12 Aug 2026', amount: '₹12,500', method: 'Bank transfer', status: 'Paid' },
  { receipt: 'YIS-26-07118', date: '08 Jul 2026', amount: '₹10,000', method: 'Card', status: 'Paid' },
  { receipt: 'YIS-26-06102', date: '10 Jun 2026', amount: '₹12,500', method: 'UPI', status: 'Paid' },
  { receipt: 'YIS-26-05104', date: '12 May 2026', amount: '₹12,500', method: 'Bank transfer', status: 'Paid' },
];

export const events = [
  { name: 'Inter-house Science Exhibition', date: '03 Oct 2026', time: '09:30 AM', place: 'School auditorium', kind: 'Academic' },
  { name: 'Mid Term Examinations', date: '05 Oct 2026', time: '10:00 AM', place: 'Examination rooms', kind: 'Exam' },
  { name: 'Annual Sports Trials', date: '17 Oct 2026', time: '08:00 AM', place: 'Sports ground', kind: 'Sports' },
  { name: 'Parent–Teacher Meeting', date: '24 Oct 2026', time: '10:00 AM', place: 'Class VIII wing', kind: 'Meeting' },
];

export const attendanceCalendar = [
  'Holiday','Holiday','Present','Present','Present','Present','Present','Weekend','Weekend','Present','Present','Present','Absent','Present','Weekend','Weekend','Present','Present','Late','Present','Present','Weekend','Weekend','Present','Present','Present','Present','Present','Weekend','Weekend','Present',
];

export const portalNotifications = [
  { title: 'New assignment posted', detail: 'Quadratic Equations · Mathematics', when: '12 min ago' },
  { title: 'Exam schedule updated', detail: 'Mid Term Examination', when: '1 hour ago' },
  { title: 'New study material', detail: 'Digestive System · Science', when: 'Yesterday' },
];

export const onlineExams = [
  { id: 'OE-8-MATH', name: 'Algebra readiness quiz', subject: 'Mathematics', duration: 20, questions: 5, start: '29 Sep 2026 · 08:00 AM', end: '02 Oct 2026 · 06:00 PM', status: 'Available' as const },
  { id: 'OE-8-SCI', name: 'Science chapter review', subject: 'Science', duration: 30, questions: 15, start: '05 Oct 2026 · 09:00 AM', end: '08 Oct 2026 · 05:00 PM', status: 'Upcoming' as const },
  { id: 'OE-8-ENG', name: 'Grammar practice', subject: 'English', duration: 15, questions: 8, start: '21 Sep 2026 · 09:00 AM', end: '23 Sep 2026 · 05:00 PM', status: 'Completed' as const, score: 88 },
];
export const onlineQuestions = [
  { question: 'Which expression is equivalent to (x + 3)(x − 2)?', options: ['x² + x − 6','x² − x + 6','x² + 5x − 6','x² − 6'], answer: 0 },
  { question: 'If 2x + 5 = 17, what is x?', options: ['5','6','7','11'], answer: 1 },
  { question: 'What is the factorisation of x² − 9?', options: ['(x − 9)(x + 1)','(x − 3)(x + 3)','(x − 3)²','(x + 9)(x − 1)'], answer: 1 },
  { question: 'The roots of x² − 5x + 6 = 0 are:', options: ['1 and 6','−2 and −3','2 and 3','−2 and 3'], answer: 2 },
  { question: 'What is the value of 3² + 4²?', options: ['12','25','49','7'], answer: 1 },
];
export const libraryBooks: Book[] = [
  { id:'BK-204',title:'The Young Mathematician',author:'R. K. Sharma',category:'Mathematics',status:'Issued',dueDate:'05 Oct 2026' },
  { id:'BK-189',title:'Wings of Fire',author:'A. P. J. Abdul Kalam',category:'Biography',status:'Issued',dueDate:'28 Sep 2026' },
  { id:'BK-328',title:'The Secret Garden',author:'Frances Hodgson Burnett',category:'Literature',status:'Available' },
  { id:'BK-412',title:'Discovering Science',author:'Meera Nair',category:'Science',status:'Available' },
  { id:'BK-276',title:'Around the World in Eighty Days',author:'Jules Verne',category:'Adventure',status:'Available' },
  { id:'BK-356',title:'A Short History of India',author:'R. C. Majumdar',category:'History',status:'Available' },
];
export const transport: Transport = { bus:'Bus 24',driver:'Suresh Kumar',route:'School → City Center',pickup:'Indiranagar Metro Gate',drop:'Northstar Academy · Main Gate',eta:'07:42 AM · approximately 8 min',status:'On the way',driverPhone:'School office can connect you to the driver' };
export const healthRecord: HealthRecord = { bloodGroup:'O+',allergies:['Dust (mild)'],medicalNotes:'No ongoing medical conditions reported.',vaccinationRecords:['Tetanus booster · 12 Apr 2025','MMR · Record verified'],checkups:[{date:'15 Apr 2026',summary:'Annual wellness check · all clear'},{date:'10 Oct 2025',summary:'Vision screening · follow-up not required'}],emergencyContact:'Parent / guardian · contact number masked for privacy' };
export const schoolVisits: SchoolVisit[] = [
  { id:'VIS-218',visitor:'Amit Sharma',relationship:'Father',purpose:'Meet class teacher',date:'24 Oct 2026',time:'10:30 AM',status:'Approved' },
  { id:'VIS-204',visitor:'Neha Sharma',relationship:'Mother',purpose:'Student progress meeting',date:'18 Aug 2026',time:'11:00 AM',status:'Completed' },
];
export const calendarEvents = [
  { date:'2026-10-02',title:'Gandhi Jayanti · School holiday',type:'Holiday',time:'All day',detail:'School closed; classes resume Monday.' },
  { date:'2026-10-03',title:'Science exhibition',type:'Event',time:'09:30 AM',detail:'Inter-house science exhibition in the school auditorium.' },
  { date:'2026-10-05',title:'Mathematics mid term',type:'Exam',time:'10:00 AM',detail:'Room 201 · Chapters 1–6.' },
  { date:'2026-10-08',title:'Science mid term',type:'Exam',time:'10:00 AM',detail:'Room 203 · Units 1–4.' },
  { date:'2026-10-10',title:'Term 2 fee due date',type:'Fee',time:'All day',detail:'Fee statement is available in Fee Overview.' },
  { date:'2026-10-17',title:'Annual sports trials',type:'Event',time:'08:00 AM',detail:'School sports ground.' },
  { date:'2026-10-24',title:'Parent–Teacher Meeting',type:'Meeting',time:'10:00 AM',detail:'Class VIII wing.' },
];
export const galleryItems = [
  { title:'Inter-house sports day',category:'Sports',tone:'from-amber-100 to-rose-200',icon:'🏃' },
  { title:'Independence Day assembly',category:'Cultural Events',tone:'from-orange-100 to-rose-200',icon:'🎉' },
  { title:'Annual day rehearsal',category:'Annual Day',tone:'from-violet-100 to-pink-200',icon:'🎭' },
  { title:'Field trip · Science Museum',category:'School Trips',tone:'from-sky-100 to-cyan-200',icon:'🚌' },
  { title:'Junior robotics challenge',category:'Competitions',tone:'from-emerald-100 to-teal-200',icon:'🤖' },
  { title:'Classroom science project',category:'Classroom',tone:'from-lime-100 to-emerald-200',icon:'🔬' },
  { title:'Book week celebration',category:'Events',tone:'from-fuchsia-100 to-purple-200',icon:'📚' },
  { title:'Football team finals',category:'Sports',tone:'from-yellow-100 to-orange-200',icon:'⚽' },
];
export const communicationHistory = [
  { id:'MSG-44',sender:'Meera Nair · Class teacher',subject:'Mathematics assignment feedback',message:'Please include the working steps in your quadratic equation submission.',date:'29 Sep 2026 · 9:14 AM',status:'Unread' as const },
  { id:'MSG-42',sender:'School office',subject:'Student ID card collection',message:'Your updated school ID card is ready at the reception desk.',date:'28 Sep 2026 · 2:10 PM',status:'Read' as const },
  { id:'MSG-38',sender:'Arjun Rao · Science',subject:'Lab preparation',message:'Please review the safety notes before Thursday’s practical session.',date:'25 Sep 2026 · 11:35 AM',status:'Read' as const },
  { id:'MSG-32',sender:'Parent portal',subject:'Parent meeting confirmed',message:'Your parent meeting request has been confirmed for 24 October.',date:'22 Sep 2026 · 4:30 PM',status:'Read' as const },
];
