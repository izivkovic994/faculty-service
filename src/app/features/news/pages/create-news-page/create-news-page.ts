import { Component, inject } from '@angular/core';
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
export class CreateNewsPageComponent {
  private readonly authService = inject(AuthService);
  private readonly newsService = inject(NewsService);
  private readonly router = inject(Router);

  protected readonly categories: NewsCategory[] = ['GENERAL', 'ACADEMIC', 'EVENT', 'IMPORTANT'];
  protected readonly newsForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    summary: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    content: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    category: new FormControl<NewsCategory>('GENERAL', { nonNullable: true }),
    isPinned: new FormControl(false, { nonNullable: true }),
  });

  createNews(): void {
    if (this.newsForm.invalid) {
      this.newsForm.markAllAsTouched();
      return;
    }

    const user = this.authService.currentUser();
    if (!user) {
      return;
    }

    this.newsService.createNews({
      ...this.newsForm.getRawValue(),
      authorUserId: user.id,
    }).subscribe(() => this.router.navigate(['/news']));
  }
}
