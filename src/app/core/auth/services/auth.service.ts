import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

import { User, UserRole } from '../../auth/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);

  private readonly currentUserSignal = signal<User | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();

  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  login(email: string, password: string): void {
    const mockedUser: User = {
      id: 1,
      firstName: 'Ivan',
      lastName: 'Živković',
      email,
      role: UserRole.ADMIN,
    };

    this.currentUserSignal.set(mockedUser);

    this.router.navigate(['/home']);
  }

  logout(): void {
    this.currentUserSignal.set(null);

    this.router.navigate(['/login']);
  }
}
