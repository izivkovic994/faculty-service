import { Injectable, signal, Signal, WritableSignal } from '@angular/core';

import { AUTH_MOCK_USERS, DEMO_PASSWORD } from '../mocks/auth.mock';
import { User } from '../models/user.model';

export interface AuthRepository {
  readonly currentUser: Signal<User | null>;
  login(email: string, password: string): User | null;
  logout(): void;
}

@Injectable({
  providedIn: 'root',
})
export class MockAuthRepository implements AuthRepository {
  private readonly storageKey = 'faculty-service-current-user';

  readonly currentUser: WritableSignal<User | null> = signal<User | null>(this.getStoredUser());

  login(email: string, password: string): User | null {
    const normalizedEmail = email.trim().toLowerCase();
    const match = AUTH_MOCK_USERS.find((user) => user.email.toLowerCase() === normalizedEmail);

    if (!match || password !== DEMO_PASSWORD) {
      return null;
    }

    this.currentUser.set(match);
    localStorage.setItem(this.storageKey, JSON.stringify(match));

    return match;
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(this.storageKey);
  }

  private getStoredUser(): User | null {
    const storedUser = localStorage.getItem(this.storageKey);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
