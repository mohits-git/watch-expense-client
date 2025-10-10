import { authorizedOnly } from '@/guards/authorized-only.guard';
import { unauthorizedOnly } from '@/guards/unauthorized-only.guard';
import { APP_ROUTES } from '@/shared/constants';
import { getRouteSegments } from '@/shared/utils/routes.util';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: getRouteSegments(APP_ROUTES.AUTH.LOGIN).pop()!,
    canActivate: [unauthorizedOnly],
    loadComponent: () =>
      import('./login/login.component').then((mod) => mod.LoginComponent),
  },
  {
    path: getRouteSegments(APP_ROUTES.AUTH.ACCOUNT).pop()!,
    canActivate: [authorizedOnly],
    loadComponent: () =>
      import('./account/account.component').then(
        (mod) => mod.AccountComponent,
      ),
  },
]
