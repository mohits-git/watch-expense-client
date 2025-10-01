import { AuthService } from '@/features/auth/services/auth.serivce';
import { UserRole } from '@/shared/enums/user-role.enum';
import { inject } from '@angular/core';
import { CanMatchFn, Route, UrlSegment } from '@angular/router';

export const adminOnly: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  if (authService.user()?.role === UserRole.Admin) {
    return true;
  }
  return false;
};
