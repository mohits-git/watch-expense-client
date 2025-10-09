import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { APIBaseResponse } from '../types/api-base-response.type';
import { ExpensesSummary } from '../types/expense-summary.type';
import { AdvanceSummary } from '../types/advance-summary.type';
import {
  ADVANCE_API_MESSAGES,
  API_ENDPOINTS,
  EXPENSE_API_MESSAGES,
  TOAST_SUMMARIES,
  TOAST_TYPES,
  USER_API_MESSAGES,
} from '../constants';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class EmployeeDashboardService {
  private httpClient = inject(HttpClient);
  private messageService = inject(MessageService);

  getExpenseSummary() {
    return this.httpClient
      .get<APIBaseResponse<ExpensesSummary>>(API_ENDPOINTS.EXPENSE.SUMMARY)
      .pipe(
        map((val) => {
          return val.data;
        }),
        catchError((err) => {
          this.messageService.add({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: EXPENSE_API_MESSAGES.FETCH_ERROR,
          });
          return throwError(() => err);
        }),
      );
  }

  getAdvanceSummary() {
    return this.httpClient
      .get<APIBaseResponse<AdvanceSummary>>(API_ENDPOINTS.ADVANCE.SUMMARY)
      .pipe(
        map((val) => {
          return val.data;
        }),
        catchError((err) => {
          this.messageService.add({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: ADVANCE_API_MESSAGES.FETCH_ERROR,
          });
          return throwError(() => err);
        }),
      );
  }

  getBudget() {
    return this.httpClient
      .get<APIBaseResponse<{ budget: number }>>(API_ENDPOINTS.USERS.BUDGET)
      .pipe(
        map((val) => {
          return val.data;
        }),
        catchError((err) => {
          this.messageService.add({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: USER_API_MESSAGES.FETCH_ERROR,
          });
          return throwError(() => err);
        }),
      );
  }
}
