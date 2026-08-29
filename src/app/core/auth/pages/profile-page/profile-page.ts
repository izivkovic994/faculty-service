import { Component, inject, effect, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MockAuthRepository } from '../../services/auth.repository-mocked';
import { ConfirmDialogComponent } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { PageFooterAction, PageFooterService } from '../../../../shared/ui/page-footer/page-footer.service';
import { DEMO_PASSWORD } from '../../mocks/auth.mock';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  private readonly authRepo = inject(MockAuthRepository);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly pageFooterService = inject(PageFooterService);

  readonly currentUser = this.authRepo.currentUser;

  profileForm = new FormGroup({
    displayName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.profileForm.patchValue({
          displayName: user.displayName,
          email: user.email,
        });
      }
    });
  }

  ngOnInit(): void {
    this.updateFooterActions();
    this.profileForm.statusChanges.subscribe(() => this.updateFooterActions());
  }

  ngOnDestroy(): void {
    this.pageFooterService.clear();
  }

  private updateFooterActions(): void {
    this.pageFooterService.setActions(this.getFooterActions());
  }

  private getFooterActions(): PageFooterAction[] {
    return [
      {
        label: 'Cancel',
        variant: 'button',
        type: 'button',
        disabled: this.profileForm.pristine,
        onClick: () => this.cancelChanges(),
      },
      {
        label: 'Save Changes',
        variant: 'flat',
        icon: 'save',
        color: 'primary',
        type: 'button',
        disabled: this.profileForm.invalid || this.profileForm.pristine,
        onClick: () => this.saveProfile(),
      },
    ];
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    const user = this.currentUser();
    if (!user) return;

    const updated = {
      ...user,
      displayName: this.profileForm.controls.displayName.value,
      email: this.profileForm.controls.email.value,
    };

    this.authRepo.currentUser.set(updated);
    localStorage.setItem('faculty-service-current-user', JSON.stringify(updated));
    this.profileForm.markAsPristine();

    this.snackBar.open('Profile settings saved successfully!', 'Close', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
    });
  }

  cancelChanges(): void {
    const user = this.currentUser();
    if (!user) return;

    this.profileForm.reset({
      displayName: user.displayName,
      email: user.email,
    });
    this.profileForm.markAsPristine();
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
