import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { APIBaseResponse } from '../types/api-base-response.type';
import { ExpensesSummary } from '../types/expense.type';
import { AdvanceSummary } from '../types/advance-summary.type';
import {
  API_ENDPOINTS,
  API_MESSAGES,
  TOAST_SUMMARIES,
  TOAST_TYPES,
} from '../constants';
import { MessageService } from 'primeng/api';
import { BudgetSummary } from '../types/budget-summary.type';

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
            detail: API_MESSAGES.EXPENSE.FETCH_SUMMARY_ERROR,
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
            detail: API_MESSAGES.ADVANCE.FETCH_SUMMARY_ERROR,
          });
          return throwError(() => err);
        }),
      );
  }

  getBudget() {
    return this.httpClient
      .get<APIBaseResponse<BudgetSummary>>(API_ENDPOINTS.USERS.BUDGET)
      .pipe(
        map((val) => {
          return val.data;
        }),
        catchError((err) => {
          this.messageService.add({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: API_MESSAGES.USER.FETCH_BUDGET_ERROR,
          });
          return throwError(() => err);
        }),
      );
  }
}
