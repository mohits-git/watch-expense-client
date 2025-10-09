import { AuthService } from '@/shared/services/auth.serivce';
import { UserRole } from '@/shared/enums/user-role.enum';
import { inject } from '@angular/core';
import { CanMatchFn, Route, UrlSegment } from '@angular/router';

export const employeeOnly: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  if (authService.user()?.role === UserRole.Employee) {
    return true;
  }
  return false;
};
