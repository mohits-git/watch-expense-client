import { adminOnly } from '@/guards/admin-only.guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    canMatch: [adminOnly],
    loadComponent: () =>
      import('./admin-dashboard/admin-dashboard.component').then(
        (mod) => mod.AdminDashboardComponent,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./employee-dashboard/employee-dashboard.component').then(
        (mod) => mod.EmployeeDashboardComponent,
      ),
  },
];
