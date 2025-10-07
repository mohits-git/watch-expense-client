import { UserRole } from '@/shared/enums/user-role.enum';
import { User } from '@/shared/types/user.type';
import { JWTClaims } from '@/shared/types/jwt-claims.type';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { catchError, map, Observable, throwError } from 'rxjs';
import { APIBaseResponse } from '@/shared/types/api-base-response.type';

export const TOKEN_KEY = 'token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);

  private token = signal<string | null>(null);
  getToken() {
    return this.token()
  }

  readonly isAuthenticated = computed(() => {
    return !!this.token();
  });

  readonly user = computed((): User | null => {
    if (!this.token()) return null;
    let decoded: JWTClaims | undefined;
    try {
      decoded = jwtDecode<JWTClaims>(this.token()!);
    } catch (error) {
      console.error(error);
      this.logout();
    }
    if (!decoded) return null;
    return {
      id: decoded.sub,
      name: decoded.name,
      role: decoded.role as UserRole,
      email: decoded.email,
    };
  });

  // login persistance
  constructor() {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) return;
    this.token.set(savedToken);
  }

  login(email: string, password: string): Observable<string> {
    return this.httpClient
      .post<{
        token: string;
      }>('/api/auth/login', {
        email: email,
        password: password,
      })
      .pipe(
        map((response) => {
          if (response.token) this.saveToken(response.token);
          return response.token;
        }),
        catchError((errorResponse: HttpErrorResponse) => {
          this.removeToken();
          return throwError(() => new Error(errorResponse.error.message));
        }),
      );
  }

  logout() {
    this.token.set(null);
    this.removeToken();
  }

  authMe(): Observable<User> {
    return this.httpClient.get<APIBaseResponse<User>>('/api/auth/me').pipe(
      map((response) => {
        return response.data;
      }),
      catchError((errorResponse: HttpErrorResponse) => {
        this.logout();
        return throwError(() => new Error(errorResponse.error.message));
      }),
    );
  }

  private saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    this.token.set(token);
  }

  private removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
  }
}
