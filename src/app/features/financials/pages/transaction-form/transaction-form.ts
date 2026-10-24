import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  FinancialTransactionStatus,
  FinancialTransactionType,
} from '../../../../models/faculty.model';
import { FinancialService } from '../../services/financial.service';
import { PageFooterAction, PageFooterService } from '../../../../shared/ui/page-footer/page-footer.service';

@Component({
  selector: 'app-financial-transaction-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.scss',
})
export class FinancialTransactionFormComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly financialService = inject(FinancialService);
  private readonly pageFooterService = inject(PageFooterService);

  protected readonly types: FinancialTransactionType[] = ['TUITION_CHARGE', 'PAYMENT', 'REFUND', 'FEE'];
  protected readonly statuses: FinancialTransactionStatus[] = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'];
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
    const id = this.route.snapshot.paramMap.get('id');
    this.transactionId = id ? Number(id) : null;
    this.isEditMode = this.transactionId !== null && !Number.isNaN(this.transactionId);
    const existing = this.isEditMode ? this.financialService.getTransactionById(this.transactionId!) : null;
    if (this.isEditMode && !existing) {
      this.router.navigate(['/financials']);
      return;
    }
    this.studentId = Number(this.route.snapshot.queryParamMap.get('studentId') ?? existing?.studentId ?? 0);
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
    this.updateFooterActions();
    this.transactionForm.statusChanges.subscribe(() => this.updateFooterActions());
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
        label: this.isEditMode ? 'Save changes' : 'Create transaction',
        icon: this.isEditMode ? 'save' : 'add',
        variant: 'flat',
        color: 'primary',
        disabled: this.transactionForm.invalid || !this.studentId,
        onClick: () => this.save(),
      },
    ]);
  }

  save(): void {
    if (this.transactionForm.invalid || !this.studentId) {
      this.transactionForm.markAllAsTouched();
      return;
    }
    const values = this.transactionForm.getRawValue();
    const { installmentNumber, ...transactionValues } = values;
    const input = {
      ...transactionValues,
      ...(installmentNumber === null ? {} : { installmentNumber }),
      studentId: this.studentId,
      currency: 'EUR' as const,
    };
    const request$ = this.isEditMode
      ? this.financialService.updateTransaction(this.transactionId!, input)
      : this.financialService.createTransaction(input);
    request$.subscribe(() => this.router.navigate(['/financials']));
  }

  cancel(): void {
    this.router.navigate(['/financials']);
  }
}
