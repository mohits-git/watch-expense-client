import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  Department,
  APIBaseResponse,
  DepartmentsSummary,
} from '@/shared/types';
import {
  API_ENDPOINTS,
  API_MESSAGES,
} from '@/shared/constants';
import { buildAPIEndpoint } from '@/shared/utils/api.util';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private httpClient = inject(HttpClient);

  getDepartments(): Observable<Department[]> {
    return this.httpClient
      .get<APIBaseResponse<Department[]>>(API_ENDPOINTS.ADMIN.DEPARTMENT.GET_ALL)
      .pipe(
        map((response) => response.data),
        catchError((error: HttpErrorResponse) => {
          const errorMessage = error.error?.message || API_MESSAGES.ADMIN.DEPARTMENT.FETCH_ERROR;
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  getDepartmentsSummary(): Observable<DepartmentsSummary> {
    return this.getDepartments().pipe(
      map((departments) => {
        const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);
        return {
          totalDepartments: departments.length,
          totalBudget,
          averageBudget: departments.length > 0 ? totalBudget / departments.length : 0,
        };
      })
    );
  }

  createDepartment(department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Observable<string> {
    return this.httpClient
      .post<APIBaseResponse<{ id: string }>>(API_ENDPOINTS.ADMIN.DEPARTMENT.CREATE, department)
      .pipe(
        map((response) => response.data.id),
        catchError((error: HttpErrorResponse) => {
          const errorMessage = error.error?.message || API_MESSAGES.ADMIN.DEPARTMENT.CREATE_ERROR;
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  updateDepartment(id: string, department: Partial<Omit<Department, 'id' | 'createdAt' | 'updatedAt'>>): Observable<void> {
    const endpoint = buildAPIEndpoint(API_ENDPOINTS.ADMIN.DEPARTMENT.UPDATE, { id });
    return this.httpClient
      .put<APIBaseResponse<void>>(endpoint, department)
      .pipe(
        map(() => undefined),
        catchError((error: HttpErrorResponse) => {
          const errorMessage = error.error?.message || API_MESSAGES.ADMIN.DEPARTMENT.UPDATE_ERROR;
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  deleteDepartment(id: string): Observable<void> {
    const endpoint = buildAPIEndpoint(API_ENDPOINTS.ADMIN.DEPARTMENT.DELETE, { id });
    return this.httpClient
      .delete<APIBaseResponse<void>>(endpoint)
      .pipe(
        map(() => undefined),
        catchError((error: HttpErrorResponse) => {
          const errorMessage = error.error?.message || API_MESSAGES.ADMIN.DEPARTMENT.DELETE_ERROR;
          return throwError(() => new Error(errorMessage));
        }),
      );
  }
}
