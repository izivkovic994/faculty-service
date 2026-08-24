import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="confirm-dialog">
      <h2 class="title">{{ data.title || 'Confirm' }}</h2>
      <p class="message">{{ data.message || 'Are you sure?' }}</p>

      <div class="actions">
        <button mat-button (click)="cancel()">{{ data.cancelText || 'Cancel' }}</button>
        <button mat-flat-button color="primary" (click)="confirm()">{{ data.confirmText || 'OK' }}</button>
      </div>
    </div>
  `,
  styles: [
    `.confirm-dialog { padding: 16px; }
     .title { margin: 0 0 8px 0; }
     .message { margin: 0 0 16px 0; }
     .actions { display:flex; gap:8px; justify-content:flex-end; }
    `,
  ],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
  ) {}

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
