import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { UserRole } from '../models/user.model';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser()?.role === UserRole.ADMIN
    ? true
    : router.createUrlTree(['/news']);
};
