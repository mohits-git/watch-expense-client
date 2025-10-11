import { UserRole, ServiceErrorType } from '@/shared/enums';
import { User, JWTClaims, APIBaseResponse, LoginResult, ServiceError } from '@/shared/types';
import {
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import {
  API_ENDPOINTS,
  AUTH_MESSAGES,
  COMMON_MESSAGES,
  HTTP_STATUS_CODES,
} from '@/shared/constants';
import { TokenService } from './token.service';
import { LoginAPIResponse } from '../types/auth.type';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
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

  login(email: string, password: string): Observable<LoginResult> {
    return this.httpClient
      .post<LoginAPIResponse>(API_ENDPOINTS.AUTH.LOGIN, {
        email: email,
        password: password,
      })
      .pipe(
        map((response) => {
          if (!response.token) {
            return {
              success: false,
              error: {
                message: AUTH_MESSAGES.LOGIN_FAILED,
                type: ServiceErrorType.Validation
              }
            };
          }
          this.tokenService.saveToken(response.token);
          return { success: true };
        }),

        catchError((errorResponse: HttpErrorResponse) => {
          let errorMsg = AUTH_MESSAGES.LOGIN_FAILED;
          let errorType: ServiceErrorType = ServiceErrorType.Unknown;

          if (errorResponse.status === HTTP_STATUS_CODES.UNAUTHORIZED) {
            errorMsg = AUTH_MESSAGES.INVALID_CREDENTIALS;
            errorType = ServiceErrorType.Unauthorized;
          } else if (errorResponse.error?.message) {
            errorMsg = errorResponse.error.message;
            errorType = ServiceErrorType.Validation;
          } else if (errorResponse.status === HTTP_STATUS_CODES.NETWORK_ERROR) {
            errorType = ServiceErrorType.Network;
          }

          const result: LoginResult = {
            success: false,
            error: {
              message: errorMsg,
              type: errorType,
              statusCode: errorResponse.status
            }
          };

          return throwError(() => result);
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
          let errorType: ServiceErrorType = ServiceErrorType.Unknown;

          if (errorResponse.status === HTTP_STATUS_CODES.UNAUTHORIZED) {
            this.logout();
            errorMsg = AUTH_MESSAGES.SESSION_EXPIRED;
            errorType = ServiceErrorType.Unauthorized;
          } else if (errorResponse.error?.message) {
            errorMsg = errorResponse.error.message;
            errorType = ServiceErrorType.Validation;
          } else if (errorResponse.status === HTTP_STATUS_CODES.NETWORK_ERROR) {
            errorType = ServiceErrorType.Network;
          }

          const error: ServiceError = {
            message: errorMsg,
            type: errorType,
            statusCode: errorResponse.status
          };

          return throwError(() => error);
        }),
      );
  }
}
