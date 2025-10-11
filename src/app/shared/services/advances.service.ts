import { inject, Injectable } from '@angular/core';
import {
  CreateAdvanceAPIResponse,
  Advance,
  GetAdvanceAPIResponse,
  RequestStatus,
  APIBaseResponse,
  AdvanceCreateResult,
  AdvanceFetchResult,
} from '@/shared/types';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from '@/shared/services/auth.serivce';
import { API_ENDPOINTS, API_MESSAGES, HTTP_STATUS_CODES } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class AdvancesService {
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);

  fetchAdvances(
    status?: RequestStatus,
    page?: number,
    limit?: number,
  ): Observable<GetAdvanceAPIResponse> {
    return this.httpClient
      .get<APIBaseResponse<GetAdvanceAPIResponse>>(
        API_ENDPOINTS.ADVANCE.GET_ALL,
        {
          params: {
            page: page ?? 1,
            limit: limit ?? 10,
            status: status ?? '',
          },
        },
      )
      .pipe(
        map((response) => response.data),
        catchError((error: HttpErrorResponse) => {
          const errorMessage =
            error.error?.message || API_MESSAGES.ADVANCE.FETCH_ERROR;
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  addNewAdvance(advance: Partial<Advance>): Observable<AdvanceCreateResult> {
    if (!advance.amount || !advance.purpose) {
      return throwError(
        () =>
          ({
            success: false,
            message: API_MESSAGES.ADVANCE.ADD_ADVANCE_BAD_REQUEST,
          }) as AdvanceCreateResult,
      );
    }

    const newAdvance = this.NewAdvance(advance);
    return this.httpClient
      .post<
        APIBaseResponse<CreateAdvanceAPIResponse>
      >(API_ENDPOINTS.ADVANCE.CREATE, advance)
      .pipe(
        map((response) => {
          newAdvance.id = response.data.id;
          return {
            success: true,
            data: newAdvance,
          } as AdvanceCreateResult;
        }),
        catchError((err: HttpErrorResponse) => {
          let errorMessage = API_MESSAGES.ADVANCE.ADD_ADVANCE_ERROR;
          if (err.status === HTTP_STATUS_CODES.BAD_REQUEST) {
            errorMessage =
              err.error?.message ||
              API_MESSAGES.ADVANCE.ADD_ADVANCE_BAD_REQUEST;
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          }
          const result: AdvanceCreateResult = {
            success: false,
            message: errorMessage,
          };
          return throwError(() => result);
        }),
      );
  }

  NewAdvance(advance: Partial<Advance>) {
    return {
      id: advance.id ?? Date.now().toString(),
      purpose: advance.purpose ?? '',
      amount: advance.amount ?? 0,
      description: advance.description ?? '',
      userId: this.authService.user()?.id || '',
      status: RequestStatus.Pending,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      approvedAt: null,
      approvedBy: null,
      reviewedAt: null,
      reviewedBy: null,
    };
  }
}
