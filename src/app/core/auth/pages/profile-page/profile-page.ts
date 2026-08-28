import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';

import { MockAuthRepository } from '../../services/auth.repository-mocked';
import { ConfirmDialogComponent } from '../../../../shared/ui/confirm-dialog';
import { DEMO_PASSWORD } from '../../mocks/auth.mock';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePageComponent {
  private readonly authRepo = inject(MockAuthRepository);
  private readonly dialog = inject(MatDialog);

  readonly currentUser = this.authRepo.currentUser;

  displayNameCtrl = new FormControl('', { nonNullable: true });

  constructor() {
    const user = this.currentUser();
    if (user) {
      this.displayNameCtrl.setValue(user.displayName);
    }
  }

  saveDisplayName(): void {
    const user = this.currentUser();
    if (!user) return;

    const updated = { ...user, displayName: this.displayNameCtrl.value };
    this.authRepo.currentUser.set(updated);
    localStorage.setItem('faculty-service-current-user', JSON.stringify(updated));
  }

  cancelChanges(): void {
    const user = this.currentUser();
    this.displayNameCtrl.setValue(user?.displayName ?? '');
  }

  resetPassword(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reset password',
        message: 'Reset your password to the demo password? This is a mocked flow.',
        confirmText: 'Reset',
        cancelText: 'Cancel',
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        alert(`Demo password is: ${DEMO_PASSWORD}`);
      }
    });
  }
}
