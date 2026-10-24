import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { FACULTY_MOCK_DATA } from '../../../core/mocks/faculty.mock';
import { ExamRegistration } from '../../../models/faculty.model';

@Injectable({
  providedIn: 'root',
})
export class MockExamRepository {
  getRegistrations(): Observable<ExamRegistration[]> {
    return of([...FACULTY_MOCK_DATA.examRegistrations]);
  }

  addRegistration(input: Omit<ExamRegistration, 'id'>): Observable<ExamRegistration> {
    const registration: ExamRegistration = {
      id: Math.max(0, ...FACULTY_MOCK_DATA.examRegistrations.map((item) => item.id)) + 1,
      ...input,
    };
    FACULTY_MOCK_DATA.examRegistrations.push(registration);
    return of(registration);
  }

  updateRegistration(
    id: number,
    input: Omit<ExamRegistration, 'id'>,
  ): Observable<ExamRegistration | null> {
    const index = FACULTY_MOCK_DATA.examRegistrations.findIndex((item) => item.id === id);
    if (index === -1) {
      return of(null);
    }

    const registration = { id, ...input };
    FACULTY_MOCK_DATA.examRegistrations[index] = registration;
    return of(registration);
  }
}
