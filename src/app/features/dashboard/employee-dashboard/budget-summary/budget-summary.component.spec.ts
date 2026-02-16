import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError, NEVER } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BudgetSummaryComponent } from './budget-summary.component';
import { EmployeeDashboardService } from '@/shared/services/employee-dashboard.service';
import { UserBudgetAPIResponse, ExpensesSummary } from '@/shared/types';

describe('BudgetSummaryComponent', () => {
  let component: BudgetSummaryComponent;
  let fixture: ComponentFixture<BudgetSummaryComponent>;
  let dashboardServiceSpy: jasmine.SpyObj<EmployeeDashboardService>;

  const mockBudgetResponse: UserBudgetAPIResponse = {
    budget: 100000,
  };

  const mockExpenseSummary: ExpensesSummary = {
    totalExpense: 60000,
    pendingExpense: 15000,
    reimbursedExpense: 45000,
    rejectedExpense: 0,
  };

  beforeEach(async () => {
    dashboardServiceSpy = jasmine.createSpyObj<EmployeeDashboardService>(
      'EmployeeDashboardService',
      ['getBudget', 'getExpenseSummary']
    );

    dashboardServiceSpy.getBudget.and.returnValue(of(mockBudgetResponse));
    dashboardServiceSpy.getExpenseSummary.and.returnValue(of(mockExpenseSummary));

    await TestBed.configureTestingModule({
      imports: [BudgetSummaryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EmployeeDashboardService, useValue: dashboardServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default budget summary and loading state', () => {
    expect(component.budgetSummary()).toEqual({
      allocatedBudget: 0,
      usedBudget: 0,
      remainingBudget: 0,
      usagePercentage: 0,
    });
    expect(component.loading()).toBeTrue();
  });

  describe('ngOnInit', () => {
    it('should fetch budget and expense summary on init', () => {
      fixture.detectChanges();

      expect(dashboardServiceSpy.getBudget).toHaveBeenCalledTimes(1);
      expect(dashboardServiceSpy.getExpenseSummary).toHaveBeenCalledTimes(1);
    });

    it('should calculate budget summary correctly', () => {
      fixture.detectChanges();

      expect(component.budgetSummary()).toEqual({
        allocatedBudget: 100000,
        usedBudget: 60000,
        remainingBudget: 40000,
        usagePercentage: 60,
      });
      expect(component.loading()).toBeFalse();
    });

    it('should set loading to true when starting to fetch data', () => {
      let loadingDuringFetch = false;
      dashboardServiceSpy.getBudget.and.callFake(() => {
        loadingDuringFetch = component.loading();
        return of(mockBudgetResponse);
      });

      component.ngOnInit();

      expect(loadingDuringFetch).toBeTrue();
    });

    it('should handle zero allocated budget', () => {
      dashboardServiceSpy.getBudget.and.returnValue(of({ budget: 0 }));

      fixture.detectChanges();

      expect(component.budgetSummary()).toEqual({
        allocatedBudget: 0,
        usedBudget: 60000,
        remainingBudget: 0,
        usagePercentage: 0,
      });
    });

    it('should calculate remaining budget as zero when used exceeds allocated', () => {
      dashboardServiceSpy.getExpenseSummary.and.returnValue(
        of({ ...mockExpenseSummary, totalExpense: 120000 })
      );

      fixture.detectChanges();

      expect(component.budgetSummary().remainingBudget).toBe(0);
      expect(component.budgetSummary().usagePercentage).toBe(100);
    });

    it('should cap usage percentage at 100%', () => {
      dashboardServiceSpy.getExpenseSummary.and.returnValue(
        of({ ...mockExpenseSummary, totalExpense: 150000 })
      );

      fixture.detectChanges();

      expect(component.budgetSummary().usagePercentage).toBe(100);
    });

    it('should round usage percentage to nearest integer', () => {
      dashboardServiceSpy.getBudget.and.returnValue(of({ budget: 100000 }));
      dashboardServiceSpy.getExpenseSummary.and.returnValue(
        of({ ...mockExpenseSummary, totalExpense: 66666 })
      );

      fixture.detectChanges();

      expect(component.budgetSummary().usagePercentage).toBe(67);
    });

    it('should handle null or undefined budget gracefully', () => {
      dashboardServiceSpy.getBudget.and.returnValue(of({ budget: null as any }));

      fixture.detectChanges();

      expect(component.budgetSummary().allocatedBudget).toBe(0);
    });

    it('should handle null or undefined total expense gracefully', () => {
      dashboardServiceSpy.getExpenseSummary.and.returnValue(
        of({ ...mockExpenseSummary, totalExpense: null as any })
      );

      fixture.detectChanges();

      expect(component.budgetSummary().usedBudget).toBe(0);
    });

    it('should handle error when fetching budget fails', () => {
      dashboardServiceSpy.getBudget.and.returnValue(
        throwError(() => new Error('Failed to fetch budget'))
      );

      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
      expect(dashboardServiceSpy.getExpenseSummary).not.toHaveBeenCalled();
    });

    it('should handle error when fetching expense summary fails', () => {
      dashboardServiceSpy.getExpenseSummary.and.returnValue(
        throwError(() => new Error('Failed to fetch expenses'))
      );

      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
    });

    it('should set loading to false even when budget fetch fails', () => {
      dashboardServiceSpy.getBudget.and.returnValue(throwError(() => new Error('Error')));

      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
    });

    it('should set loading to false even when expense fetch fails', () => {
      dashboardServiceSpy.getExpenseSummary.and.returnValue(throwError(() => new Error('Error')));

      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
    });

    it('should calculate with different budget values', () => {
      dashboardServiceSpy.getBudget.and.returnValue(of({ budget: 200000 }));
      dashboardServiceSpy.getExpenseSummary.and.returnValue(
        of({ ...mockExpenseSummary, totalExpense: 50000 })
      );

      fixture.detectChanges();

      expect(component.budgetSummary()).toEqual({
        allocatedBudget: 200000,
        usedBudget: 50000,
        remainingBudget: 150000,
        usagePercentage: 25,
      });
    });
  });

  describe('template rendering', () => {
    it('should display loading skeletons when loading is true', () => {
      dashboardServiceSpy.getBudget.and.returnValue(NEVER);
      fixture.detectChanges();

      const skeletons = fixture.debugElement.queryAll(By.css('app-summary-card-skeleton'));
      expect(skeletons.length).toBe(4);
    });

    it('should render skeleton with correct variants', () => {
      dashboardServiceSpy.getBudget.and.returnValue(NEVER);
      fixture.detectChanges();

      const skeletons = fixture.debugElement.queryAll(By.css('app-summary-card-skeleton'));
      expect(skeletons[0].attributes['ng-reflect-variant']).toBe('primary');
      expect(skeletons[1].attributes['ng-reflect-variant']).toBe('secondary');
      expect(skeletons[2].attributes['ng-reflect-variant']).toBe('success');
      expect(skeletons[3].attributes['ng-reflect-variant']).toBe('warning');
    });

    it('should not display skeletons when loading is false', () => {
      fixture.detectChanges();

      const skeletons = fixture.debugElement.queryAll(By.css('app-summary-card-skeleton'));
      expect(skeletons.length).toBe(0);
    });

    it('should display summary cards when data is loaded', () => {
      fixture.detectChanges();

      const summaryCards = fixture.nativeElement.querySelectorAll('[card="summary"]');
      expect(summaryCards.length).toBe(4);
    });

    it('should display allocated budget with currency format', () => {
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Allocated Budget');
      expect(hostText).toContain('₹100,000');
    });

    it('should display used budget with currency format', () => {
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Used Budget');
      expect(hostText).toContain('₹60,000');
    });

    it('should display remaining budget with currency format', () => {
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Remaining Budget');
      expect(hostText).toContain('₹40,000');
    });

    it('should display usage percentage', () => {
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Usage');
      expect(hostText).toContain('60%');
    });

    it('should render summary cards with correct types', () => {
      fixture.detectChanges();

      const summaryCards = fixture.nativeElement.querySelectorAll('[card="summary"]');
      expect(summaryCards[0].getAttribute('type')).toBe('primary');
      expect(summaryCards[1].getAttribute('type')).toBe('secondary');
      expect(summaryCards[2].getAttribute('type')).toBe('success');
      expect(summaryCards[3].getAttribute('type')).toBe('warning');
    });

    it('should render icons for each summary card', () => {
      fixture.detectChanges();

      const icons = fixture.nativeElement.querySelectorAll('.summary-icon i');
      expect(icons.length).toBe(4);
      expect(icons[0].className).toContain('pi-wallet');
      expect(icons[1].className).toContain('pi-indian-rupee');
      expect(icons[2].className).toContain('pi-money-bill');
      expect(icons[3].className).toContain('pi-percentage');
    });

    it('should display summary data within summary-data class', () => {
      fixture.detectChanges();

      const summaryData = fixture.nativeElement.querySelectorAll('.summary-data');
      expect(summaryData.length).toBe(4);
      expect(summaryData[3].textContent.trim()).toBe('60%');
    });
  });
});
