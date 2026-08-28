import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { UserRole } from '../../../../core/auth/models/user.model';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { NewsService } from '../../services/news.service';

@Component({
  selector: 'app-news-page',
  imports: [DatePipe, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './news-page.html',
  styleUrl: './news-page.scss',
})
export class NewsPageComponent {
  private readonly authService = inject(AuthService);
  private readonly newsService = inject(NewsService);

  protected readonly news = this.newsService.news;
  protected readonly canCreateNews = () => this.authService.currentUser()?.role === UserRole.ADMIN;
}
