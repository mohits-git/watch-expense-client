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
}