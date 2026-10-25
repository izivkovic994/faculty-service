import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserRole } from '../../../../core/auth/models/user.model';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ConfirmDialogComponent } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import {
  FinancialTransactionStatus,
  FinancialTransactionType,
} from '../../../../models/faculty.model';
import { FinancialService } from '../../services/financial.service';
import { PageFooterAction, PageFooterService } from '../../../../shared/ui/page-footer/page-footer.service';

@Component({
  selector: 'app-financial-transaction-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
  ],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.scss',
})
export class FinancialTransactionFormComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly financialService = inject(FinancialService);
  private readonly pageFooterService = inject(PageFooterService);

  protected readonly types: FinancialTransactionType[] = ['TUITION_CHARGE', 'PAYMENT', 'REFUND', 'FEE'];
  protected readonly statuses: FinancialTransactionStatus[] = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'];
  protected readonly installmentNumbers = Array.from({ length: 12 }, (_, index) => index + 1);
  protected isAdmin = false;
  protected isStudentMode = false;
  protected isEditMode = false;
  private transactionId: number | null = null;
  private studentId = 0;

  protected readonly transactionForm = new FormGroup({
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    amount: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    type: new FormControl<FinancialTransactionType>('TUITION_CHARGE', { nonNullable: true }),
    status: new FormControl<FinancialTransactionStatus>('PENDING', { nonNullable: true }),
    dueDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    installmentNumber: new FormControl<number | null>(null),
  });

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    this.isAdmin = currentUser?.role === UserRole.ADMIN;
    this.isStudentMode = currentUser?.role === UserRole.STUDENT;

    const id = this.route.snapshot.paramMap.get('id');
    this.transactionId = id ? Number(id) : null;
    this.isEditMode = this.transactionId !== null && !Number.isNaN(this.transactionId);
    const existing = this.isEditMode ? this.financialService.getTransactionById(this.transactionId!) : null;
    if ((this.isEditMode && (!existing || !this.isAdmin)) || (!this.isAdmin && !this.isStudentMode)) {
      this.navigateToOverview();
      return;
    }

    this.studentId = this.isAdmin
      ? Number(this.route.snapshot.queryParamMap.get('studentId') ?? existing?.studentId ?? 0)
      : this.financialService.getStudentByUserId(currentUser?.id ?? 0)?.id ?? 0;
    if (!this.studentId) {
      this.navigateToOverview();
      return;
    }

    if (existing) {
      this.transactionForm.patchValue({
        description: existing.description,
        amount: existing.amount,
        type: existing.type,
        status: existing.status,
        dueDate: existing.dueDate,
        installmentNumber: existing.installmentNumber ?? null,
      });
    }
    if (this.isStudentMode) {
      this.transactionForm.controls.type.setValue('PAYMENT');
      this.transactionForm.controls.type.disable();
      this.transactionForm.controls.status.setValue('PENDING');
      this.transactionForm.controls.status.disable();
    }
    this.transactionForm.controls.type.valueChanges.subscribe((type) => {
      if (type !== 'PAYMENT') {
        this.transactionForm.controls.installmentNumber.setValue(null, { emitEvent: false });
      }
      this.syncInstallmentAmount();
      this.updateFooterActions();
    });
    this.transactionForm.controls.installmentNumber.valueChanges.subscribe(() => {
      this.syncInstallmentAmount();
      this.updateFooterActions();
    });
    this.syncInstallmentAmount();
    this.updateFooterActions();
    this.transactionForm.statusChanges.subscribe(() => this.updateFooterActions());
  }

  protected get isInstallmentPayment(): boolean {
    return (
      this.isAdmin &&
      this.transactionForm.controls.type.value === 'PAYMENT' &&
      this.transactionForm.controls.installmentNumber.value !== null
    );
  }

  ngOnDestroy(): void {
    this.pageFooterService.clear();
  }

  private updateFooterActions(): void {
    this.pageFooterService.setActions([
      {
        label: 'Cancel',
        variant: 'button',
        onClick: () => this.cancel(),
      },
      {
        label: this.isStudentMode
          ? 'Submit payment'
          : this.isEditMode
            ? 'Save changes'
            : 'Create transaction',
        icon: this.isStudentMode ? 'payments' : this.isEditMode ? 'save' : 'add',
        variant: 'flat',
        color: 'primary',
        disabled: this.transactionForm.invalid || !this.studentId,
        onClick: () => this.save(),
      },
    ]);
  }

  private syncInstallmentAmount(): void {
    const installmentNumber = this.transactionForm.controls.installmentNumber.value;
    const amountControl = this.transactionForm.controls.amount;
    if (
      !this.isAdmin ||
      this.transactionForm.controls.type.value !== 'PAYMENT' ||
      installmentNumber === null
    ) {
      amountControl.enable({ emitEvent: false });
      return;
    }

    const installmentAmount = this.financialService.getInstallmentAmount(this.studentId);
    amountControl.setValue(installmentAmount, { emitEvent: false });
    amountControl.disable({ emitEvent: false });
  }

  save(): void {
    if (this.transactionForm.invalid || !this.studentId) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    if (this.transactionForm.controls.type.value === 'PAYMENT') {
      this.dialog
        .open(ConfirmDialogComponent, {
          data: {
            title: this.isStudentMode ? 'Submit custom payment' : 'Confirm payment transaction',
            message: `Submit a ${this.formatAmount(this.transactionForm.controls.amount.value)} payment for this student?`,
            confirmText: this.isStudentMode ? 'Submit payment' : 'Confirm payment',
            cancelText: 'Cancel',
          },
        })
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.saveTransaction();
          }
        });
      return;
    }

    this.saveTransaction();
  }

  private saveTransaction(): void {
    const values = this.transactionForm.getRawValue();
    const { installmentNumber, ...transactionValues } = values;
    const input = {
      ...transactionValues,
      type: this.isStudentMode ? 'PAYMENT' as const : transactionValues.type,
      status: this.isStudentMode ? 'PENDING' as const : transactionValues.status,
      ...(installmentNumber === null ? {} : { installmentNumber }),
      studentId: this.studentId,
      currency: 'EUR' as const,
    };
    const request$ = this.isEditMode
      ? this.financialService.updateTransaction(this.transactionId!, input)
      : this.financialService.createTransaction(input);
    request$.subscribe((transaction) => {
      if (transaction) {
        this.navigateToOverview();
      }
    });
  }

  private formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2,
    }).format(amount);
  }

  cancel(): void {
    this.navigateToOverview();
  }

  private navigateToOverview(): void {
    if (this.isAdmin && this.studentId) {
      this.router.navigate(['/financials'], { queryParams: { studentId: this.studentId } });
      return;
    }

    this.router.navigate(['/financials']);
  }
}
