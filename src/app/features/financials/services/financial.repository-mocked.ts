import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { FACULTY_MOCK_DATA } from '../../../core/mocks/faculty.mock';
import { FinancialTransaction } from '../../../models/faculty.model';

@Injectable({
  providedIn: 'root',
})
export class MockFinancialRepository {
  getTransactions(): Observable<FinancialTransaction[]> {
    return of([...FACULTY_MOCK_DATA.financialTransactions]);
  }
}
