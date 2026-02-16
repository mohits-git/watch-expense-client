import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AdvancesComponent } from './advances.component';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvancesService } from '@/shared/services/advances.service';
import { AuthService } from '@/shared/services/auth.serivce';
import { Advance, GetAdvanceAPIResponse, RequestStatus, Expense } from '@/shared/types';
import { UserRole } from '@/shared/enums';
import { ADVANCE, APP_ROUTES, NAVIGATION_OPTIONS } from '@/shared/constants';
import { getRouteSegments } from '@/shared/utils/routes.util';

describe('AdvancesComponent', () => {
  let component: AdvancesComponent;
  let fixture: ComponentFixture<AdvancesComponent>;
  let advancesServiceSpy: jasmine.SpyObj<AdvancesService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let queryParams$: BehaviorSubject<Record<string, string>>;

  const mockAdvance: Advance = {
    id: 'adv-1',
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
    reconciledExpenseId: null,
  };

  const mockAdvanceApproved: Advance = {
    ...mockAdvance,
    id: 'adv-2',
    status: RequestStatus.Approved,
    amount: 3000,
    purpose: 'Office supplies',
    reconciledExpenseId: 'exp-1',
  };

  const mockGetAdvancesResponse: GetAdvanceAPIResponse = {
    totalAdvances: 2,
    advances: [mockAdvance, mockAdvanceApproved],
  };

  beforeEach(async () => {
    queryParams$ = new BehaviorSubject<Record<string, string>>({});

    advancesServiceSpy = jasmine.createSpyObj<AdvancesService>('AdvancesService', [
      'fetchAdvances',
    ]);
    advancesServiceSpy.fetchAdvances.and.returnValue(of(mockGetAdvancesResponse));

    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['hasRole']);
    authServiceSpy.hasRole.and.returnValue(false);

    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AdvancesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: AdvancesService, useValue: advancesServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: queryParams$.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvancesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should fetch advances on init when query params emit', () => {
    fixture.detectChanges();

    expect(advancesServiceSpy.fetchAdvances).toHaveBeenCalledTimes(1);
    expect(component.advances()).toEqual(mockGetAdvancesResponse.advances);
    expect(component.totalRecords()).toBe(2);
    expect(component.loading()).toBeFalse();
  });

  it('should pass status from query params to fetchAdvances', () => {
    queryParams$.next({ status: 'PENDING' });
    fixture.detectChanges();

    expect(advancesServiceSpy.fetchAdvances).toHaveBeenCalledWith(
      'PENDING' as RequestStatus,
      1,
      10,
    );
    expect(component.status()).toBe('PENDING');
  });

  it('should pass page and limit from query params to fetchAdvances', () => {
    queryParams$.next({ page: '2', limit: '20' });
    fixture.detectChanges();

    expect(advancesServiceSpy.fetchAdvances).toHaveBeenCalledWith(undefined, 2, 20);
    expect(component.page()).toBe(2);
  });

  it('should default status to ALL when no status query param is present', () => {
    fixture.detectChanges();

    expect(component.status()).toBe(ADVANCE.STATUS_FILTER.ALL);
  });

  it('should show loading state while advances are being fetched', () => {
    // Use Observable that never emits to keep component in loading state
    advancesServiceSpy.fetchAdvances.and.returnValue(new Observable(() => {}));
    
    fixture.detectChanges();

    expect(component.loading()).toBeTrue();
    expect(component.advances()).toBeNull();
  });

  it('should stop loading and show error toast on fetch error', () => {
    advancesServiceSpy.fetchAdvances.and.returnValue(
      throwError(() => new Error('Server error')),
    );

    fixture.detectChanges();

    expect(component.loading()).toBeFalse();
    expect(component.dataFetchingError()).toBe('Server error');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error' }),
    );
  });

  it('should re-fetch advances when query params change', () => {
    fixture.detectChanges();
    expect(advancesServiceSpy.fetchAdvances).toHaveBeenCalledTimes(1);

    queryParams$.next({ status: 'APPROVED' });
    expect(advancesServiceSpy.fetchAdvances).toHaveBeenCalledTimes(2);
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

  describe('openAddAdvanceForm', () => {
    it('should set openNewAdvanceForm to true', () => {
      fixture.detectChanges();

      expect(component.openNewAdvanceForm()).toBeFalse();
      component.openAddAdvanceForm();
      expect(component.openNewAdvanceForm()).toBeTrue();
    });
  });

  describe('onPageChange', () => {
    it('should navigate with updated page query param', () => {
      fixture.detectChanges();

      component.onPageChange({ page: 2, first: 10, rows: 5 });

      expect(routerSpy.navigate).toHaveBeenCalledWith(
        getRouteSegments(APP_ROUTES.ADVANCES),
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
        getRouteSegments(APP_ROUTES.ADVANCES),
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
        getRouteSegments(APP_ROUTES.ADVANCES),
        {
          queryParams: { status: RequestStatus.Approved, page: '1' },
          queryParamsHandling: NAVIGATION_OPTIONS.QUERY_PARAMS_HANDLING.MERGE,
        },
      );
    });

    it('should set status to null when ALL is selected', () => {
      fixture.detectChanges();

      component.onStatusChange(ADVANCE.STATUS_FILTER.ALL as any);

      expect(routerSpy.navigate).toHaveBeenCalledWith(
        getRouteSegments(APP_ROUTES.ADVANCES),
        {
          queryParams: { status: null, page: '1' },
          queryParamsHandling: NAVIGATION_OPTIONS.QUERY_PARAMS_HANDLING.MERGE,
        },
      );
    });
  });

  describe('addNewAdvance', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should prepend advance to list when status filter is ALL', () => {
      const newAdvance: Advance = { ...mockAdvance, id: 'adv-new', purpose: 'New advance' };

      component.addNewAdvance(newAdvance);

      expect(component.advances()![0].id).toBe('adv-new');
      expect(component.totalRecords()).toBe(3);
    });

    it('should prepend advance to list when no status is set', () => {
      component.status.set('' as any);
      const newAdvance: Advance = { ...mockAdvance, id: 'adv-new' };

      component.addNewAdvance(newAdvance);

      expect(component.advances()![0].id).toBe('adv-new');
    });
  });

  describe('openAdvanceDetails', () => {
    it('should set selectedAdvance and open the details modal', () => {
      fixture.detectChanges();

      component.openAdvanceDetails(mockAdvance);

      expect(component.selectedAdvance()).toBe(mockAdvance);
      expect(component.openAdvanceDetailsModal()).toBeTrue();
    });
  });

  describe('onAdvanceStatusChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.openAdvanceDetails(mockAdvance);
    });

    it('should update the advance status in the list', () => {
      component.onAdvanceStatusChange(RequestStatus.Approved);

      const updated = component.advances()!.find((a) => a.id === mockAdvance.id);
      expect(updated?.status).toBe(RequestStatus.Approved);
    });

    it('should update the selected advance status', () => {
      component.onAdvanceStatusChange(RequestStatus.Rejected);

      expect(component.selectedAdvance()?.status).toBe(RequestStatus.Rejected);
    });

    it('should do nothing if no advance is selected', () => {
      component.selectedAdvance.set(null);
      const originalAdvances = component.advances();

      component.onAdvanceStatusChange(RequestStatus.Approved);

      expect(component.advances()).toBe(originalAdvances);
    });
  });

  describe('onReconcileAdvance', () => {
    it('should set reconciliation advance id and open expense form', () => {
      fixture.detectChanges();

      component.onReconcileAdvance('adv-1');

      expect(component.reconciliationAdvanceId()).toBe('adv-1');
      expect(component.openReconciliationExpenseForm()).toBeTrue();
    });
  });

  describe('onReconciliationExpenseAdded', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.reconciliationAdvanceId.set('adv-1');
    });

    it('should update advance with reconciled expense id', () => {
      const expense: Expense = {
        id: 'exp-100',
        userId: 'user-1',
        amount: 5000,
        purpose: 'Travel',
        status: RequestStatus.Pending,
        description: 'Reconciliation expense',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        approvedBy: null,
        approvedAt: null,
        reviewedBy: null,
        reviewedAt: null,
        isReconciled: false,
        advanceId: 'adv-1',
        bills: [],
      };

      component.onReconciliationExpenseAdded(expense);

      const updated = component.advances()!.find((a) => a.id === 'adv-1');
      expect(updated?.reconciledExpenseId).toBe('exp-100');
      expect(component.reconciliationAdvanceId()).toBeNull();
    });

    it('should do nothing if reconciliationAdvanceId is null', () => {
      component.reconciliationAdvanceId.set(null);
      const originalAdvances = component.advances();

      component.onReconciliationExpenseAdded({
        id: 'exp-100',
      } as Expense);

      expect(component.advances()).toBe(originalAdvances);
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
    it('should show "New Advance" button for non-admin users', () => {
      authServiceSpy.hasRole.and.returnValue(false);
      fixture.detectChanges();

      const newAdvanceBtn = fixture.debugElement.query(By.css('.header p-button'));
      expect(newAdvanceBtn).toBeTruthy();
    });

    it('should hide "New Advance" button for admin users', () => {
      authServiceSpy.hasRole.and.returnValue(true);
      fixture.detectChanges();

      const newAdvanceBtn = fixture.debugElement.query(By.css('.header p-button'));
      expect(newAdvanceBtn).toBeFalsy();
    });

    it('should render the status filter select button', () => {
      fixture.detectChanges();

      const selectButton = fixture.debugElement.query(By.css('p-selectbutton'));
      expect(selectButton).toBeTruthy();
    });

    it('should render the advances table', () => {
      fixture.detectChanges();

      const table = fixture.debugElement.query(By.css('p-table'));
      expect(table).toBeTruthy();
    });

    it('should show empty state when no advances and not loading', () => {
      advancesServiceSpy.fetchAdvances.and.returnValue(
        of({ totalAdvances: 0, advances: [] }),
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
      advancesServiceSpy.fetchAdvances.and.returnValue(
        of({ totalAdvances: 0, advances: [] }),
      );
      fixture.detectChanges();

      const paginator = fixture.debugElement.query(By.css('p-paginator'));
      expect(paginator).toBeFalsy();
    });
  });
});
