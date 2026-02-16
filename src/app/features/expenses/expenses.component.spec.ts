import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ExpensesComponent } from './expenses.component';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpensesService } from '@/shared/services/expenses.service';
import { AuthService } from '@/shared/services/auth.serivce';
import { Expense, GetExpenseAPIResponse, RequestStatus, ExpenseStatusFilter } from '@/shared/types';
import { EXPENSE, APP_ROUTES, NAVIGATION_OPTIONS } from '@/shared/constants';
import { getRouteSegments } from '@/shared/utils/routes.util';

describe('ExpensesComponent', () => {
  let component: ExpensesComponent;
  let fixture: ComponentFixture<ExpensesComponent>;
  let expensesServiceSpy: jasmine.SpyObj<ExpensesService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let queryParams$: BehaviorSubject<Record<string, string>>;

  const mockExpense: Expense = {
    id: 'exp-1',
    userId: 'user-1',
    amount: 5000,
    purpose: 'Travel expenses',
    status: RequestStatus.Pending,
    description: 'Business trip to Mumbai',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    approvedBy: null,
    approvedAt: null,
    reviewedBy: null,
    reviewedAt: null,
    isReconciled: false,
    advanceId: null,
    bills: [],
  };

  const mockExpenseReconciliation: Expense = {
    ...mockExpense,
    id: 'exp-2',
    status: RequestStatus.Approved,
    amount: 3000,
    purpose: 'Office supplies',
    isReconciled: true,
    advanceId: 'adv-1',
  };

  const mockGetExpensesResponse: GetExpenseAPIResponse = {
    totalExpenses: 2,
    expenses: [mockExpense, mockExpenseReconciliation],
  };

  beforeEach(async () => {
    queryParams$ = new BehaviorSubject<Record<string, string>>({});

    expensesServiceSpy = jasmine.createSpyObj<ExpensesService>('ExpensesService', [
      'fetchExpenses',
    ]);
    expensesServiceSpy.fetchExpenses.and.returnValue(of(mockGetExpensesResponse));

    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['hasRole']);
    authServiceSpy.hasRole.and.returnValue(false);

    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ExpensesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: ExpensesService, useValue: expensesServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: queryParams$.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should fetch expenses on init when query params emit', () => {
    fixture.detectChanges();

    expect(expensesServiceSpy.fetchExpenses).toHaveBeenCalledTimes(1);
    expect(component.expenses()).toEqual(mockGetExpensesResponse.expenses);
    expect(component.totalRecords()).toBe(2);
    expect(component.loading()).toBeFalse();
  });

  it('should pass status from query params to fetchExpenses', () => {
    queryParams$.next({ status: 'PENDING' });
    fixture.detectChanges();

    expect(expensesServiceSpy.fetchExpenses).toHaveBeenCalledWith(
      'PENDING' as RequestStatus,
      1,
      5,
    );
    expect(component.status()).toBe('PENDING');
  });

  it('should pass page and limit from query params to fetchExpenses', () => {
    queryParams$.next({ page: '2', limit: '20' });
    fixture.detectChanges();

    expect(expensesServiceSpy.fetchExpenses).toHaveBeenCalledWith(undefined, 2, 20);
    expect(component.page()).toBe(2);
  });

  it('should default status to ALL when no status query param is present', () => {
    fixture.detectChanges();

    expect(component.status()).toBe(EXPENSE.STATUS_FILTER.ALL);
  });

  it('should show loading state while expenses are being fetched', () => {
    // Use Observable that never emits to keep component in loading state
    expensesServiceSpy.fetchExpenses.and.returnValue(new Observable(() => {}));

    fixture.detectChanges();

    expect(component.loading()).toBeTrue();
    expect(component.expenses()).toBeNull();
  });

  it('should stop loading and show error toast on fetch error', () => {
    expensesServiceSpy.fetchExpenses.and.returnValue(
      throwError(() => new Error('Server error')),
    );

    fixture.detectChanges();

    expect(component.loading()).toBeFalse();
    expect(component.dataFetchingError()).toBe('Server error');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error' }),
    );
  });

  it('should re-fetch expenses when query params change', () => {
    fixture.detectChanges();
    expect(expensesServiceSpy.fetchExpenses).toHaveBeenCalledTimes(1);

    queryParams$.next({ status: 'APPROVED' });
    expect(expensesServiceSpy.fetchExpenses).toHaveBeenCalledTimes(2);
  });

  describe('getSeverity', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return "warn" for Pending status', () => {
      expect(component.getSeverity(RequestStatus.Pending)).toBe('warn');
    });

    it('should return "success" for Approved status', () => {
      expect(component.getSeverity(RequestStatus.Approved)).toBe('success');
    });

    it('should return "danger" for Rejected status', () => {
      expect(component.getSeverity(RequestStatus.Rejected)).toBe('danger');
    });

    it('should return "info" for Reviewed status', () => {
      expect(component.getSeverity(RequestStatus.Reviewed)).toBe('info');
    });

    it('should return "primary" for unknown status', () => {
      expect(component.getSeverity('UNKNOWN')).toBe('primary');
    });
  });

  describe('openAddExpenseForm', () => {
    it('should set openNewExpenseForm to true', () => {
      fixture.detectChanges();

      expect(component.openNewExpenseForm()).toBeFalse();
      component.openAddExpenseForm();
      expect(component.openNewExpenseForm()).toBeTrue();
    });
  });

  describe('onPageChange', () => {
    it('should navigate with updated page query param', () => {
      fixture.detectChanges();

      component.onPageChange({ page: 2, first: 10, rows: 5 });

      expect(routerSpy.navigate).toHaveBeenCalledWith(
        getRouteSegments(APP_ROUTES.EXPENSES),
        {
          queryParams: { page: '3' },
          queryParamsHandling: NAVIGATION_OPTIONS.QUERY_PARAMS_HANDLING.MERGE,
        },
      );
    });

    it('should default to page 1 when event.page is undefined', () => {
      fixture.detectChanges();

      component.onPageChange({ first: 0, rows: 5 });

      expect(routerSpy.navigate).toHaveBeenCalledWith(
        getRouteSegments(APP_ROUTES.EXPENSES),
        {
          queryParams: { page: '1' },
          queryParamsHandling: NAVIGATION_OPTIONS.QUERY_PARAMS_HANDLING.MERGE,
        },
      );
    });
  });

  describe('onStatusChange', () => {
    it('should navigate with status query param and reset page', () => {
      fixture.detectChanges();

      component.onStatusChange(RequestStatus.Approved);

      expect(routerSpy.navigate).toHaveBeenCalledWith(
        getRouteSegments(APP_ROUTES.EXPENSES),
        {
          queryParams: { status: RequestStatus.Approved, page: '1' },
          queryParamsHandling: NAVIGATION_OPTIONS.QUERY_PARAMS_HANDLING.MERGE,
        },
      );
    });

    it('should set status to null when ALL is selected', () => {
      fixture.detectChanges();

      component.onStatusChange(EXPENSE.STATUS_FILTER.ALL as any);

      expect(routerSpy.navigate).toHaveBeenCalledWith(
        getRouteSegments(APP_ROUTES.EXPENSES),
        {
          queryParams: { status: null, page: '1' },
          queryParamsHandling: NAVIGATION_OPTIONS.QUERY_PARAMS_HANDLING.MERGE,
        },
      );
    });
  });

  describe('addNewExpense', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should prepend expense to list when status filter is ALL', () => {
      const newExpense: Expense = { ...mockExpense, id: 'exp-new', purpose: 'New expense' };

      component.addNewExpense(newExpense);

      expect(component.expenses()![0].id).toBe('exp-new');
      expect(component.totalRecords()).toBe(3);
    });

    it('should prepend expense to list when status filter is PENDING', () => {
      component.status.set(EXPENSE.STATUS_FILTER.PENDING as ExpenseStatusFilter);
      const newExpense: Expense = { ...mockExpense, id: 'exp-new' };

      component.addNewExpense(newExpense);

      expect(component.expenses()![0].id).toBe('exp-new');
      expect(component.totalRecords()).toBe(3);
    });

    it('should prepend expense to list when no status is set', () => {
      component.status.set('' as any);
      const newExpense: Expense = { ...mockExpense, id: 'exp-new' };

      component.addNewExpense(newExpense);

      expect(component.expenses()![0].id).toBe('exp-new');
    });
  });

  describe('openExpenseDetails', () => {
    it('should set selectedExpense and open the details modal', () => {
      fixture.detectChanges();

      component.openExpenseDetails(mockExpense);

      expect(component.selectedExpense()).toBe(mockExpense);
      expect(component.openExpenseDetailsModal()).toBeTrue();
    });
  });

  describe('onExpenseStatusChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.openExpenseDetails(mockExpense);
    });

    it('should update the expense status in the list', () => {
      component.onExpenseStatusChange(RequestStatus.Approved);

      const updated = component.expenses()!.find((e) => e.id === mockExpense.id);
      expect(updated?.status).toBe(RequestStatus.Approved);
    });

    it('should update the selected expense status', () => {
      component.onExpenseStatusChange(RequestStatus.Rejected);

      expect(component.selectedExpense()?.status).toBe(RequestStatus.Rejected);
    });

    it('should do nothing if no expense is selected', () => {
      component.selectedExpense.set(null);
      const originalExpenses = component.expenses();

      component.onExpenseStatusChange(RequestStatus.Approved);

      expect(component.expenses()).toBe(originalExpenses);
    });
  });

  describe('isAdmin', () => {
    it('should return false when user is not an admin', () => {
      authServiceSpy.hasRole.and.returnValue(false);
      fixture.detectChanges();

      expect(component.isAdmin()).toBeFalse();
    });

    it('should return true when user is an admin', () => {
      authServiceSpy.hasRole.and.returnValue(true);
      fixture.detectChanges();

      expect(component.isAdmin()).toBeTrue();
    });
  });

  describe('template rendering', () => {
    it('should show "New Expense" button for non-admin users', () => {
      authServiceSpy.hasRole.and.returnValue(false);
      fixture.detectChanges();

      const newExpenseBtn = fixture.debugElement.query(By.css('.header p-button'));
      expect(newExpenseBtn).toBeTruthy();
    });

    it('should hide "New Expense" button for admin users', () => {
      authServiceSpy.hasRole.and.returnValue(true);
      fixture.detectChanges();

      const newExpenseBtn = fixture.debugElement.query(By.css('.header p-button'));
      expect(newExpenseBtn).toBeFalsy();
    });

    it('should render the status filter select button', () => {
      fixture.detectChanges();

      const selectButton = fixture.debugElement.query(By.css('p-selectbutton'));
      expect(selectButton).toBeTruthy();
    });

    it('should render the expenses table', () => {
      fixture.detectChanges();

      const table = fixture.debugElement.query(By.css('p-table'));
      expect(table).toBeTruthy();
    });

    it('should show empty state when no expenses and not loading', () => {
      expensesServiceSpy.fetchExpenses.and.returnValue(
        of({ totalExpenses: 0, expenses: [] }),
      );
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyState).toBeTruthy();
    });

    it('should show paginator when totalRecords is greater than 0', () => {
      fixture.detectChanges();

      const paginator = fixture.debugElement.query(By.css('p-paginator'));
      expect(paginator).toBeTruthy();
    });

    it('should not show paginator when totalRecords is 0', () => {
      expensesServiceSpy.fetchExpenses.and.returnValue(
        of({ totalExpenses: 0, expenses: [] }),
      );
      fixture.detectChanges();

      const paginator = fixture.debugElement.query(By.css('p-paginator'));
      expect(paginator).toBeFalsy();
    });
  });
});
