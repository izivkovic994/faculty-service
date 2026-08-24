import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./core/auth/pages/login-page/login-page').then((c) => c.LoginPageComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/pages/home-page/home-page').then((m) => m.HomePageComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./core/auth/pages/profile-page/profile-page').then((m) => m.ProfilePageComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
