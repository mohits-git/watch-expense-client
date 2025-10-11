import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Project, APIBaseResponse, ProjectsSummary } from '@/shared/types';
import { API_ENDPOINTS, API_MESSAGES } from '@/shared/constants';

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
}
