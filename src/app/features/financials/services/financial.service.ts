import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { forkJoin, Observable, of, tap } from 'rxjs';

import { FACULTY_MOCK_DATA } from '../../../core/mocks/faculty.mock';
import {
  FinancialTransaction,
  FinancialTransactionStatus,
  Student,
} from '../../../models/faculty.model';
import { FinancialTransactionInput, MockFinancialRepository } from './financial.repository-mocked';

export interface FinancialBalanceSummary {
  totalBilled: number;
  totalPaid: number;
  currentOwed: number;
}

export interface PaymentPlanItem {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: FinancialTransactionStatus;
  paidAt?: string;
  paymentDate?: string | null;
  transaction?: FinancialTransaction | null;
}

@Injectable({
  providedIn: 'root',
})
export class FinancialService {
  private readonly financialRepository = inject(MockFinancialRepository);

  private readonly financialResource = rxResource({
    stream: () => this.financialRepository.getTransactions(),
  });

  private readonly financialTransactions = this.financialResource.value;

  getStudentByUserId(userId: number): Student | null {
    return FACULTY_MOCK_DATA.students.find((student) => student.userId === userId) ?? null;
  }

  getTransactionById(id: number): FinancialTransaction | null {
    const source = this.financialTransactions() ?? FACULTY_MOCK_DATA.financialTransactions;
    return source.find((transaction) => transaction.id === id) ?? null;
  }

  createTransaction(input: FinancialTransactionInput) {
    return this.financialRepository
      .addTransaction(input)
      .pipe(tap(() => this.financialResource.reload()));
  }

  updateTransaction(id: number, input: FinancialTransactionInput) {
    return this.financialRepository
      .updateTransaction(id, input)
      .pipe(tap(() => this.financialResource.reload()));
  }

  deleteTransaction(id: number) {
    console.log('Deleting transaction with ID:', id);
    return this.financialRepository
      .deleteTransaction(id)
      .pipe(tap(() => this.financialResource.reload()));
  }

  payAllOutstanding(studentId: number): Observable<(FinancialTransaction | null)[]> {
    const outstanding = this.getPaymentPlan(studentId).filter((item) => item.status !== 'PAID');
    return this.settleInstallments(studentId, outstanding);
  }

  paySelectedInstallments(
    studentId: number,
    installmentNumbers: number[],
  ): Observable<(FinancialTransaction | null)[]> {
    const selectedNumbers = new Set(installmentNumbers);
    const selectedOutstanding = this.getPaymentPlan(studentId).filter(
      (item) => selectedNumbers.has(item.installmentNumber) && item.status !== 'PAID',
    );
    return this.settleInstallments(studentId, selectedOutstanding);
  }

  private settleInstallments(
    studentId: number,
    installments: PaymentPlanItem[],
  ): Observable<(FinancialTransaction | null)[]> {
    const paidAt = new Date().toISOString();
    const requests = installments.map((item) => {
      if (item.transaction) {
        return this.financialRepository.updateTransaction(item.transaction.id, {
          ...item.transaction,
          status: 'PAID',
          paidAt,
        });
      }

      return this.financialRepository.addTransaction({
        studentId,
        description: `Tuition Installment ${item.installmentNumber}/12`,
        amount: item.amount,
        currency: 'EUR',
        type: 'PAYMENT',
        status: 'PAID',
        dueDate: item.dueDate,
        paidAt,
        installmentNumber: item.installmentNumber,
      });
    });

    if (!requests.length) {
      return of([]);
    }

    return forkJoin(requests).pipe(tap(() => this.financialResource.reload()));
  }

  getTransactions(studentId: number): FinancialTransaction[] {
    const source = this.financialTransactions() ?? FACULTY_MOCK_DATA.financialTransactions;

    return [...source]
      .filter((transaction) => transaction.studentId === studentId)
      .sort((left, right) => new Date(right.dueDate).getTime() - new Date(left.dueDate).getTime());
  }

  getInstallmentAmount(studentId: number): number {
    const student = FACULTY_MOCK_DATA.students.find((item) => item.id === studentId);
    const studyProgram = FACULTY_MOCK_DATA.studyPrograms.find(
      (item) => item.id === student?.studyProgramId,
    );
    if (!studyProgram) {
      return 0;
    }

    return (studyProgram.ectsPerYear * studyProgram.costPerEcts) / 12;
  }

