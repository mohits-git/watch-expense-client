import { AuthService } from '@/shared/services/auth.serivce';
import { API_PREFIX, HEADERS } from '@/shared/constants';
import { AUTH_STRATEGY } from '@/shared/constants';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  if (req.url.startsWith(API_PREFIX)) {
    const token = authService.getToken();
    if (token) {
      req = req.clone({
        headers: req.headers.append(HEADERS.AUTHORIZATION, `${AUTH_STRATEGY} ${token}`),
      })
    }
  }
  return next(req);
};
