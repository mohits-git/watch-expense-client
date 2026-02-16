import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';

import { ExpenseSummaryComponent } from './expense-summary.component';
import { EmployeeDashboardService } from '@/shared/services/employee-dashboard.service';
import { ExpensesSummary } from '@/shared/types';

describe('ExpenseSummaryComponent', () => {
  let component: ExpenseSummaryComponent;
  let fixture: ComponentFixture<ExpenseSummaryComponent>;
  let dashboardServiceSpy: jasmine.SpyObj<EmployeeDashboardService>;

  const mockSummary: ExpensesSummary = {
    totalExpense: 22000,
    reimbursedExpense: 16000,
    pendingExpense: 5000,
    rejectedExpense: 1000,
  };

  beforeEach(async () => {
    dashboardServiceSpy = jasmine.createSpyObj<EmployeeDashboardService>(
      'EmployeeDashboardService',
      ['getExpenseSummary'],
    );
    dashboardServiceSpy.getExpenseSummary.and.returnValue(of(mockSummary));

    await TestBed.configureTestingModule({
      imports: [ExpenseSummaryComponent],
      providers: [
        {
          provide: EmployeeDashboardService,
          useValue: dashboardServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show 4 skeleton cards while summary is loading', () => {
    const response$ = new Subject<ExpensesSummary>();
    dashboardServiceSpy.getExpenseSummary.and.returnValue(response$.asObservable());

    fixture.detectChanges();

    const skeletons = fixture.debugElement.queryAll(By.css('app-summary-card-skeleton'));
    expect(component.loading()).toBeTrue();
    expect(skeletons.length).toBe(4);
  });

  it('should fetch expense summary on init and render summary cards', () => {
    fixture.detectChanges();

    expect(dashboardServiceSpy.getExpenseSummary).toHaveBeenCalledTimes(1);
    expect(component.loading()).toBeFalse();
    expect(component.summary()).toEqual(mockSummary);

    const summaryCards = fixture.debugElement.queryAll(By.css('div[card="summary"]'));
    expect(summaryCards.length).toBe(4);

    const titles = fixture.debugElement
      .queryAll(By.css('.summary-title'))
      .map((item) => (item.nativeElement.textContent as string).trim());
    expect(titles).toEqual([
      'Total Expense',
      'Reimbursed Expense',
      'Pending Expense Requests',
      'Rejected Expense Requests',
    ]);
  });

  it('should stop loading and keep default summary on service error', () => {
    dashboardServiceSpy.getExpenseSummary.and.returnValue(
      throwError(() => new Error('fetch failed')),
    );

    fixture.detectChanges();

    expect(dashboardServiceSpy.getExpenseSummary).toHaveBeenCalledTimes(1);
    expect(component.loading()).toBeFalse();
    expect(component.summary()).toEqual({
      totalExpense: 0,
      pendingExpense: 0,
      reimbursedExpense: 0,
      rejectedExpense: 0,
    });
  });
});
