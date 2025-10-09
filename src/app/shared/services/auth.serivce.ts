import { UserRole } from '@/shared/enums/user-role.enum';
import { User } from '@/shared/types/user.type';
import { JWTClaims } from '@/shared/types/jwt-claims.type';
import {
  HttpClient,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { catchError, map, Observable, throwError } from 'rxjs';
import { APIBaseResponse } from '@/shared/types';
import { MessageService } from 'primeng/api';
import {
  API_ENDPOINTS,
  AUTH_MESSAGES,
  COMMON_MESSAGES,
  TOAST_SUMMARIES,
  TOAST_TYPES,
  TOKEN_STORAGE_KEY,
} from '@/shared/constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private messageService = inject(MessageService);

  private token = signal<string | null>(null);
  constructor() {
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!savedToken) return;
    if (!this.isValidToken(savedToken)) {
      this.removeToken();
      return;
    }
    this.token.set(savedToken);
  }

  getToken() {
    return this.token();
  }

  readonly isAuthenticated = computed(() => {
    return !!this.token();
  });

  readonly user = computed((): User | null => {
    if (!this.token()) return null;
    try {
      const decoded: JWTClaims = jwtDecode<JWTClaims>(this.token()!);
      if (!decoded?.sub) {
        throw new Error(AUTH_MESSAGES.INVALID_TOKEN);
      }
      return {
        id: decoded.sub,
        name: decoded.name,
        role: decoded.role,
        email: decoded.email,
      };
    } catch (error) {
      this.logout();
    }
    return null;
  });

  hasRole(role: UserRole) {
    return this.user()?.role === role;
  }

  login(email: string, password: string): Observable<boolean> {
    return this.httpClient
      .post<{
        token: string;
      }>(API_ENDPOINTS.AUTH.LOGIN, {
        email: email,
        password: password,
      })
      .pipe(
        map((response) => {
          if (!response.token) {
            return false;
          }
          this.saveToken(response.token);
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
    this.token.set(null);
    this.removeToken();
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

  private saveToken(token: string) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    this.token.set(token);
  }

  private removeToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    this.token.set(null);
  }

  private isValidToken(token: string): boolean {
    try {
      const decoded = jwtDecode<JWTClaims>(token);
      return (
        !!decoded?.sub && (!decoded.exp || decoded.exp * 1000 > Date.now())
      );
    } catch {
      return false;
    }
  }
}
