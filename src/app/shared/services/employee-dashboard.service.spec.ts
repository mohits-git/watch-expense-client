import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';

import {
  API_ENDPOINTS,
  API_MESSAGES,
  TOAST_SUMMARIES,
  TOAST_TYPES,
} from '@/shared/constants';
import {
  ExpensesSummary,
  AdvanceSummary,
  UserBudgetAPIResponse,
} from '@/shared/types';

import { EmployeeDashboardService } from './employee-dashboard.service';

describe('EmployeeDashboardService', () => {
  let service: EmployeeDashboardService;
  let httpMock: HttpTestingController;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const expenseSummary: ExpensesSummary = {
    totalExpense: 1000,
    pendingExpense: 400,
    reimbursedExpense: 500,
    rejectedExpense: 100,
  };

  const advanceSummary: AdvanceSummary = {
    approved: 200,
    reconciled: 150,
    pendingReconciliation: 50,
    rejectedAdvance: 10,
  };

  const budgetResponse: UserBudgetAPIResponse = {
    budget: 10_000,
  };

  beforeEach(() => {
    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', [
      'add',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    });

    service = TestBed.inject(EmployeeDashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getExpenseSummary', () => {
    it('GETs expense summary and returns data', (done) => {
      service.getExpenseSummary().subscribe((result) => {
        expect(result).toEqual(expenseSummary);
        done();
      });

      const req = httpMock.expectOne(API_ENDPOINTS.EXPENSE.SUMMARY);
      expect(req.request.method).toBe('GET');
      req.flush({ data: expenseSummary });
    });

    it('shows error toast and rethrows on failure', (done) => {
      service.getExpenseSummary().subscribe({
        next: () => done.fail('Expected error'),
        error: (err) => {
          expect(messageServiceSpy.add).toHaveBeenCalledWith({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: API_MESSAGES.EXPENSE.FETCH_SUMMARY_ERROR,
          });
          expect(err).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.EXPENSE.SUMMARY);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getAdvanceSummary', () => {
    it('GETs advance summary and returns data', (done) => {
      service.getAdvanceSummary().subscribe((result) => {
        expect(result).toEqual(advanceSummary);
        done();
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADVANCE.SUMMARY);
      expect(req.request.method).toBe('GET');
      req.flush({ data: advanceSummary });
    });

    it('shows error toast and rethrows on failure', (done) => {
      service.getAdvanceSummary().subscribe({
        next: () => done.fail('Expected error'),
        error: (err) => {
          expect(messageServiceSpy.add).toHaveBeenCalledWith({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: API_MESSAGES.ADVANCE.FETCH_SUMMARY_ERROR,
          });
          expect(err).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADVANCE.SUMMARY);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getBudget', () => {
    it('GETs user budget and returns data', (done) => {
      service.getBudget().subscribe((result) => {
        expect(result).toEqual(budgetResponse);
        done();
      });

      const req = httpMock.expectOne(API_ENDPOINTS.USERS.BUDGET);
      expect(req.request.method).toBe('GET');
      req.flush({ data: budgetResponse });
    });

    it('shows error toast and rethrows on failure', (done) => {
      service.getBudget().subscribe({
        next: () => done.fail('Expected error'),
        error: (err) => {
          expect(messageServiceSpy.add).toHaveBeenCalledWith({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: API_MESSAGES.USER.FETCH_BUDGET_ERROR,
          });
          expect(err).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.USERS.BUDGET);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });
});
