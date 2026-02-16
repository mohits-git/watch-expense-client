import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError, NEVER } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DepartmentsSummaryComponent } from './departments-summary.component';
import { DepartmentService } from '@/shared/services/department.service';
import { MessageService } from 'primeng/api';
import { DepartmentsSummary } from '@/shared/types';

describe('DepartmentsSummaryComponent', () => {
  let component: DepartmentsSummaryComponent;
  let fixture: ComponentFixture<DepartmentsSummaryComponent>;
  let departmentServiceSpy: jasmine.SpyObj<DepartmentService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const mockSummary: DepartmentsSummary = {
    totalDepartments: 5,
    totalBudget: 1000000,
    averageBudget: 200000,
  };

  beforeEach(async () => {
    departmentServiceSpy = jasmine.createSpyObj<DepartmentService>('DepartmentService', [
      'getDepartmentsSummary',
    ]);
    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

    departmentServiceSpy.getDepartmentsSummary.and.returnValue(of(mockSummary));

    await TestBed.configureTestingModule({
      imports: [DepartmentsSummaryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DepartmentService, useValue: departmentServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentsSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default summary and loading state true', () => {
    expect(component.summary()).toEqual({
      totalDepartments: 0,
      totalBudget: 0,
      averageBudget: 0,
    });
    expect(component.loading()).toBeTrue();
  });

  describe('ngOnInit', () => {
    it('should fetch departments summary on init', () => {
      fixture.detectChanges();

      expect(departmentServiceSpy.getDepartmentsSummary).toHaveBeenCalledTimes(1);
      expect(component.summary()).toEqual(mockSummary);
      expect(component.loading()).toBeFalse();
    });

    it('should update summary signal with fetched data', () => {
      const customSummary: DepartmentsSummary = {
        totalDepartments: 10,
        totalBudget: 2000000,
        averageBudget: 200000,
      };
      departmentServiceSpy.getDepartmentsSummary.and.returnValue(of(customSummary));

      fixture.detectChanges();

      expect(component.summary()).toEqual(customSummary);
    });

    it('should set loading to false after successful fetch', () => {
      expect(component.loading()).toBeTrue();

      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
    });

    it('should handle error when fetching summary fails', () => {
      const error = new Error('Failed to fetch summary');
      departmentServiceSpy.getDepartmentsSummary.and.returnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: error.message,
      });
    });

    it('should set loading to false even when error occurs', () => {
      departmentServiceSpy.getDepartmentsSummary.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
    });
  });

  describe('template rendering', () => {
    it('should display loading skeletons when loading is true', () => {
      departmentServiceSpy.getDepartmentsSummary.and.returnValue(NEVER);
      fixture.detectChanges();

      const skeletons = fixture.debugElement.queryAll(By.css('app-summary-card-skeleton'));
      expect(skeletons.length).toBe(3);
    });

    it('should render skeleton with correct variants', () => {
      departmentServiceSpy.getDepartmentsSummary.and.returnValue(NEVER);
      fixture.detectChanges();

      const skeletons = fixture.debugElement.queryAll(By.css('app-summary-card-skeleton'));
      expect(skeletons[0].attributes['ng-reflect-variant']).toBe('primary');
      expect(skeletons[1].attributes['ng-reflect-variant']).toBe('success');
      expect(skeletons[2].attributes['ng-reflect-variant']).toBe('secondary');
    });

    it('should not display skeletons when loading is false', () => {
      fixture.detectChanges();

      const skeletons = fixture.debugElement.queryAll(By.css('app-summary-card-skeleton'));
      expect(skeletons.length).toBe(0);
    });

    it('should display summary cards when data is loaded', () => {
      fixture.detectChanges();

      const summaryCards = fixture.nativeElement.querySelectorAll('[card="summary"]');
      expect(summaryCards.length).toBe(3);
    });

    it('should display total departments count', () => {
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Total Departments');
      expect(hostText).toContain(mockSummary.totalDepartments.toString());
    });

    it('should display total budget with currency format', () => {
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Total Budget');
      expect(hostText).toContain('₹1,000,000');
    });

    it('should display average budget with currency format', () => {
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Average Budget');
      expect(hostText).toContain('₹200,000');
    });

    it('should render summary cards with correct types', () => {
      fixture.detectChanges();

      const summaryCards = fixture.nativeElement.querySelectorAll('[card="summary"]');
      expect(summaryCards[0].getAttribute('type')).toBe('primary');
      expect(summaryCards[1].getAttribute('type')).toBe('success');
      expect(summaryCards[2].getAttribute('type')).toBe('secondary');
    });

    it('should render icons for each summary card', () => {
      fixture.detectChanges();

      const icons = fixture.nativeElement.querySelectorAll('.summary-icon i');
      expect(icons.length).toBe(3);
      expect(icons[0].className).toContain('pi-building');
      expect(icons[1].className).toContain('pi-indian-rupee');
      expect(icons[2].className).toContain('pi-chart-bar');
    });

    it('should display summary data within summary-data class', () => {
      fixture.detectChanges();

      const summaryData = fixture.nativeElement.querySelectorAll('.summary-data');
      expect(summaryData.length).toBe(3);
      expect(summaryData[0].textContent.trim()).toBe(mockSummary.totalDepartments.toString());
    });
  });
});
