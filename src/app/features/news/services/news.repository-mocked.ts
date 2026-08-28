import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { FACULTY_MOCK_DATA } from '../../../mocks/faculty.mock';
import { NewsArticle, NewsCategory } from '../../../models/faculty.model';

export interface CreateNewsInput {
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  isPinned: boolean;
  authorUserId: number;
}

@Injectable({
  providedIn: 'root',
})
export class MockNewsRepository {
  getNews(): Observable<NewsArticle[]> {
    return of([...FACULTY_MOCK_DATA.news]);
  }

  addNews(input: CreateNewsInput): Observable<NewsArticle> {
    const article: NewsArticle = {
      id: Math.max(0, ...FACULTY_MOCK_DATA.news.map((item) => item.id)) + 1,
      ...input,
      publishedAt: new Date().toISOString(),
    };

    FACULTY_MOCK_DATA.news.push(article);
    return of(article);
  }
}
