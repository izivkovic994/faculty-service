import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

import { APP_NAME } from '../../../core/constants/app.constants';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-toolbar',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatDividerModule,
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class ToolbarComponent {
  protected readonly appName = APP_NAME;
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  protected readonly currentUser = this.authService.currentUser;

  openProfile(): void {
    this.router.navigate(['/profile']);
  }

  confirmLogout(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Logout',
        message: 'Are you sure you want to log out?',
        confirmText: 'Logout',
        cancelText: 'Cancel',
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.logout();
      }
    });
  }

  private logout(): void {
    this.authService.logout();
  }
}
