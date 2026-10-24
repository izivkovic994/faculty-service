import { Component, computed, effect, inject, signal } from '@angular/core';

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
import { NewsArticle, NewsCategory } from '../../../models/faculty.model';
import { NewsService } from '../../../features/news/services/news.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import { FinancialService } from '../../../features/financials/services/financial.service';

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
  private readonly newsService = inject(NewsService);
  private readonly financialService = inject(FinancialService);
  private readonly dialog = inject(MatDialog);

  protected readonly currentUser = this.authService.currentUser;

  protected readonly owed = computed(() => {
    const user = this.currentUser();
    if (user?.role !== 'STUDENT') {
      return 0;
    }

    const student = this.financialService.getStudentByUserId(user.id);
    return student ? this.financialService.calculateBalance(student.id).currentOwed : 0;
  });

  protected readonly importantNews = computed(() => [
    ...(this.newsService.news()?.filter((news) => news.category === 'IMPORTANT') ?? []),
    ...(this.owed() >= 300
      ? [
          {
            id: -1,
            title: 'Outstanding Balance',
            summary: `Your outstanding balance is ${this.owed()}.`,
            content: `Please review your outstanding balance of ${this.owed()}.`,
            category: 'IMPORTANT' as NewsCategory,
            publishedAt: new Date().toISOString(),
            authorUserId: this.currentUser()!.id,
            isPinned: true,
          },
        ]
      : []),
  ]);

  protected readonly unreadNotifications = signal(0);
  private hasViewedNotifications = false;

  constructor() {
    effect(() => {
      const count = this.importantNews().length;
      if (!this.hasViewedNotifications) {
        this.unreadNotifications.set(count);
      }
    });
  }

  openProfile(): void {
    this.router.navigate(['/profile']);
  }

  openNewsNotification(article: NewsArticle): void {
    this.markNotificationsAsRead();
    if (article.id === -1) {
      this.router.navigate(['/financials']);
      return;
    }

    this.router.navigate(['/news'], {
      queryParams: { expanded: article.id },
    });
  }

  markNotificationsAsRead(): void {
    this.hasViewedNotifications = true;
    this.unreadNotifications.set(0);
  }

  onNotificationsMenuOpen(): void {
    this.markNotificationsAsRead();
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
