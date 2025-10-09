import { API_PREFIX } from '@/shared/constants';
import { config } from '@/shared/constants/config';
import { HttpInterceptorFn } from '@angular/common/http';

export const apiProxyInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBase = config.API_BASE_URL;
  if (req.url.startsWith(API_PREFIX)) {
    req = req.clone({
      url: req.url.replace(API_PREFIX, apiBase),
    });
  }
  return next(req);
};
