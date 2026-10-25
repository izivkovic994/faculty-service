import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';

import { APP_NAME } from '../../../../core/constants/app.constants';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { FinancialService } from '../../../financials/services/financial.service';
import { NewsService } from '../../../news/services/news.service';
import { FinancialTransaction, NewsArticle } from '../../../../models/faculty.model';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, MatButtonModule, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePageComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly newsService = inject(NewsService);
  private readonly financialService = inject(FinancialService);

  protected readonly appName = APP_NAME;
  protected readonly currentUser = this.authService.currentUser;
  protected readonly userDisplayName = computed(
    () => this.currentUser()?.displayName ?? 'Faculty member',
  );
  protected readonly importantNews = computed(() => {
    return this.newsService.news()?.filter((news) => news.category === 'IMPORTANT') ?? [];
  });
  protected readonly student = computed(() => {
    const user = this.currentUser();
    return user ? this.financialService.getStudentByUserId(user.id) : null;
  });
  protected readonly balance = computed(() =>
    this.financialService.calculateBalance(this.student()?.id ?? 0),
  );
  protected readonly nextDue = computed(() =>
    this.financialService.getNextDueInstallment(this.student()?.id ?? 0),
  );

  protected openNewsNotification(article: NewsArticle): void {
    this.router.navigate(['/news'], {
      queryParams: { expanded: article.id },
    });
  }

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
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
