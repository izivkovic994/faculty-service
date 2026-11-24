import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';

import { CreateNewsInput, NewsRepository, UpdateNewsInput } from './news.repository';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private readonly newsRepository = inject(NewsRepository);

  private readonly newsResource = rxResource({
    stream: () => this.newsRepository.getNews(),
  });

  readonly news = this.newsResource.value;
  readonly isLoading = this.newsResource.isLoading;
  readonly error = this.newsResource.error;

  getArticleById(id: number) {
    return this.news()?.find((article) => article.id === id) ?? null;
  }

  getNewsArticle(id: number) {
    return this.newsRepository.getNewsArticle(id);
  }

  createNews(input: CreateNewsInput) {
    return this.newsRepository.addNews(input).pipe(
      tap(() => this.newsResource.reload()),
    );
  }

  updateNews(id: number, input: UpdateNewsInput) {
    return this.newsRepository.updateNews(id, input).pipe(
      tap(() => this.newsResource.reload()),
    );
  }

  deleteNews(id: number) {
    return this.newsRepository.deleteNews(id).pipe(
      tap(() => this.newsResource.reload()),
    );
  }
}
