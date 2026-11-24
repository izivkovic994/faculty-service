import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { User } from '../models/user.model';

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthRepository {
  private readonly http = inject(HttpClient);
  private readonly userStorageKey = 'faculty-service-current-user';
  private readonly tokenStorageKey = 'faculty-service-access-token';
  private readonly tokenExpiryStorageKey = 'faculty-service-token-expiry';

  readonly currentUser = signal<User | null>(this.readStoredUser());
  readonly accessToken = signal<string | null>(this.readStoredToken());

  constructor() {
    if (!this.accessToken()) {
      this.clearStoredAuth();
      this.currentUser.set(null);
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      tap((response) => {
        localStorage.setItem(this.userStorageKey, JSON.stringify(response.user));
        localStorage.setItem(this.tokenStorageKey, response.accessToken);
        localStorage.setItem(
          this.tokenExpiryStorageKey,
          String(Date.now() + response.expiresIn * 1000),
        );
        this.currentUser.set(response.user);
        this.accessToken.set(response.accessToken);
      }),
      tap({
        error: () => this.logout(),
      }),
      map((response) => response.user),
    );
  }

  logout(): void {
    this.clearStoredAuth();
    this.currentUser.set(null);
    this.accessToken.set(null);
  }

  private readStoredUser(): User | null {
    const storedUser = localStorage.getItem(this.userStorageKey);
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      return null;
    }
  }

  private readStoredToken(): string | null {
    const token = localStorage.getItem(this.tokenStorageKey);
    const expiresAt = Number(localStorage.getItem(this.tokenExpiryStorageKey));
    if (!token || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return null;
    }
    return token;
  }

  private clearStoredAuth(): void {
    localStorage.removeItem(this.userStorageKey);
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.tokenExpiryStorageKey);
  }
}
