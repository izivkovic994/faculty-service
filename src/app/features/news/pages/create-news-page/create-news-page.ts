import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { NewsService } from '../../services/news.service';
import { NewsArticle, NewsCategory } from '../../../../models/faculty.model';
import { PageFooterAction, PageFooterService } from '../../../../shared/ui/page-footer/page-footer.service';

@Component({
  selector: 'app-create-news-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './create-news-page.html',
  styleUrl: './create-news-page.scss',
})
export class CreateNewsPageComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly newsService = inject(NewsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly pageFooterService = inject(PageFooterService);

  protected readonly categories: NewsCategory[] = ['GENERAL', 'ACADEMIC', 'EVENT', 'IMPORTANT'];
  protected readonly newsForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    summary: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    content: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    category: new FormControl<NewsCategory>('GENERAL', { nonNullable: true }),
    isPinned: new FormControl(false, { nonNullable: true }),
  });

  protected isEditMode = false;
  protected loadError = false;
  protected saveError = false;
  private editNewsId: number | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.editNewsId = idParam ? Number(idParam) : null;
    this.isEditMode = this.editNewsId !== null && !Number.isNaN(this.editNewsId);

    if (this.isEditMode) {
      const existingNews = this.newsService.getArticleById(this.editNewsId!);
      if (existingNews) {
        this.patchNews(existingNews);
      } else {
        this.newsService.getNewsArticle(this.editNewsId!).subscribe({
          next: (article) => {
            this.patchNews(article);
            this.updateFooterActions();
          },
          error: () => {
            this.loadError = true;
          },
        });
      }
    }

    this.updateFooterActions();
    this.newsForm.statusChanges.subscribe(() => this.updateFooterActions());
  }

  ngOnDestroy(): void {
    this.pageFooterService.clear();
  }

  protected get footerActions(): PageFooterAction[] {
    return this.getFooterActions();
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
        onClick: () => this.cancel(),
      },
      {
        label: this.isEditMode ? 'Save changes' : 'Save',
        variant: 'flat',
        type: 'button',
        color: 'primary',
        icon: 'save',
        disabled: this.newsForm.invalid,
        onClick: () => this.saveNews(),
      },
    ];
  }

  saveNews(): void {
    this.saveError = false;
    if (this.newsForm.invalid) {
      this.newsForm.markAllAsTouched();
      return;
    }

    const user = this.authService.currentUser();
    if (!user) {
      return;
    }

    const payload = {
      ...this.newsForm.getRawValue(),
      authorUserId: user.id,
    };

    const request$ = this.isEditMode && this.editNewsId !== null
      ? this.newsService.updateNews(this.editNewsId, payload)
      : this.newsService.createNews(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/news']),
      error: () => {
        this.saveError = true;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/news']);
  }

  private patchNews(article: NewsArticle): void {
    this.newsForm.patchValue({
      title: article.title,
      summary: article.summary,
      content: article.content,
      category: article.category,
      isPinned: article.isPinned,
    });
  }
}
