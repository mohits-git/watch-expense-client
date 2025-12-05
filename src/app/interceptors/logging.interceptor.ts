import { HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.production) {
    return next(req);
  }
  console.log('HTTP Request: making request: ' + req.url);
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          console.log(
            'HTTP Response: got response from: ' +
              event.url +
              ' with status code: ' +
              event.status,
          );
        }
      },
      error: (err) => {
        console.log(
          'HTTP Error: error making request to: ' +
            req.url +
            ' \nError: ' +
            (err?.message || err),
        );
      },
    }),
  );
};
