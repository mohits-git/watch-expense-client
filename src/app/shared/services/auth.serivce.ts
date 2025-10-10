import { UserRole } from '@/shared/enums/user-role.enum';
import { User } from '@/shared/types/user.type';
import { JWTClaims } from '@/shared/types/jwt-claims.type';
import {
  HttpClient,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { APIBaseResponse } from '@/shared/types';
import { MessageService } from 'primeng/api';
import {
  API_ENDPOINTS,
  AUTH_MESSAGES,
  COMMON_MESSAGES,
  TOAST_SUMMARIES,
  TOAST_TYPES,
} from '@/shared/constants';
import { TokenService } from './token.service';
import { LoginAPIResponse } from '../types/auth.type';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private messageService = inject(MessageService);
  private tokenService = inject(TokenService);

  private token = this.tokenService.token;

  readonly user: Signal<User | null> = computed((): User | null => {
    if (!this.token()) return null;
    const decoded: JWTClaims | null = this.tokenService.parseToken(
      this.token()!,
    );
    if (!decoded) return null;
    return {
      id: decoded.sub,
      name: decoded.name,
      role: decoded.role,
      email: decoded.email,
    };
  });

  readonly isAuthenticated = computed(() => {
    return !!this.user();
  });

  getToken() {
    return this.token();
  }

  hasRole(role: UserRole) {
    return this.user()?.role === role;
  }

  login(email: string, password: string): Observable<boolean> {
    return this.httpClient
      .post<LoginAPIResponse>(API_ENDPOINTS.AUTH.LOGIN, {
        email: email,
        password: password,
      })
      .pipe(
        map((response) => {
          if (!response.token) {
            return false;
          }
          this.tokenService.saveToken(response.token);
          this.messageService.add({
            severity: TOAST_TYPES.SUCCESS,
            summary: TOAST_SUMMARIES.SUCCESS,
            detail: AUTH_MESSAGES.LOGIN_SUCCESS,
          });
          return true;
        }),

        catchError((errorResponse: HttpErrorResponse) => {
          let errorMsg = AUTH_MESSAGES.LOGIN_FAILED;
          if (errorResponse.status === HttpStatusCode.Unauthorized) {
            errorMsg = AUTH_MESSAGES.INVALID_CREDENTIALS;
          } else if (errorResponse.error?.message) {
            errorMsg = errorResponse.error.message;
          }
          this.messageService.add({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: errorMsg,
          });
          return throwError(() => new Error(errorMsg));
        }),
      );
  }

  logout() {
    this.tokenService.removeToken();
  }

  authMe(): Observable<User> {
    return this.httpClient
      .get<APIBaseResponse<User>>(API_ENDPOINTS.AUTH.ME)
      .pipe(
        map((response) => {
          return response.data;
        }),
        catchError((errorResponse: HttpErrorResponse) => {
          let errorMsg = COMMON_MESSAGES.UNKNOWN_ERROR;
          if (errorResponse.status === HttpStatusCode.Unauthorized) {
            this.logout();
            errorMsg = AUTH_MESSAGES.SESSION_EXPIRED;
          } else if (errorResponse.error?.message) {
            errorMsg = errorResponse.error.message;
          }
          this.messageService.add({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: errorMsg,
          });
          return throwError(() => new Error(errorMsg));
        }),
      );
  }
}
