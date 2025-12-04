import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { User, APIBaseResponse, UsersSummary } from '@/shared/types';
import { UserRole } from '@/shared/enums';
import { API_ENDPOINTS, API_MESSAGES } from '@/shared/constants';
import { buildAPIEndpoint } from '@/shared/utils/api.util';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private httpClient = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.httpClient
      .get<APIBaseResponse<User[]>>(API_ENDPOINTS.USERS.GET_ALL)
      .pipe(
        map((response) => response.data),
        catchError((error: HttpErrorResponse) => {
          const errorMessage =
            error.error?.message || API_MESSAGES.ADMIN.USER.FETCH_ERROR;
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  getUsersSummary(): Observable<UsersSummary> {
    return this.httpClient
      .get<APIBaseResponse<User[]>>(API_ENDPOINTS.USERS.GET_ALL)
      .pipe(
        map((response) => {
          const users = response.data;
          const totalUsers = users.length;
          const adminUsers = users.filter(
            (user) => user.role === UserRole.Admin,
          ).length;
          const employeeUsers = users.filter(
            (user) => user.role === UserRole.Employee,
          ).length;

          return {
            totalUsers,
            activeUsers: users.length,
            adminUsers,
            employeeUsers,
          };
        }),
        catchError(() => {
          return throwError(
            () => new Error(API_MESSAGES.ADMIN.USER.FETCH_ERROR),
          );
        }),
      );
  }

  getUserById(id: string): Observable<User> {
    const endpoint = buildAPIEndpoint(API_ENDPOINTS.USERS.GET_BY_ID, { id });
    return this.httpClient
      .get<APIBaseResponse<User>>(endpoint)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError),
      );
  }

  createUser(userData: Partial<User>): Observable<string> {
    return this.httpClient
      .post<APIBaseResponse<{ id: string }>>(API_ENDPOINTS.USERS.CREATE, userData)
      .pipe(
        map((response) => response.data.id),
        catchError(this.handleError),
      );
  }

  updateUser(id: string, userData: Partial<User>): Observable<void> {
    const endpoint = buildAPIEndpoint(API_ENDPOINTS.USERS.UPDATE, { id });
    return this.httpClient
      .put<APIBaseResponse<void>>(endpoint, userData)
      .pipe(
        map(() => undefined),
        catchError(this.handleError),
      );
  }

  deleteUser(id: string): Observable<void> {
    const endpoint = buildAPIEndpoint(API_ENDPOINTS.USERS.DELETE, { id });
    return this.httpClient
      .delete<void>(endpoint)
      .pipe(
        catchError(this.handleError),
      );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    const errorMessage = error.error?.message || 'An unexpected error occurred';
    return throwError(() => new Error(errorMessage));
  };
}
