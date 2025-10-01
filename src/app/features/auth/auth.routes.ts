import { authorizedOnly } from '@/guards/authorized-only.guard';
import { unauthorizedOnly } from '@/guards/unauthorized-only.guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [unauthorizedOnly],
    loadComponent: () =>
      import('./pages/login/login.component').then((mod) => mod.LoginComponent),
  },
  {
    path: 'account',
    canActivate: [authorizedOnly],
    loadComponent: () =>
      import('./pages/account/account.component').then(
        (mod) => mod.AccountComponent,
      ),
  },
];
