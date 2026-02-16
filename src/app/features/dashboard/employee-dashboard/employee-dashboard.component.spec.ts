import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { EmployeeDashboardComponent } from './employee-dashboard.component';
import { EmployeeDashboardService } from '@/shared/services/employee-dashboard.service';
import { MessageService } from 'primeng/api';
import { AdvanceSummary, ExpensesSummary, UserBudgetAPIResponse } from '@/shared/types';

describe('EmployeeDashboardComponent', () => {
  let component: EmployeeDashboardComponent;
  let fixture: ComponentFixture<EmployeeDashboardComponent>;
  let dashboardServiceSpy: jasmine.SpyObj<EmployeeDashboardService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const mockAdvanceSummary: AdvanceSummary = {
    approved: 50000,
    reconciled: 30000,
    pendingReconciliation: 10000,
    rejectedAdvance: 5000,
  };

  const mockExpenseSummary: ExpensesSummary = {
    totalExpense: 60000,
    pendingExpense: 15000,
    reimbursedExpense: 45000,
    rejectedExpense: 0,
  };

  const mockBudgetResponse: UserBudgetAPIResponse = {
    budget: 100000,
  };

  beforeEach(async () => {
    dashboardServiceSpy = jasmine.createSpyObj<EmployeeDashboardService>(
      'EmployeeDashboardService',
      ['getAdvanceSummary', 'getExpenseSummary', 'getBudget']
    );
    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

    dashboardServiceSpy.getAdvanceSummary.and.returnValue(of(mockAdvanceSummary));
    dashboardServiceSpy.getExpenseSummary.and.returnValue(of(mockExpenseSummary));
    dashboardServiceSpy.getBudget.and.returnValue(of(mockBudgetResponse));

    await TestBed.configureTestingModule({
      imports: [EmployeeDashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EmployeeDashboardService, useValue: dashboardServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template rendering', () => {
    it('should render the dashboard title', () => {
      const title = fixture.debugElement.query(By.css('.dashboard-title'));
      expect(title).toBeTruthy();
      expect(title.nativeElement.textContent.trim()).toBe('Dashboard');
    });

    it('should render three dashboard sections', () => {
      const sections = fixture.debugElement.queryAll(By.css('.dashboard-section'));
      expect(sections.length).toBe(3);
    });

    it('should render section titles', () => {
      const sectionTitles = fixture.debugElement.queryAll(By.css('.section-title'));
      expect(sectionTitles.length).toBe(3);
      expect(sectionTitles[0].nativeElement.textContent.trim()).toBe('Advance Overview');
      expect(sectionTitles[1].nativeElement.textContent.trim()).toBe('Expense Overview');
      expect(sectionTitles[2].nativeElement.textContent.trim()).toBe('Your Budget');
    });

    it('should render advance summary component', () => {
      const advanceSummary = fixture.debugElement.query(By.css('app-advance-summary'));
      expect(advanceSummary).toBeTruthy();
    });

    it('should render expense summary component', () => {
      const expenseSummary = fixture.debugElement.query(By.css('app-expense-summary'));
      expect(expenseSummary).toBeTruthy();
    });

    it('should render budget summary component', () => {
      const budgetSummary = fixture.debugElement.query(By.css('app-budget-summary'));
      expect(budgetSummary).toBeTruthy();
    });

    it('should have dashboard content wrapper', () => {
      const dashboardContent = fixture.debugElement.query(By.css('.dashboard-content'));
      expect(dashboardContent).toBeTruthy();
    });

    it('should have employee-dashboard class on root div', () => {
      const employeeDashboard = fixture.debugElement.query(By.css('.employee-dashboard'));
      expect(employeeDashboard).toBeTruthy();
    });

    it('should render summary grids for each section', () => {
      const summaryGrids = fixture.debugElement.queryAll(By.css('.summary-grid'));
      expect(summaryGrids.length).toBe(3);
    });
  });
});
