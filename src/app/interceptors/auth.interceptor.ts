import { AuthService } from '@/features/auth/services/auth.serivce';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  if (req.url.startsWith('/api/')) {
    const token = authService.getToken();
    if (token) {
      console.log("TOKEN Found")
      req = req.clone({
        headers: req.headers.append("Authorization", "Bearer " + token)
      })
    }
  }
  return next(req);
};
