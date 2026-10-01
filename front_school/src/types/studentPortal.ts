export interface Student { id: string; admissionNo: string; name: string; className: string; section: string; rollNo: string; dateOfBirth: string; bloodGroup: string; guardianName: string; guardianPhone: string; address: string; academicYear: string }
export interface Teacher { id: string; name: string; email?: string; phone?: string; subject?: string }
export interface Subject { id: string; name: string; teacher: string; room: string; mark: number; attendance: number }
export interface Attendance { date: string; status: 'present'|'absent'|'late'|'holiday'; subject?: string }
export interface Assignment { id: string; subject: string; title: string; teacher: string; assigned: string; due: string; status: 'Pending'|'Submitted'|'Graded'|'Late'; description?: string; priority?: 'Low'|'Normal'|'High' }
export interface Exam { id: string; name: string; subject: string; date: string; time: string; duration: number; questions: number; status: 'Available'|'Upcoming'|'Completed'; marks?: number; total?: number; grade?: string }
export interface Result { subject: string; exam: string; marks: number; total: number; grade: string; rank?: number }
export interface Fee { category: string; total: number; paid: number; dueDate?: string; status: 'Paid'|'Pending'|'Overdue' }
export interface Notice { title: string; category: string; date: string; text: string; important?: boolean; read?: boolean; attachment?: string }
export interface Notification { id: string; type: string; title: string; detail: string; when: string; read: boolean }
export interface SchoolEvent { name: string; date: string; time: string; place: string; kind: string }
export interface Book { id: string; title: string; author: string; category: string; status: 'Available'|'Issued'; dueDate?: string }
export interface Transport { bus: string; driver: string; route: string; pickup: string; drop: string; eta: string; status: string; driverPhone: string }
export interface HealthRecord { bloodGroup: string; allergies: string[]; medicalNotes: string; vaccinationRecords: string[]; checkups: { date: string; summary: string }[]; emergencyContact: string }
export interface Communication { id: string; sender: string; subject: string; message: string; date: string; status: 'Read'|'Unread' }
export interface SchoolVisit { id: string; visitor: string; relationship: string; purpose: string; date: string; time: string; status: 'Pending'|'Approved'|'Completed'|'Cancelled' }
