import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AUTH_MOCK_USERS, DEMO_PASSWORD } from '../mocks/auth.mock';
import { User } from '../models/user.model';
import { MockAuthRepository } from './auth.repository-mocked';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly authRepository = inject(MockAuthRepository);

  readonly currentUser = this.authRepository.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly demoUsers = AUTH_MOCK_USERS;

  login(email: string, password: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const authenticatedUser = this.authRepository.login(email, password);
    if (!authenticatedUser) {
      this.isLoading.set(false);
      this.errorMessage.set(
        `Invalid credentials. Use sone of the demo accounts below or the shared password: ${DEMO_PASSWORD}`,
      );
      return;
    }
    setTimeout(() => {
      this.isLoading.set(false);
      this.router.navigate(['/home']);
    }, 2000);
  }

  logout(): void {
    this.authRepository.logout();
    this.errorMessage.set(null);
    this.router.navigate(['/login']);
  }
}
