import { API_PREFIX, BASE_URL, IMAGE_API_PREFIX } from '@/shared/constants';
import { HttpInterceptorFn } from '@angular/common/http';

export const apiProxyInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(IMAGE_API_PREFIX)) {
    req = req.clone({
      url: req.url.replace(IMAGE_API_PREFIX, BASE_URL.IMAGE_UPLOAD),
    });
  } else if (req.url.startsWith(API_PREFIX)) {
    req = req.clone({
      url: req.url.replace(API_PREFIX, BASE_URL.API),
    });
  }
  return next(req);
};
