import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadChildren: () =>
          import('./features/pages/home-page/home-page.routes').then((m) => m.homeRoutes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
