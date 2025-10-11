import { inject, Injectable } from '@angular/core';
import {
  CreateAdvanceAPIResponse,
  Advance,
  GetAdvanceAPIResponse,
  RequestStatus,
} from '@/shared/types';
import {
  HttpClient,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { APIBaseResponse } from '@/shared/types';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from '@/shared/services/auth.serivce';
import { MessageService } from 'primeng/api';
import {
  API_ENDPOINTS,
  API_MESSAGES,
  TOAST_SUMMARIES,
  TOAST_TYPES,
} from '../constants';

@Injectable({
  providedIn: 'root',
})
export class AdvancesService {
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  fetchAdvances(status?: RequestStatus, page?: number, limit?: number) {
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
        map((response) => {
          return response.data;
        }),
        catchError((err) => {
          console.log(err);
          this.messageService.add({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: API_MESSAGES.ADVANCE.FETCH_ERROR,
          });
          return throwError(() => new Error(API_MESSAGES.ADVANCE.FETCH_ERROR));
        }),
      );
  }

  addNewAdvance(advance: Partial<Advance>): Observable<Advance> {
    if (!advance.amount || !advance.purpose) {
      return throwError(
        () => new Error(API_MESSAGES.ADVANCE.ADD_ADVANCE_BAD_REQUEST),
      );
    }
    const newAdvance = this.NewAdvance(advance);
    return this.httpClient
      .post<
        APIBaseResponse<CreateAdvanceAPIResponse>
      >(API_ENDPOINTS.ADVANCE.CREATE, advance)
      .pipe(
        map((response) => {
          this.messageService.add({
            severity: TOAST_TYPES.SUCCESS,
            summary: TOAST_SUMMARIES.SUCCESS,
            detail: API_MESSAGES.ADVANCE.ADD_ADVANCE_SUCCESS,
          });
          newAdvance.id = response.data.id;
          return newAdvance;
        }),
        catchError((err: HttpErrorResponse) => {
          let errMsg = API_MESSAGES.ADVANCE.ADD_ADVANCE_ERROR;
          if (err.status === HttpStatusCode.BadRequest) {
            errMsg = API_MESSAGES.ADVANCE.ADD_ADVANCE_BAD_REQUEST;
          }
          this.messageService.add({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: errMsg,
          });
          return throwError(() => new Error(errMsg));
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
