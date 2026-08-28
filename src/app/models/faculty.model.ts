export type AcademicTerm = `${number}/${number}`;

export type NewsCategory = 'GENERAL' | 'ACADEMIC' | 'EVENT' | 'IMPORTANT';
export type ExamStatus = 'OPEN' | 'CLOSED' | 'COMPLETED';
export type ExamRegistrationStatus = 'REGISTERED' | 'CANCELLED' | 'ATTENDED' | 'ABSENT';
export type Grade = 1 | 2 | 3 | 4 | 5;
export type FinancialTransactionType = 'TUITION' | 'PAYMENT' | 'REFUND' | 'FEE';
export type FinancialTransactionStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type SupportTicketPriority = 'LOW' | 'NORMAL' | 'HIGH';
export type AdministrationRequestType =
  | 'ENROLLMENT_CONFIRMATION'
  | 'TRANSCRIPT'
  | 'STUDENT_CARD'
  | 'OTHER';
export type AdministrationRequestStatus = 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export interface Department {
  id: number;
  name: string;
  shortName: string;
}

export interface StudyProgram {
  id: number;
  name: string;
  degree: 'BACHELOR' | 'MASTER' | 'DOCTORATE';
  departmentId: number;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  ects: number;
  semester: number;
  departmentId: number;
  professorIds: number[];
}

export interface Student {
  id: number;
  userId: number;
  studentNumber: string;
  studyProgramId: number;
  yearOfStudy: number;
  enrollmentYear: number;
  enrolledCourseIds: number[];
}

export interface Professor {
  id: number;
  userId: number;
  employeeNumber: string;
  title: 'ASSISTANT' | 'LECTURER' | 'PROFESSOR';
  departmentId: number;
  office: string;
  courseIds: number[];
}

export interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  publishedAt: string;
  authorUserId: number;
  isPinned: boolean;
}

export interface ExamSession {
  id: number;
  courseId: number;
  term: AcademicTerm;
  scheduledAt: string;
  room: string;
  capacity: number;
  registeredCount: number;
  status: ExamStatus;
}

export interface ExamRegistration {
  id: number;
  examSessionId: number;
  studentId: number;
  registeredAt: string;
  status: ExamRegistrationStatus;
  grade?: Grade;
}

export interface FinancialTransaction {
  id: number;
  studentId: number;
  description: string;
  amount: number;
  currency: 'EUR';
  type: FinancialTransactionType;
  status: FinancialTransactionStatus;
  dueDate: string;
  paidAt?: string;
}

export interface SupportTicket {
  id: number;
  requesterUserId: number;
  subject: string;
  description: string;
  category: 'ACADEMIC' | 'TECHNICAL' | 'FINANCIAL' | 'OTHER';
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedToUserId?: number;
}

export interface AdministrationRequest {
  id: number;
  requesterUserId: number;
  type: AdministrationRequestType;
  subject: string;
  status: AdministrationRequestStatus;
  submittedAt: string;
  resolvedAt?: string;
  notes?: string;
}

export interface FacultyMockData {
  departments: Department[];
  studyPrograms: StudyProgram[];
  courses: Course[];
  students: Student[];
  professors: Professor[];
  news: NewsArticle[];
  examSessions: ExamSession[];
  examRegistrations: ExamRegistration[];
  financialTransactions: FinancialTransaction[];
  supportTickets: SupportTicket[];
  administrationRequests: AdministrationRequest[];
}
