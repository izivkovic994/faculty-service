import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { UserRole } from '../../../../core/auth/models/user.model';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { NewsArticle } from '../../../../models/faculty.model';
import { PageFooterAction, PageFooterService } from '../../../../shared/ui/page-footer/page-footer.service';
import { NewsService } from '../../services/news.service';

@Component({
  selector: 'app-news-page',
  imports: [DatePipe, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './news-page.html',
  styleUrl: './news-page.scss',
})
export class NewsPageComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly newsService = inject(NewsService);
  private readonly pageFooterService = inject(PageFooterService);

  protected readonly news = this.newsService.news;
  protected expandedNewsIds = new Set<number>();

  ngOnInit(): void {
    this.pageFooterService.setActions(this.getFooterActions());
  }

  ngOnDestroy(): void {
    this.pageFooterService.clear();
  }

  protected get canCreateNews(): boolean {
    return this.authService.currentUser()?.role === UserRole.ADMIN;
  }

  private getFooterActions(): PageFooterAction[] {
    if (!this.canCreateNews) {
      return [];
    }

    return [
      {
        icon: 'add',
        variant: 'fab',
        color: 'primary',
        routerLink: '/news/create',
        ariaLabel: 'Create news',
      },
    ];
  }

  protected toggleExpanded(articleId: number): void {
    if (this.expandedNewsIds.has(articleId)) {
      this.expandedNewsIds.delete(articleId);
      return;
    }

    this.expandedNewsIds.add(articleId);
  }

  protected isExpanded(articleId: number): boolean {
    return this.expandedNewsIds.has(articleId);
  }

  protected shouldShowReadMore(article: NewsArticle): boolean {
    const bodyText = (article.summary + ' ' + article.content).trim();
    return bodyText.length > 120;
  }

  protected getPreviewText(article: NewsArticle): string {
    const bodyText = (article.summary + ' ' + article.content).trim();
    return bodyText.length <= 100 ? bodyText : `${bodyText.slice(0, 100).trimEnd()}...`;
  }
}
