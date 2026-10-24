import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

import { FACULTY_MOCK_DATA } from '../../../core/mocks/faculty.mock';
import {
  ExamRegistration,
  ExamSession,
  Student,
} from '../../../models/faculty.model';
import { MockExamRepository } from './exam.repository-mocked';

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  private readonly examRepository = inject(MockExamRepository);

  getStudentByUserId(userId: number): Student | null {
    return FACULTY_MOCK_DATA.students.find((student) => student.userId === userId) ?? null;
  }

  getRegistrations(studentId: number): ExamRegistration[] {
    return FACULTY_MOCK_DATA.examRegistrations.filter(
      (registration) => registration.studentId === studentId,
    );
  }

  getAvailableSessions(studentId: number): ExamSession[] {
    const student = FACULTY_MOCK_DATA.students.find((item) => item.id === studentId);
    if (!student) {
      return [];
    }

    return FACULTY_MOCK_DATA.examSessions
      .filter(
        (session) =>
          session.status === 'OPEN' &&
          student.enrolledCourseIds.includes(session.courseId) &&
          !this.getRegistrations(studentId).some(
            (registration) =>
              registration.examSessionId === session.id && registration.status === 'REGISTERED',
          ) &&
          session.registeredCount < session.capacity,
      )
      .sort(
        (left, right) =>
          new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime(),
      );
  }

  register(studentId: number, examSessionId: number): Observable<ExamRegistration | null> {
    const session = FACULTY_MOCK_DATA.examSessions.find((item) => item.id === examSessionId);
    if (
      !session ||
      session.status !== 'OPEN' ||
      session.registeredCount >= session.capacity ||
      !this.getAvailableSessions(studentId).some((item) => item.id === examSessionId)
    ) {
      return of(null);
    }

    const registrationInput: Omit<ExamRegistration, 'id'> = {
      examSessionId,
      studentId,
      registeredAt: new Date().toISOString(),
      status: 'REGISTERED',
    };

    return this.examRepository.addRegistration(registrationInput).pipe(
      tap(() => {
        session.registeredCount += 1;
      }),
    );
  }

  cancel(registration: ExamRegistration): Observable<ExamRegistration | null> {
    if (registration.status !== 'REGISTERED') {
      return of(null);
    }

    const session = FACULTY_MOCK_DATA.examSessions.find(
      (item) => item.id === registration.examSessionId,
    );

    return this.examRepository
      .updateRegistration(registration.id, {
        ...registration,
        status: 'CANCELLED',
      })
      .pipe(
        tap((updated) => {
          if (updated && session) {
            session.registeredCount = Math.max(0, session.registeredCount - 1);
          }
        }),
      );
  }
}
