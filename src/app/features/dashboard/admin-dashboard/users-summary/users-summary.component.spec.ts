import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError, NEVER } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { UsersSummaryComponent } from './users-summary.component';
import { UserService } from '@/shared/services/user.service';
import { MessageService } from 'primeng/api';
import { UsersSummary } from '@/shared/types';

describe('UsersSummaryComponent', () => {
  let component: UsersSummaryComponent;
  let fixture: ComponentFixture<UsersSummaryComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const mockSummary: UsersSummary = {
    totalUsers: 25,
    adminUsers: 3,
    employeeUsers: 22,
  };

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', ['getUsersSummary']);
    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

    userServiceSpy.getUsersSummary.and.returnValue(of(mockSummary));

    await TestBed.configureTestingModule({
      imports: [UsersSummaryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default summary and loading state true', () => {
    expect(component.summary()).toEqual({
      totalUsers: 0,
      adminUsers: 0,
      employeeUsers: 0,
    });
    expect(component.loading()).toBeTrue();
  });

  describe('ngOnInit', () => {
    it('should fetch users summary on init', () => {
      fixture.detectChanges();

      expect(userServiceSpy.getUsersSummary).toHaveBeenCalledTimes(1);
      expect(component.summary()).toEqual(mockSummary);
      expect(component.loading()).toBeFalse();
    });

    it('should update summary signal with fetched data', () => {
      const customSummary: UsersSummary = {
        totalUsers: 50,
        adminUsers: 5,
        employeeUsers: 45,
      };
      userServiceSpy.getUsersSummary.and.returnValue(of(customSummary));

      fixture.detectChanges();

      expect(component.summary()).toEqual(customSummary);
    });

    it('should set loading to false after successful fetch', () => {
      expect(component.loading()).toBeTrue();

      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
    });

    it('should handle error when fetching summary fails', () => {
      const error = new Error('Failed to fetch users summary');
      userServiceSpy.getUsersSummary.and.returnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: error.message,
      });
    });

    it('should set loading to false even when error occurs', () => {
      userServiceSpy.getUsersSummary.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
    });
  });

  describe('template rendering', () => {
    it('should display loading skeletons when loading is true', () => {
      userServiceSpy.getUsersSummary.and.returnValue(NEVER);
      fixture.detectChanges();

      const skeletons = fixture.debugElement.queryAll(By.css('app-summary-card-skeleton'));
      expect(skeletons.length).toBe(3);
    });

    it('should render skeleton with correct variants', () => {
      userServiceSpy.getUsersSummary.and.returnValue(NEVER);
      fixture.detectChanges();

      const skeletons = fixture.debugElement.queryAll(By.css('app-summary-card-skeleton'));
      expect(skeletons[0].attributes['ng-reflect-variant']).toBe('primary');
      expect(skeletons[1].attributes['ng-reflect-variant']).toBe('secondary');
      expect(skeletons[2].attributes['ng-reflect-variant']).toBe('purple');
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

    it('should display total users count', () => {
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Total Users');
      expect(hostText).toContain(mockSummary.totalUsers.toString());
    });

    it('should display admin users count', () => {
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Admins');
      expect(hostText).toContain(mockSummary.adminUsers.toString());
    });

    it('should display employee users count', () => {
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Employees');
      expect(hostText).toContain(mockSummary.employeeUsers.toString());
    });

    it('should render summary cards with correct types', () => {
      fixture.detectChanges();

      const summaryCards = fixture.nativeElement.querySelectorAll('[card="summary"]');
      expect(summaryCards[0].getAttribute('type')).toBe('primary');
      expect(summaryCards[1].getAttribute('type')).toBe('secondary');
      expect(summaryCards[2].getAttribute('type')).toBe('purple');
    });

    it('should render icons for each summary card', () => {
      fixture.detectChanges();

      const icons = fixture.nativeElement.querySelectorAll('.summary-icon i');
      expect(icons.length).toBe(3);
      expect(icons[0].className).toContain('pi-users');
      expect(icons[1].className).toContain('pi-shield');
      expect(icons[2].className).toContain('pi-user');
    });

    it('should display summary data within summary-data class', () => {
      fixture.detectChanges();

      const summaryData = fixture.nativeElement.querySelectorAll('.summary-data');
      expect(summaryData.length).toBe(3);
      expect(summaryData[0].textContent.trim()).toBe(mockSummary.totalUsers.toString());
      expect(summaryData[1].textContent.trim()).toBe(mockSummary.adminUsers.toString());
      expect(summaryData[2].textContent.trim()).toBe(mockSummary.employeeUsers.toString());
    });
  });
});
