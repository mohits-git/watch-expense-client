import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  API_ENDPOINTS,
  API_MESSAGES,
  HTTP_STATUS_CODES,
} from '@/shared/constants';
import {
  GetExpenseAPIResponse,
  RequestStatus,
  ExpenseCreateResult,
} from '@/shared/types';

import { AuthService } from './auth.serivce';
import { ExpensesService } from './expenses.service';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let httpMock: HttpTestingController;
  let authServiceFake: { user: ReturnType<typeof signal> };

  const mockUser = { id: 'user-1' };
  const expensesResponse: GetExpenseAPIResponse = {
    totalExpenses: 2,
    expenses: [
      {
        id: 'e1',
        userId: 'user-1',
        amount: 100,
        purpose: 'Travel',
        status: RequestStatus.Pending,
        description: '',
        createdAt: 1,
        updatedAt: 1,
        approvedAt: null,
        approvedBy: null,
        reviewedAt: null,
        reviewedBy: null,
        isReconciled: false,
        advanceId: null,
        bills: [],
      },
    ],
  };

  beforeEach(() => {
    authServiceFake = { user: signal(mockUser) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceFake },
      ],
    });

    service = TestBed.inject(ExpensesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('fetchExpenses', () => {
    it('GETs with default page, limit, status and returns response data', (done) => {
      service.fetchExpenses().subscribe((result) => {
        expect(result).toEqual(expensesResponse);
        done();
      });

      const req = httpMock.expectOne(
        (r) =>
          r.method === 'GET' &&
          (r.url === API_ENDPOINTS.EXPENSE.GET_ALL ||
            r.url.startsWith(API_ENDPOINTS.EXPENSE.GET_ALL + '?')) &&
          r.params.get('page') === '1' &&
          r.params.get('limit') === '10' &&
          r.params.get('status') === '',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: expensesResponse });
    });

    it('GETs with provided status, page, limit', (done) => {
      service
        .fetchExpenses(RequestStatus.Approved, 2, 20)
        .subscribe((result) => {
          expect(result).toEqual(expensesResponse);
          done();
        });

      const req = httpMock.expectOne(
        (r) =>
          r.method === 'GET' &&
          (r.url === API_ENDPOINTS.EXPENSE.GET_ALL ||
            r.url.startsWith(API_ENDPOINTS.EXPENSE.GET_ALL + '?')) &&
          r.params.get('status') === RequestStatus.Approved &&
          r.params.get('page') === '2' &&
          r.params.get('limit') === '20',
      );
      req.flush({ data: expensesResponse });
    });

    it('maps error to message from response when present', (done) => {
      const errorMessage = 'fetch failed';

      service.fetchExpenses().subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(errorMessage);
          done();
        },
      });

      const req = httpMock.expectOne(
        (r) =>
          r.method === 'GET' &&
          (r.url === API_ENDPOINTS.EXPENSE.GET_ALL ||
            r.url.startsWith(API_ENDPOINTS.EXPENSE.GET_ALL + '?')),
      );
      req.flush(
        { message: errorMessage },
        { status: 500, statusText: 'Server Error' },
      );
    });

    it('uses default FETCH_ERROR when response has no message', (done) => {
      service.fetchExpenses().subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(API_MESSAGES.EXPENSE.FETCH_ERROR);
          done();
        },
      });

      const req = httpMock.expectOne(
        (r) =>
          r.method === 'GET' &&
          (r.url === API_ENDPOINTS.EXPENSE.GET_ALL ||
            r.url.startsWith(API_ENDPOINTS.EXPENSE.GET_ALL + '?')),
      );
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('addNewExpense', () => {
    it('returns bad request result when amount is missing', (done) => {
      service
        .addNewExpense({ purpose: 'Food', description: '' })
        .subscribe({
          next: () => done.fail('Expected error'),
          error: (result: ExpenseCreateResult) => {
            expect(result.success).toBeFalse();
            expect(result.message).toBe(
              API_MESSAGES.EXPENSE.ADD_EXPENSE_BAD_REQUEST,
            );
            done();
          },
        });
    });

    it('returns bad request result when purpose is missing', (done) => {
      service.addNewExpense({ amount: 50, description: '' }).subscribe({
        next: () => done.fail('Expected error'),
        error: (result: ExpenseCreateResult) => {
          expect(result.success).toBeFalse();
          expect(result.message).toBe(
            API_MESSAGES.EXPENSE.ADD_EXPENSE_BAD_REQUEST,
          );
          done();
        },
      });
    });

    it('POSTs expense and returns success with data when API returns id', (done) => {
      const payload = { amount: 200, purpose: 'Office', description: 'Stuff' };

      service.addNewExpense(payload).subscribe((result) => {
        expect(result.success).toBeTrue();
        expect(result.data).toBeDefined();
        expect(result.data?.id).toBe('new-expense-id');
        expect(result.data?.userId).toBe('user-1');
        expect(result.data?.amount).toBe(200);
        expect(result.data?.purpose).toBe('Office');
        expect(result.data?.status).toBe(RequestStatus.Pending);
        done();
      });

      const req = httpMock.expectOne(API_ENDPOINTS.EXPENSE.CREATE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ data: { id: 'new-expense-id' } });
    });

    it('uses BAD_REQUEST message when API returns 400 with message', (done) => {
      const payload = { amount: 200, purpose: 'Office' };
      const errorMessage = 'Invalid data';

      service.addNewExpense(payload).subscribe({
        next: () => done.fail('Expected error'),
        error: (result: ExpenseCreateResult) => {
          expect(result.success).toBeFalse();
          expect(result.message).toBe(errorMessage);
          done();
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.EXPENSE.CREATE);
      req.flush(
        { message: errorMessage },
        { status: HTTP_STATUS_CODES.BAD_REQUEST, statusText: 'Bad Request' },
      );
    });

    it('uses ADD_EXPENSE_ERROR when non-400 error has no message', (done) => {
      service
        .addNewExpense({ amount: 1, purpose: 'X' })
        .subscribe({
          next: () => done.fail('Expected error'),
          error: (result: ExpenseCreateResult) => {
            expect(result.success).toBeFalse();
            expect(result.message).toBe(API_MESSAGES.EXPENSE.ADD_EXPENSE_ERROR);
            done();
          },
        });

      const req = httpMock.expectOne(API_ENDPOINTS.EXPENSE.CREATE);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('updateExpenseStatus', () => {
    it('PATCHes with status and resolves void', (done) => {
      const expenseId = 'e42';
      const status = RequestStatus.Approved;
      const url = API_ENDPOINTS.EXPENSE.PATCH.replace(':id', expenseId);

      service.updateExpenseStatus(expenseId, status).subscribe((result) => {
        expect(result).toBeUndefined();
        done();
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status });
      req.flush({ data: undefined });
    });

    it('propagates error message', (done) => {
      const expenseId = 'e42';
      const url = API_ENDPOINTS.EXPENSE.PATCH.replace(':id', expenseId);
      const errorMessage = 'update failed';

      service.updateExpenseStatus(expenseId, RequestStatus.Rejected).subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(errorMessage);
          done();
        },
      });

      const req = httpMock.expectOne(url);
      req.flush(
        { message: errorMessage },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    it('uses default EXPENSE_UPDATE_FAILED when response has no message', (done) => {
      const expenseId = 'e99';
      const url = API_ENDPOINTS.EXPENSE.PATCH.replace(':id', expenseId);

      service.updateExpenseStatus(expenseId, RequestStatus.Approved).subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(
            API_MESSAGES.EXPENSE.EXPENSE_UPDATE_FAILED,
          );
          done();
        },
      });

      const req = httpMock.expectOne(url);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('fetchExpenseById', () => {
    it('GETs by id and returns expense', (done) => {
      const expenseId = 'e1';
      const expense = expensesResponse.expenses[0];
      const url = API_ENDPOINTS.EXPENSE.GET_BY_ID.replace(':id', expenseId);

      service.fetchExpenseById(expenseId).subscribe((result) => {
        expect(result).toEqual(expense);
        done();
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush({ data: expense });
    });

    it('propagates error message', (done) => {
      const expenseId = 'e999';
      const url = API_ENDPOINTS.EXPENSE.GET_BY_ID.replace(':id', expenseId);
      const errorMessage = 'not found';

      service.fetchExpenseById(expenseId).subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(errorMessage);
          done();
        },
      });

      const req = httpMock.expectOne(url);
      req.flush(
        { message: errorMessage },
        { status: 404, statusText: 'Not Found' },
      );
    });

    it('uses default FETCH_ERROR when response has no message', (done) => {
      const expenseId = 'e999';
      const url = API_ENDPOINTS.EXPENSE.GET_BY_ID.replace(':id', expenseId);

      service.fetchExpenseById(expenseId).subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(API_MESSAGES.EXPENSE.FETCH_ERROR);
          done();
        },
      });

      const req = httpMock.expectOne(url);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });
});
