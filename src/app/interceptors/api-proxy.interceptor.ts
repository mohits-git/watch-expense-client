import { API_PREFIX, BASE_URL } from '@/shared/constants';
import { HttpInterceptorFn } from '@angular/common/http';

export const apiProxyInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(API_PREFIX)) {
    req = req.clone({
      url: req.url.replace(API_PREFIX, BASE_URL.API),
    });
  }
  return next(req);
};
