import { inject, Injectable } from '@angular/core';
import { Expense, RequestStatus } from '../types/expense.type';
import { HttpClient } from '@angular/common/http';
import { APIBaseResponse } from '../types/api-base-response.type';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  httpClient = inject(HttpClient);

  getExpenses(status?: RequestStatus, page?: number, limit?: number) {
    return this.httpClient
      .get<APIBaseResponse<Expense[]>>('/api/expenses', {
        params: {
          page: page ?? 1,
          limit: limit ?? 10,
          status: status ?? '',
        },
      })
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
  }
}
