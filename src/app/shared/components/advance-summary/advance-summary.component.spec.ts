import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';

import { AdvanceSummaryComponent } from './advance-summary.component';
import { EmployeeDashboardService } from '@/shared/services/employee-dashboard.service';
import { AdvanceSummary } from '@/shared/types';

describe('AdvanceSummaryComponent', () => {
  let component: AdvanceSummaryComponent;
  let fixture: ComponentFixture<AdvanceSummaryComponent>;
  let dashboardServiceSpy: jasmine.SpyObj<EmployeeDashboardService>;

  const mockSummary: AdvanceSummary = {
    approved: 10000,
    reconciled: 6000,
    pendingReconciliation: 2500,
    rejectedAdvance: 300,
  };

  beforeEach(async () => {
    dashboardServiceSpy = jasmine.createSpyObj<EmployeeDashboardService>(
      'EmployeeDashboardService',
      ['getAdvanceSummary'],
    );
    dashboardServiceSpy.getAdvanceSummary.and.returnValue(of(mockSummary));

    await TestBed.configureTestingModule({
      imports: [AdvanceSummaryComponent],
      providers: [
        {
          provide: EmployeeDashboardService,
          useValue: dashboardServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvanceSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show 4 skeleton cards while summary is loading', () => {
    const response$ = new Subject<AdvanceSummary>();
    dashboardServiceSpy.getAdvanceSummary.and.returnValue(response$.asObservable());

    fixture.detectChanges();

    const skeletons = fixture.debugElement.queryAll(By.css('app-summary-card-skeleton'));
    expect(component.loading()).toBeTrue();
    expect(skeletons.length).toBe(4);
  });

  it('should fetch summary on init and render computed values', () => {
    fixture.detectChanges();

    expect(dashboardServiceSpy.getAdvanceSummary).toHaveBeenCalledTimes(1);
    expect(component.loading()).toBeFalse();
    expect(component.balance()).toBe(4000);
    expect(component.toReconcile()).toBe(4000);
    expect(component.pendingReconciliation()).toBe(2500);
    expect(component.rejectedAdvance()).toBe(300);

    const summaryCards = fixture.debugElement.queryAll(By.css('div[card="summary"]'));
    expect(summaryCards.length).toBe(4);

    const titles = fixture.debugElement
      .queryAll(By.css('.summary-title'))
      .map((item) => (item.nativeElement.textContent as string).trim());
    expect(titles).toEqual([
      'Balance',
      'To Reconcile',
      'Pending Reconciliation',
      'Rejected Advance Requests',
    ]);
  });

  it('should stop loading and keep defaults when service errors', () => {
    dashboardServiceSpy.getAdvanceSummary.and.returnValue(
      throwError(() => new Error('fetch failed')),
    );

    fixture.detectChanges();

    expect(dashboardServiceSpy.getAdvanceSummary).toHaveBeenCalledTimes(1);
    expect(component.loading()).toBeFalse();
    expect(component.balance()).toBe(0);
    expect(component.toReconcile()).toBe(0);
    expect(component.pendingReconciliation()).toBe(0);
    expect(component.rejectedAdvance()).toBe(0);
  });
});