  calculateBalance(studentId: number): FinancialBalanceSummary {
    const transactions = this.getTransactions(studentId);

    const totalBilled = transactions
      .filter(
        (transaction) =>
          (transaction.type === 'TUITION_CHARGE' || transaction.type === 'FEE') &&
          transaction.status !== 'CANCELLED',
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalPaid = transactions
      .filter((transaction) => transaction.type === 'PAYMENT' && transaction.status === 'PAID')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      totalBilled,
      totalPaid,
      currentOwed: Math.max(0, totalBilled - totalPaid),
    };
  }

  getPaymentPlan(studentId: number): PaymentPlanItem[] {
    const transactions = this.getTransactions(studentId);
    const payments = transactions.filter(
      (transaction) =>
        transaction.type === 'PAYMENT' &&
        transaction.installmentNumber !== undefined &&
        transaction.status !== 'CANCELLED',
    );
    const installmentPayments = new Map<number, FinancialTransaction[]>();

    for (const transaction of payments) {
      const installmentNumber = transaction.installmentNumber!;
      const entries = installmentPayments.get(installmentNumber) ?? [];
      entries.push(transaction);
      installmentPayments.set(installmentNumber, entries);
    }

    const plan: PaymentPlanItem[] = [];
    const startDate = new Date('2025-09-12T00:00:00Z');
    const installmentAmount = this.getInstallmentAmount(studentId);

    for (let installmentNumber = 1; installmentNumber <= 12; installmentNumber += 1) {
      const dueDate = new Date(startDate);
      dueDate.setUTCMonth(startDate.getUTCMonth() + installmentNumber - 1);
      const isoDate = dueDate.toISOString().slice(0, 10);
      const transactionsForInstallment = installmentPayments.get(installmentNumber) ?? [];
      const transaction = transactionsForInstallment[0];
      const directlyPaidAmount = transactionsForInstallment
        .filter((item) => item.status === 'PAID')
        .reduce((sum, item) => sum + item.amount, 0);
      const isPaid = installmentAmount > 0 && directlyPaidAmount >= installmentAmount;
      const status = isPaid
        ? 'PAID'
        : this.resolveInstallmentStatus(transaction, isoDate);
      const paidAt =
        transactionsForInstallment.find((item) => item.status === 'PAID')?.paidAt ??
        transaction?.paidAt;

      plan.push({
        installmentNumber,
        dueDate: isoDate,
        amount: installmentAmount,
        status,
        paidAt,
        paymentDate: paidAt ?? null,
        transaction: transaction ?? null,
      });
    }

    return plan;
  }

  getNextDueInstallment(studentId: number): FinancialTransaction | null {
    const paymentPlan = this.getPaymentPlan(studentId);
    const nextDue = paymentPlan
      .filter((entry) => entry.status !== 'PAID')
      .sort(
        (left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime(),
      )[0];

    if (!nextDue) {
      return null;
    }

    const resolvedTransaction: FinancialTransaction = {
      id: nextDue.transaction?.id ?? nextDue.installmentNumber,
      studentId,
      description:
        nextDue.transaction?.description ?? `Tuition Installment ${nextDue.installmentNumber}/12`,
      amount: nextDue.transaction?.amount ?? nextDue.amount,
      currency: nextDue.transaction?.currency ?? 'EUR',
      type: nextDue.transaction?.type ?? 'PAYMENT',
      status: nextDue.status,
      dueDate: nextDue.dueDate,
      paidAt: nextDue.transaction?.paidAt ?? nextDue.paidAt,
      installmentNumber: nextDue.installmentNumber,
    };

    return resolvedTransaction;
  }

  private resolveInstallmentStatus(
    transaction: FinancialTransaction | undefined,
    dueDate: string,
  ): FinancialTransactionStatus {
    if (transaction?.status === 'PAID') {
      return 'PAID';
    }

    if (transaction?.status === 'OVERDUE') {
      return 'OVERDUE';
    }

    const today = new Date();
    const due = new Date(`${dueDate}T00:00:00`);

    return due < today ? 'OVERDUE' : 'PENDING';
  }
}
