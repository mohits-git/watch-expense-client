import { Routes } from '@angular/router';
import { unauthorizedOnly } from './guards/unauthorized-only.guard';

export const routes: Routes = [
  {
    path: '',
    // canActivate: [unauthorizedOnly],
    // redirectTo: '/dashboard',
    // pathMatch: 'full',
    loadComponent: () =>
      import('@/features/home/home.component').then((mod) => mod.HomeComponent),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('@/features/auth/auth.routes').then((mod) => mod.routes),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('@/features/dashboard/dashboard.routes').then((mod) => mod.routes),
  },
];
