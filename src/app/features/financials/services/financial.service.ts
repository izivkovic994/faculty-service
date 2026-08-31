import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { FACULTY_MOCK_DATA } from '../../../core/mocks/faculty.mock';
import {
  FinancialTransaction,
  FinancialTransactionStatus,
  Student,
} from '../../../models/faculty.model';
import { MockFinancialRepository } from './financial.repository-mocked';

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

  getTransactions(studentId: number): FinancialTransaction[] {
    const source = this.financialTransactions() ?? FACULTY_MOCK_DATA.financialTransactions;

    return [...source]
      .filter((transaction) => transaction.studentId === studentId)
      .sort((left, right) => new Date(right.dueDate).getTime() - new Date(left.dueDate).getTime());
  }

  calculateBalance(studentId: number): FinancialBalanceSummary {
    const transactions = this.getTransactions(studentId);

    const totalBilled = transactions
      .filter((transaction) => transaction.type !== 'PAYMENT')
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
    const paymentMap = new Map<number, FinancialTransaction>();

    transactions
      .filter((transaction) => transaction.type === 'PAYMENT' && transaction.installmentNumber)
      .forEach((transaction) => {
        if (transaction.installmentNumber) {
          paymentMap.set(transaction.installmentNumber, transaction);
        }
      });

    const plan: PaymentPlanItem[] = [];
    const startDate = new Date('2025-09-12T00:00:00Z');

    for (let installmentNumber = 1; installmentNumber <= 12; installmentNumber += 1) {
      const dueDate = new Date(startDate);
      dueDate.setUTCMonth(startDate.getUTCMonth() + installmentNumber - 1);
      const isoDate = dueDate.toISOString().slice(0, 10);
      const transaction = paymentMap.get(installmentNumber);

      plan.push({
        installmentNumber,
        dueDate: isoDate,
        amount: 100,
        status: this.resolveInstallmentStatus(transaction, isoDate),
        paidAt: transaction?.paidAt,
        paymentDate: transaction?.paidAt ?? null,
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
