import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthRepository } from './auth.repository';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthRepository).accessToken();
  if (
    !token ||
    !request.url.startsWith('/api/') ||
    request.url === '/api/auth/login'
  ) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  }));
};
