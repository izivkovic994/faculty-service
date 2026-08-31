import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { FACULTY_MOCK_DATA } from '../../../core/mocks/faculty.mock';
import { NewsArticle, NewsCategory } from '../../../models/faculty.model';

export interface CreateNewsInput {
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  isPinned: boolean;
  authorUserId: number;
}

export type UpdateNewsInput = CreateNewsInput;

@Injectable({
  providedIn: 'root',
})
export class MockNewsRepository {
  getNews(): Observable<NewsArticle[]> {
    return of([...FACULTY_MOCK_DATA.news]);
  }

  addNews(input: CreateNewsInput): Observable<NewsArticle> {
    const article: NewsArticle = {
      id: Math.max(0, ...FACULTY_MOCK_DATA.news.map((item: { id: number }) => item.id)) + 1,
      ...input,
      publishedAt: new Date().toISOString(),
    };

    FACULTY_MOCK_DATA.news.push(article);
    return of(article);
  }

  updateNews(id: number, input: UpdateNewsInput): Observable<NewsArticle | null> {
    const articleIndex = FACULTY_MOCK_DATA.news.findIndex((item: { id: number }) => item.id === id);
    if (articleIndex === -1) {
      return of(null);
    }

    const updatedArticle: NewsArticle = {
      ...FACULTY_MOCK_DATA.news[articleIndex],
      ...input,
    };

    FACULTY_MOCK_DATA.news[articleIndex] = updatedArticle;
    return of(updatedArticle);
  }

  deleteNews(id: number): Observable<boolean> {
    const articleIndex = FACULTY_MOCK_DATA.news.findIndex((item: { id: number }) => item.id === id);
    if (articleIndex === -1) {
      return of(false);
    }

    FACULTY_MOCK_DATA.news.splice(articleIndex, 1);
    return of(true);
  }
}
