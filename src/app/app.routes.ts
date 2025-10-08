import { Routes } from '@angular/router';
import { authorizedOnly } from './guards/authorized-only.guard';
import { employeeOnly } from './guards/employee-only.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('@/features/auth/auth.routes').then((mod) => mod.routes),
  },
  {
    path: 'dashboard',
    canActivate: [authorizedOnly],
    loadChildren: () =>
      import('@/features/dashboard/dashboard.routes').then((mod) => mod.routes),
  },
  {
    path: 'expenses',
    canMatch: [employeeOnly],
    canActivate: [authorizedOnly],
    loadComponent: () =>
      import('@/features/expenses/expenses.component').then(
        (mod) => mod.ExpensesComponent,
      ),
  },
  {
    path: 'advance',
    canMatch: [employeeOnly],
    canActivate: [authorizedOnly],
    loadComponent: () =>
      import('@/features/advance/advance.component').then(
        (mod) => mod.AdvanceComponent
      ),
  },
];
