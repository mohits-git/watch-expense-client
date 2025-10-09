import { authorizedOnly } from '@/guards/authorized-only.guard';
import { unauthorizedOnly } from '@/guards/unauthorized-only.guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [unauthorizedOnly],
    loadComponent: () =>
      import('./login/login.component').then((mod) => mod.LoginComponent),
  },
  {
    path: 'account',
    canActivate: [authorizedOnly],
    loadComponent: () =>
      import('./account/account.component').then(
        (mod) => mod.AccountComponent,
      ),
  },
]