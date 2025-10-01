import { adminOnly } from '@/guards/admin-only.guard';
import { Routes } from '@angular/router';
import { authorizedOnly } from '@/guards/authorized-only.guard';

export const routes: Routes = [
  {
    path: '',
    canMatch: [adminOnly],
    canActivate: [authorizedOnly],
    loadComponent: () =>
      import('./admin-dashboard/admin-dashboard.component').then(
        (mod) => mod.AdminDashboardComponent,
      ),
  },
  {
    path: '',
    canActivate: [authorizedOnly], // TODO: employee
    loadComponent: () =>
      import('./employee-dashboard/employee-dashboard.component').then(
        (mod) => mod.EmployeeDashboardComponent,
      ),
  },
];
