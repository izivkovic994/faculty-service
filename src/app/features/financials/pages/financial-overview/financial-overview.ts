import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';

import {
  FinancialTransaction,
  FinancialTransactionStatus,
  FinancialTransactionType,
} from '../../../../models/faculty.model';
import { UserRole } from '../../../../core/auth/models/user.model';
import { AUTH_MOCK_USERS } from '../../../../core/auth/mocks/auth.mock';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { FinancialService } from '../../services/financial.service';
import { FACULTY_MOCK_DATA } from '../../../../core/mocks/faculty.mock';
import { ConfirmDialogComponent } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import {
  PageFooterAction,
  PageFooterService,
} from '../../../../shared/ui/page-footer/page-footer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-financial-overview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatDialogModule,
    RouterLink,
  ],
  templateUrl: './financial-overview.html',
  styleUrl: './financial-overview.scss',
})
export class FinancialOverviewComponent implements OnDestroy {
  private readonly financialService = inject(FinancialService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly pageFooterService = inject(PageFooterService);
  protected readonly UserRole = UserRole;
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly searchQuery = signal('');
  protected readonly selectedStudentId = signal<number | null>(null);
  private readonly refreshTrigger = signal(0);

  readonly currentUser = computed(() => {
    const user =
      typeof this.authService.currentUser === 'function'
        ? this.authService.currentUser()
        : this.authService.currentUser;
    return user ?? null;
  });

  readonly isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);

  readonly students = computed(() =>
    FACULTY_MOCK_DATA.students
      .map((student) => ({
        student,
        user: AUTH_MOCK_USERS.find((user) => user.id === student.userId),
      }))
      .filter((item) => item.user),
  );

  readonly filteredStudents = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return [];
    }

    return this.students().filter(({ student, user }) =>
      `${user?.displayName} ${user?.email} ${student.studentNumber}`.toLowerCase().includes(query),
    );
  });

  readonly student = computed(() => {
    const user = this.currentUser();
    const selectedId = this.selectedStudentId();
    return this.isAdmin() && selectedId
      ? (FACULTY_MOCK_DATA.students.find((item) => item.id === selectedId) ?? null)
      : user
        ? this.financialService.getStudentByUserId(user.id)
        : null;
  });

  readonly studentId = computed(() => this.student()?.id ?? 0);
  readonly studentUser = computed(() => {
    const currentStudent = this.student();
    return currentStudent
      ? (AUTH_MOCK_USERS.find((user) => user.id === currentStudent.userId) ?? null)
      : null;
  });

  readonly balance = computed(() => {
    this.refreshTrigger();
    return this.financialService.calculateBalance(this.studentId());
  });

  readonly paymentPlan = computed(() => {
    this.refreshTrigger();
    return this.financialService.getPaymentPlan(this.studentId());
  });

  readonly nextDue = computed(() => {
    this.refreshTrigger();
    return this.financialService.getNextDueInstallment(this.studentId());
  });

  readonly transactions$ = toObservable(
    computed(() => ({ id: this.studentId(), trigger: this.refreshTrigger() })),
  ).pipe(switchMap(({ id }) => of(this.financialService.getTransactions(id))));

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

  private refreshData(): void {
    this.refreshTrigger.update((count) => count + 1);
  }

  constructor() {
    this.searchControl.valueChanges.subscribe((value) => {
      this.searchQuery.set(value.trim());
    });

    effect(() => this.updateFooterActions());
  }

  ngOnDestroy(): void {
    this.pageFooterService.clear();
  }

  private updateFooterActions(): void {
    const studentId = this.studentId();
    const actions: PageFooterAction[] = [];

    if (this.isAdmin() && studentId) {
      actions.push({
        label: 'Add transaction',
        icon: 'add',
        variant: 'flat',
        color: 'primary',
        onClick: () =>
          this.router.navigate(['/financials/transactions/new'], { queryParams: { studentId } }),
      });
    } else if (!this.isAdmin() && studentId && this.balance().currentOwed > 0) {
      actions.push({
        label: 'Pay all outstanding',
        icon: 'payments',
        variant: 'flat',
        color: 'primary',
        onClick: () => this.payAll(),
      });
    }

    this.pageFooterService.setActions(actions);
  }

  selectStudent(studentId: number): void {
    this.selectedStudentId.set(studentId);
  }

  clearSelectedStudent(): void {
    this.selectedStudentId.set(null);
    this.searchControl.setValue('');
    this.searchQuery.set('');
  }

  payAll(): void {
    const id = this.studentId();
    if (id) {
      this.financialService.payAllOutstanding(id);
      this.refreshData();
    }
  }

  confirmDelete(transaction: FinancialTransaction): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete transaction',
        message: `Delete "${transaction.description}"? This cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.financialService.deleteTransaction(transaction.id).subscribe(() => {
          this.refreshData();
        });
      }
    });
  }

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
