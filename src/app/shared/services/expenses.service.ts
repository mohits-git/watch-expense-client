import { inject, Injectable, signal } from '@angular/core';
import { Expense, RequestStatus } from '../types/expense.type';
import { HttpClient } from '@angular/common/http';
import { APIBaseResponse } from '../types/api-base-response.type';
import { catchError, map, throwError } from 'rxjs';
import { AuthService } from '@/features/auth/services/auth.serivce';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  totalExpenses = signal(0);
  expenses = signal<Expense[] | null>(null);

  fetchExpenses(status?: RequestStatus, page?: number, limit?: number) {
    return this.httpClient
      .get<APIBaseResponse<{ totalExpenses: number; expenses: Expense[] }>>(
        '/api/expenses',
        {
          params: {
            ...(page ? { page: page ?? 1 } : {}),
            ...(limit ? { limit: limit ?? 10 } : {}),
            ...(status ? { status: status ?? '' } : {}),
          },
        },
      )
      .pipe(
        map((response) => {
          this.totalExpenses.set(response.data.totalExpenses);
          this.expenses.set(response.data.expenses);
          return true;
        }),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error fetching expenses',
            detail: err.message,
          });
          return throwError(() => new Error('Error fetching expenses'));
        }),
      );
  }

  addNewExpense(expense: Partial<Expense>) {
    if (!expense.amount || !expense.purpose) {
      return throwError(() => new Error('Amount and Purpose are required'));
    }
    const newExpense = this.NewExpense(expense);
    this.expenses.update((expenses) => [newExpense, ...(expenses ?? [])]);
    return this.httpClient
      .post<APIBaseResponse<{ id: string }>>('/api/expenses', expense)
      .pipe(
        map((response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Expense added successfully',
          });
          // update expense id
          this.expenses.update(
            (expenses) =>
              expenses?.map((expense) => {
                if (expense.id === newExpense.id) {
                  return { ...expense, id: response.data.id };
                }
                return expense;
              }) ?? null,
          );
        }),
        catchError((err) => {
          console.log('POST /expenses', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to add exense',
            detail: err.message,
          });
          // remove from the expneses list
          this.expenses.update(
            (expenses) =>
              expenses?.filter((expense) => expense.id !== newExpense.id) ??
              null,
          );
          return throwError(() => new Error('Failed to add new expense'));
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
      bills: [], // TODO:
    };
  }
}
