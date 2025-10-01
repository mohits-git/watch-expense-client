import { AuthService } from '@/features/auth/services/auth.serivce';
import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

export const unauthorizedOnly: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isAuthenticated()) {
    return true;
  }
  const dashboard = router.parseUrl('/dashboard')
  return new RedirectCommand(dashboard, {
    skipLocationChange: true,
  });
};
