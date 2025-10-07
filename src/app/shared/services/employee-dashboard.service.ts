import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, tap } from 'rxjs';
import { APIBaseResponse } from '../types/api-base-response.type';
import { ExpensesSummary } from '../types/expense-summary.type';
import { AdvanceSummary } from '../types/advance-summary.type';

@Injectable({
  providedIn: 'root',
})
export class EmployeeDashboardService {
  private httpClient = inject(HttpClient);
  private _expenseSummary = signal<ExpensesSummary | null>(null);
  private _advanceSummary = signal<AdvanceSummary | null>(null);
  private _budget = signal<number | null>(null);

  expenseSummary = computed(() => {
    if (!this._expenseSummary()) {
      this.getExpenseSummary().subscribe();
      return null;
    }
    return this._expenseSummary();
  });

  advanceSummary = computed(() => {
    if (!this._advanceSummary()) {
      this.getAdvanceSummary().subscribe();
      return null;
    }
    return this._advanceSummary();
  });

  budget = computed(() => {
    if (!this._budget()) {
      this.getBudget().subscribe();
      return null;
    }
    return this._budget();
  });

  budgetLeft = computed(() => {
    if (!this._budget() || !this.expenseSummary()) {
      return null;
    }
    return this._budget()! - this.expenseSummary()!.totalExpense;
  });

  getExpenseSummary() {
    return this.httpClient
      .get<APIBaseResponse<ExpensesSummary>>('/api/expenses/summary')
      .pipe(
        map((val) => {
          return val.data;
        }),
        tap((val) => {
          this._expenseSummary.set(val);
        }),
      );
  }

  getAdvanceSummary() {
    return this.httpClient
      .get<APIBaseResponse<AdvanceSummary>>('/api/advance-request/summary')
      .pipe(
        map((val) => {
          return val.data;
        }),
        tap((val) => {
          this._advanceSummary.set(val);
        }),
      );
  }

  getBudget() {
    return this.httpClient
      .get<APIBaseResponse<{ budget: number }>>('/api/users/budget')
      .pipe(
        map((val) => {
          return val.data;
        }),
        tap((val) => {
          this._budget.set(val.budget);
        }),
      );
  }
}
