import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { AUTH_MOCK_USERS, DEMO_PASSWORD } from '../mocks/auth.mock';
import { AuthRepository } from './auth.repository';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly authRepository = inject(AuthRepository);

  readonly currentUser = this.authRepository.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly demoUsers = AUTH_MOCK_USERS;

  login(email: string, password: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.authRepository.login(email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/home']);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.status === 401
            ? `Invalid credentials. Use one of the demo accounts and the shared password: ${DEMO_PASSWORD}`
            : 'Could not connect to the authentication service. Please try again.',
        );
      },
    });
  }

  logout(): void {
    this.authRepository.logout();
    this.errorMessage.set(null);
    this.router.navigate(['/login']);
  }
}
