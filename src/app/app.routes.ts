import { Routes } from '@angular/router';
import { authorizedOnly } from './guards/authorized-only.guard';
import { employeeOnly } from './guards/employee-only.guard';
import { APP_ROUTES } from './shared/constants';

export const routes: Routes = [
  {
    path: '',
    redirectTo: `/${APP_ROUTES.AUTH.LOGIN}`,
    pathMatch: 'full',
  },
  {
    path: APP_ROUTES.AUTH.BASE,
    loadChildren: () =>
      import('@/features/auth/auth.routes').then((mod) => mod.routes),
  },
  {
    path: APP_ROUTES.DASHBOARD,
    canActivate: [authorizedOnly],
    loadChildren: () =>
      import('@/features/dashboard/dashboard.routes').then((mod) => mod.routes),
  },
  {
    path: APP_ROUTES.EXPENSES,
    // canMatch: [employeeOnly],
    canActivate: [authorizedOnly],
    loadComponent: () =>
      import('@/features/expenses/expenses.component').then(
        (mod) => mod.ExpensesComponent,
      ),
  },
  {
    path: APP_ROUTES.ADVANCES,
    // canMatch: [employeeOnly],
    canActivate: [authorizedOnly],
    loadComponent: () =>
      import('@/features/advances/advances.component').then(
        (mod) => mod.AdvancesComponent
      ),
  },
];
