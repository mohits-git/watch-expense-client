import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import {
  TOAST_TYPES,
  TOAST_SUMMARIES,
  COMMON_MESSAGES,
  AUTH_MESSAGES,
  HTTP_STATUS_CODES,
} from '@/shared/constants';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!error.status) {
        messageService.add({
          severity: TOAST_TYPES.ERROR,
          summary: TOAST_SUMMARIES.ERROR,
          detail: COMMON_MESSAGES.NETWORK_ERROR,
        });
        return throwError(() => error);
      }

      if (error.status === HTTP_STATUS_CODES.UNAUTHORIZED) {
        messageService.add({
          severity: TOAST_TYPES.ERROR,
          summary: TOAST_SUMMARIES.ERROR,
          detail: AUTH_MESSAGES.UNAUTHORIZED_ACTION,
        });
        router.navigate(['/auth/login']);
        return throwError(() => error);
      }

      return throwError(() => error);
    }),
  );
};
