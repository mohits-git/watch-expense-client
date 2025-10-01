import { config } from '@/shared/constants/config';
import { HttpInterceptorFn } from '@angular/common/http';

export const apiProxyInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBase = config.API_BASE_URL;
  if (req.url.startsWith('/api/')) {
    req = req.clone({
      url: req.url.replace('/api', apiBase),
    });
  }
  return next(req);
};
