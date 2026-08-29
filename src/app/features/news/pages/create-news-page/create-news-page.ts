import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { NewsService } from '../../services/news.service';
import { NewsCategory } from '../../../../models/faculty.model';
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
  private readonly pageFooterService = inject(PageFooterService);

  protected readonly categories: NewsCategory[] = ['GENERAL', 'ACADEMIC', 'EVENT', 'IMPORTANT'];
  protected readonly newsForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    summary: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    content: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    category: new FormControl<NewsCategory>('GENERAL', { nonNullable: true }),
    isPinned: new FormControl(false, { nonNullable: true }),
  });

  ngOnInit(): void {
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
        label: 'Save',
        variant: 'flat',
        type: 'button',
        color: 'primary',
        icon: 'save',
        disabled: this.newsForm.invalid,
        onClick: () => this.createNews(),
      },
    ];
  }

  createNews(): void {
    if (this.newsForm.invalid) {
      this.newsForm.markAllAsTouched();
      return;
    }

    const user = this.authService.currentUser();
    if (!user) {
      return;
    }

    this.newsService
      .createNews({
        ...this.newsForm.getRawValue(),
        authorUserId: user.id,
      })
      .subscribe(() => this.router.navigate(['/news']));
  }

  cancel(): void {
    this.router.navigate(['/news']);
  }
}
