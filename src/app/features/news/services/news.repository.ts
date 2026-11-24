import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { NewsArticle } from '../../../models/faculty.model';

export interface CreateNewsInput {
  title: string;
  summary: string;
  content: string;
  category: NewsArticle['category'];
  isPinned: boolean;
  authorUserId: number;
}

export type UpdateNewsInput = CreateNewsInput;

@Injectable({
  providedIn: 'root',
})
export class NewsRepository {
  private readonly http = inject(HttpClient);
  private readonly newsUrl = '/api/news';

  getNews(): Observable<NewsArticle[]> {
    return this.http.get<NewsArticle[]>(this.newsUrl);
  }

  getNewsArticle(id: number): Observable<NewsArticle> {
    return this.http.get<NewsArticle>(`${this.newsUrl}/${id}`);
  }

  addNews(input: CreateNewsInput): Observable<NewsArticle> {
    return this.http.post<NewsArticle>(this.newsUrl, input);
  }

  updateNews(id: number, input: UpdateNewsInput): Observable<NewsArticle> {
    return this.http.put<NewsArticle>(`${this.newsUrl}/${id}`, input);
  }

  deleteNews(id: number): Observable<void> {
    return this.http.delete<void>(`${this.newsUrl}/${id}`);
  }
}
