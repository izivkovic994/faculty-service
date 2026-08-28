import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';

import { CreateNewsInput, MockNewsRepository } from './news.repository-mocked';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private readonly newsRepository = inject(MockNewsRepository);

  private readonly newsResource = rxResource({
    stream: () => this.newsRepository.getNews(),
  });

  readonly news = this.newsResource.value;

  createNews(input: CreateNewsInput) {
    return this.newsRepository.addNews(input).pipe(
      tap(() => this.newsResource.reload()),
    );
  }
}
