import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { HomePageComponent } from './features/home/pages/home-page/home-page';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';
import { adminGuard } from './core/auth/guards/admin.guard';

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
        component: HomePageComponent,
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./core/auth/pages/profile-page/profile-page').then((m) => m.ProfilePageComponent),
      },
      {
        path: 'news',
        loadComponent: () =>
          import('./features/news/pages/news-page/news-page').then((m) => m.NewsPageComponent),
      },
      {
        path: 'news/create',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/news/pages/create-news-page/create-news-page').then(
            (m) => m.CreateNewsPageComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
