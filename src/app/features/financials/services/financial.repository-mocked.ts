import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { FACULTY_MOCK_DATA } from '../../../core/mocks/faculty.mock';
import { FinancialTransaction } from '../../../models/faculty.model';

export type FinancialTransactionInput = Omit<FinancialTransaction, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class MockFinancialRepository {
  getTransactions(): Observable<FinancialTransaction[]> {
    return of([...FACULTY_MOCK_DATA.financialTransactions]);
  }

  addTransaction(input: FinancialTransactionInput): Observable<FinancialTransaction> {
    const transaction: FinancialTransaction = {
      id: Math.max(0, ...FACULTY_MOCK_DATA.financialTransactions.map((item) => item.id)) + 1,
      ...input,
    };
    FACULTY_MOCK_DATA.financialTransactions.push(transaction);
    return of(transaction);
  }

  updateTransaction(
    id: number,
    input: FinancialTransactionInput,
  ): Observable<FinancialTransaction | null> {
    const index = FACULTY_MOCK_DATA.financialTransactions.findIndex((item) => item.id === id);
    if (index === -1) {
      return of(null);
    }
    const transaction = { id, ...input };
    FACULTY_MOCK_DATA.financialTransactions[index] = transaction;
    return of(transaction);
  }

  deleteTransaction(id: number): Observable<boolean> {
    const index = FACULTY_MOCK_DATA.financialTransactions.findIndex((item) => item.id === id);
    console.log(
      'MockFinancialRepository: Deleting transaction with ID:',
      id,
      'Found index:',
      index,
    );
    if (index === -1) {
      return of(false);
    }
    FACULTY_MOCK_DATA.financialTransactions.splice(index, 1);
    return of(true);
  }
}
