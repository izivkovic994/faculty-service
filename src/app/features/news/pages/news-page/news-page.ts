import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { UserRole } from '../../../../core/auth/models/user.model';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { NewsArticle } from '../../../../models/faculty.model';
import {
  PageFooterAction,
  PageFooterService,
} from '../../../../shared/ui/page-footer/page-footer.service';
import { ConfirmDialogComponent } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { NewsService } from '../../services/news.service';

@Component({
  selector: 'app-news-page',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './news-page.html',
  styleUrl: './news-page.scss',
})
export class NewsPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly newsService = inject(NewsService);
  private readonly pageFooterService = inject(PageFooterService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly news = this.newsService.news;
  protected expandedNewsIds = new Set<number>();

  ngOnInit(): void {
    this.pageFooterService.setActions(this.getFooterActions());

    this.route.queryParamMap.subscribe((params) => {
      const expandedId = params.get('expanded');
      if (!expandedId) {
        return;
      }

      const parsedId = Number(expandedId);
      if (!Number.isNaN(parsedId)) {
        this.expandedNewsIds.add(parsedId);
        this.scrollToExpandedCard(parsedId);
      }
    });
  }

  ngAfterViewInit(): void {
    const expandedId = this.route.snapshot.queryParamMap.get('expanded');
    if (!expandedId) {
      return;
    }

    const parsedId = Number(expandedId);
    if (!Number.isNaN(parsedId)) {
      this.expandedNewsIds.add(parsedId);
      this.scrollToExpandedCard(parsedId);
    }
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

  protected toggleExpanded(article: NewsArticle): void {
    if (this.expandedNewsIds.has(article.id)) {
      this.expandedNewsIds.delete(article.id);
      return;
    }
    if (this.shouldShowReadMore(article)) {
      this.expandedNewsIds.add(article.id);
    }
  }

  protected isExpanded(articleId: number): boolean {
    return this.expandedNewsIds.has(articleId);
  }

  protected editNews(article: NewsArticle): void {
    this.router.navigate(['/news/edit', article.id]);
  }

  protected deleteNews(article: NewsArticle): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete news',
        message: `Are you sure you want to delete "${article.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.newsService.deleteNews(article.id).subscribe(() => {
        this.expandedNewsIds.delete(article.id);
      });
    });
  }

  protected shouldShowReadMore(article: NewsArticle): boolean {
    const bodyText = article.content.trim();
    return bodyText.length > 120;
  }

  protected getPreviewText(article: NewsArticle): string {
    const bodyText = article.content.trim();
    return bodyText.length <= 100 ? bodyText : `${bodyText.slice(0, 100).trimEnd()}...`;
  }

  private scrollToExpandedCard(articleId: number): void {
    setTimeout(() => {
      const element = document.getElementById(`news-card-${articleId}`);
      if (!element) {
        return;
      }

      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      element.classList.add('highlight');
      setTimeout(() => {
        element.classList.remove('highlight');
      }, 2000);
    }, 150);
  }
}
