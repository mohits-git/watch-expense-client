import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Project, APIBaseResponse, ProjectsSummary } from '@/shared/types';
import { API_ENDPOINTS, API_MESSAGES } from '@/shared/constants';
import { buildAPIEndpoint } from '@/shared/utils/api.util';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private httpClient = inject(HttpClient);

  getProjects(): Observable<Project[]> {
    return this.httpClient
      .get<APIBaseResponse<Project[]>>(API_ENDPOINTS.ADMIN.PROJECT.GET_ALL)
      .pipe(
        map((response) => response.data),
        catchError((error: HttpErrorResponse) => {
          const errorMessage =
            error.error?.message || API_MESSAGES.ADMIN.PROJECT.FETCH_ERROR;
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  getProjectsSummary(): Observable<ProjectsSummary> {
    return this.getProjects().pipe(
      map((projects) => {
        const totalBudget = projects.reduce(
          (sum, project) => sum + project.budget,
          0,
        );
        const currentTime = Date.now();
        const activeProjects = projects.filter(
          (project) =>
            project.startDate <= currentTime && project.endDate >= currentTime,
        ).length;

        return {
          totalProjects: projects.length,
          totalBudget,
          averageBudget:
            projects.length > 0 ? totalBudget / projects.length : 0,
          activeProjects,
        };
      }),
    );
  }

  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Observable<string> {
    return this.httpClient
      .post<APIBaseResponse<string>>(API_ENDPOINTS.ADMIN.PROJECT.CREATE, project)
      .pipe(
        map((response) => response.data),
        catchError((error: HttpErrorResponse) => {
          const errorMessage = error.error?.message || API_MESSAGES.ADMIN.PROJECT.CREATE_ERROR;
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  updateProject(id: string, project: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Observable<void> {
    const endpoint = buildAPIEndpoint(API_ENDPOINTS.ADMIN.PROJECT.UPDATE, { id });
    return this.httpClient
      .put<APIBaseResponse<void>>(endpoint, project)
      .pipe(
        map(() => undefined),
        catchError((error: HttpErrorResponse) => {
          const errorMessage = error.error?.message || API_MESSAGES.ADMIN.PROJECT.UPDATE_ERROR;
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  deleteProject(id: string): Observable<void> {
    const endpoint = buildAPIEndpoint(API_ENDPOINTS.ADMIN.PROJECT.DELETE, { id });
    return this.httpClient
      .delete<APIBaseResponse<void>>(endpoint)
      .pipe(
        map(() => undefined),
        catchError((error: HttpErrorResponse) => {
          const errorMessage = error.error?.message || API_MESSAGES.ADMIN.PROJECT.DELETE_ERROR;
          return throwError(() => new Error(errorMessage));
        }),
      );
  }
}
