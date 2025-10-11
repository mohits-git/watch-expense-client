import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  User,
  APIBaseResponse,
  UsersSummary,
} from '@/shared/types';
import { UserRole } from '@/shared/enums';
import {
  API_ENDPOINTS,
  API_MESSAGES,
} from '@/shared/constants';

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
          const errorMessage = error.error?.message || API_MESSAGES.ADMIN.USER.FETCH_ERROR;
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  getUsersSummary(): Observable<UsersSummary> {
    return this.getUsers().pipe(
      map((users) => ({
        totalUsers: users.length,
        activeUsers: users.filter(user => user.balance !== undefined).length,
        adminUsers: users.filter(user => user.role === UserRole.Admin).length,
        employeeUsers: users.filter(user => user.role === UserRole.Employee).length,
      }))
    );
  }
}