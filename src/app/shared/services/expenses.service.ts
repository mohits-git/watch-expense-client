import { inject, Injectable } from '@angular/core';
import {
  CreateExpenseAPIResponse,
  Expense,
  GetExpenseAPIResponse,
  RequestStatus,
  APIBaseResponse,
  ExpenseCreateResult,
} from '@/shared/types';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from '@/shared/services/auth.serivce';
import { API_ENDPOINTS, API_MESSAGES, HTTP_STATUS_CODES } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);

  fetchExpenses(
    status?: RequestStatus,
    page?: number,
    limit?: number,
  ): Observable<GetExpenseAPIResponse> {
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
        catchError((errorResponse: HttpErrorResponse) => {
          const errorMessage =
            errorResponse.error?.message || API_MESSAGES.EXPENSE.FETCH_ERROR;
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  addNewExpense(expense: Partial<Expense>): Observable<ExpenseCreateResult> {
    if (!expense.amount || !expense.purpose) {
      return throwError(
        () =>
          ({
            success: false,
            message: API_MESSAGES.EXPENSE.ADD_EXPENSE_BAD_REQUEST,
          }) as ExpenseCreateResult,
      );
    }

    const newExpense = this.NewExpense(expense);
    return this.httpClient
      .post<
        APIBaseResponse<CreateExpenseAPIResponse>
      >(API_ENDPOINTS.EXPENSE.CREATE, expense)
      .pipe(
        map((response) => {
          newExpense.id = response.data.id;
          return {
            success: true,
            data: newExpense,
          } as ExpenseCreateResult;
        }),
        catchError((err: HttpErrorResponse) => {
          let errorMessage = API_MESSAGES.EXPENSE.ADD_EXPENSE_ERROR;
          if (err.status === HTTP_STATUS_CODES.BAD_REQUEST) {
            errorMessage =
              err.error?.message ||
              API_MESSAGES.EXPENSE.ADD_EXPENSE_BAD_REQUEST;
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          }

          const result: ExpenseCreateResult = {
            success: false,
            message: errorMessage,
          };

          return throwError(() => result);
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
      advanceId: null,
      bills: [],
    } as Expense;
  }

  updateExpenseStatus(expenseId: string, status: RequestStatus): Observable<void> {
    return this.httpClient
      .patch<APIBaseResponse<void>>(
        API_ENDPOINTS.EXPENSE.PATCH.replace(':id', expenseId),
        { status }
      )
      .pipe(
        map(() => undefined),
        catchError((errorResponse: HttpErrorResponse) => {
          const errorMessage =
            errorResponse.error?.message || API_MESSAGES.EXPENSE.EXPENSE_UPDATE_FAILED;
          return throwError(() => new Error(errorMessage));
        }),
      );
  }
}
