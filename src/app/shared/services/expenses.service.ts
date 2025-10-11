import { inject, Injectable } from '@angular/core';
import {
  CreateExpenseAPIResponse,
  Expense,
  GetExpenseAPIResponse,
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
export class ExpensesService {
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  fetchExpenses(status?: RequestStatus, page?: number, limit?: number) {
    return this.httpClient
      .get<APIBaseResponse<GetExpenseAPIResponse>>(
        API_ENDPOINTS.EXPENSE.GET_ALL,
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
        catchError(() => {
          this.messageService.add({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: API_MESSAGES.EXPENSE.FETCH_ERROR,
          });
          return throwError(() => new Error(API_MESSAGES.EXPENSE.FETCH_ERROR));
        }),
      );
  }

  addNewExpense(expense: Partial<Expense>): Observable<Expense> {
    if (!expense.amount || !expense.purpose) {
      return throwError(
        () => new Error(API_MESSAGES.EXPENSE.ADD_EXPENSE_BAD_REQUEST),
      );
    }
    const newExpense = this.NewExpense(expense);
    return this.httpClient
      .post<
        APIBaseResponse<CreateExpenseAPIResponse>
      >(API_ENDPOINTS.EXPENSE.CREATE, expense)
      .pipe(
        map((response) => {
          this.messageService.add({
            severity: TOAST_TYPES.SUCCESS,
            summary: TOAST_SUMMARIES.SUCCESS,
            detail: API_MESSAGES.EXPENSE.ADD_EXPENSE_SUCCESS,
          });
          newExpense.id = response.data.id;
          return newExpense;
        }),
        catchError((err: HttpErrorResponse) => {
          let errMsg = API_MESSAGES.EXPENSE.ADD_EXPENSE_ERROR;
          if (err.status === HttpStatusCode.BadRequest) {
            errMsg = API_MESSAGES.EXPENSE.ADD_EXPENSE_BAD_REQUEST;
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

  NewExpense(expense: Partial<Expense>) {
    return {
      id: expense.id ?? Date.now().toString(),
      purpose: expense.purpose ?? '',
      amount: expense.amount ?? 0,
      description: expense.description ?? '',
      userId: this.authService.user()?.id || '',
      status: RequestStatus.Pending,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      approvedAt: null,
      approvedBy: null,
      reviewedAt: null,
      reviewedBy: null,
      isReconcilled: false,
      advanceId: null
      bills: [],
    } as Expense;
  }
}
