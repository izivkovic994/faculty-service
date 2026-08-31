import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';

import {
  FinancialTransaction,
  FinancialTransactionStatus,
  FinancialTransactionType,
} from '../../../../models/faculty.model';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { FinancialService } from '../../services/financial.service';

@Component({
  selector: 'app-financial-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financial-overview.html',
  styleUrl: './financial-overview.scss',
})
export class FinancialOverviewComponent {
  private readonly financialService = inject(FinancialService);
  private readonly authService = inject(AuthService);

  // 1. Resolve current user from AuthService (handles Signal or Property)
  readonly currentUser = computed(() => {
    const user =
      typeof this.authService.currentUser === 'function'
        ? this.authService.currentUser()
        : this.authService.currentUser;
    return user ?? null;
  });

  // 2. Locate matching Student record using currentUser.id (userId)
  readonly student = computed(() => {
    const user = this.currentUser();
    return user ? this.financialService.getStudentByUserId(user.id) : null;
  });

  // 3. Extract reactive studentId (defaults to 0 if not found)
  readonly studentId = computed(() => this.student()?.id ?? 0);

  // 4. Derive financial data reactively based on studentId()
  readonly balance = computed(() => this.financialService.calculateBalance(this.studentId()));
  readonly paymentPlan = computed(() => this.financialService.getPaymentPlan(this.studentId()));
  readonly nextDue = computed(() => this.financialService.getNextDueInstallment(this.studentId()));

  readonly transactions$ = toObservable(this.studentId).pipe(
    switchMap((id) => of(this.financialService.getTransactions(id))),
  );

  readonly paidProgress = computed(() => {
    const { totalBilled, totalPaid } = this.balance();
    return totalBilled === 0 ? 0 : (totalPaid / totalBilled) * 100;
  });

  readonly installmentsPaid = computed(
    () => this.paymentPlan().filter((item) => item.status === 'PAID').length,
  );

  readonly balanceState = computed(() => {
    const { currentOwed } = this.balance();

    if (currentOwed <= 0) {
      return 'success';
    }

    return this.nextDue()?.status === 'OVERDUE' ? 'danger' : 'warning';
  });

  protected readonly dateFormatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  protected formatDate(value?: string | null): string {
    if (!value) {
      return '—';
    }

    return this.dateFormatter.format(new Date(value));
  }

  protected getStatusClass(status: FinancialTransactionStatus): string {
    switch (status) {
      case 'PAID':
        return 'status-badge status-badge--paid';
      case 'OVERDUE':
        return 'status-badge status-badge--overdue';
      default:
        return 'status-badge status-badge--pending';
    }
  }

  protected getTypeClass(type: FinancialTransactionType): string {
    switch (type) {
      case 'PAYMENT':
        return 'type-badge type-badge--payment';
      case 'FEE':
        return 'type-badge type-badge--fee';
      case 'TUITION_CHARGE':
      default:
        return 'type-badge type-badge--tuition';
    }
  }

  protected getBalanceLabel(transaction?: FinancialTransaction | null): string {
    if (!transaction) {
      return 'All settled';
    }

    if (transaction.status === 'OVERDUE') {
      return 'Overdue';
    }

    if (transaction.status === 'PENDING') {
      return 'Pending payment';
    }

    return 'On track';
  }
}
