import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError, NEVER } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ProjectsSummaryComponent } from './projects-summary.component';
import { ProjectService } from '@/shared/services/project.service';
import { MessageService } from 'primeng/api';
import { ProjectsSummary } from '@/shared/types';

describe('ProjectsSummaryComponent', () => {
  let component: ProjectsSummaryComponent;
  let fixture: ComponentFixture<ProjectsSummaryComponent>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const mockSummary: ProjectsSummary = {
    totalProjects: 8,
    activeProjects: 5,
    totalBudget: 5000000,
    averageBudget: 625000,
  };

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj<ProjectService>('ProjectService', [
      'getProjectsSummary',
    ]);
    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

    projectServiceSpy.getProjectsSummary.and.returnValue(of(mockSummary));

    await TestBed.configureTestingModule({
      imports: [ProjectsSummaryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default summary and loading state true', () => {
    expect(component.summary()).toEqual({
      totalProjects: 0,
      activeProjects: 0,
      totalBudget: 0,
      averageBudget: 0,
    });
    expect(component.loading()).toBeTrue();
  });

  describe('ngOnInit', () => {
    it('should fetch projects summary on init', () => {
      fixture.detectChanges();

      expect(projectServiceSpy.getProjectsSummary).toHaveBeenCalledTimes(1);
      expect(component.summary()).toEqual(mockSummary);
      expect(component.loading()).toBeFalse();
    });

    it('should update summary signal with fetched data', () => {
      const customSummary: ProjectsSummary = {
        totalProjects: 12,
        activeProjects: 8,
        totalBudget: 8000000,
        averageBudget: 666666,
      };
      projectServiceSpy.getProjectsSummary.and.returnValue(of(customSummary));

      fixture.detectChanges();

      expect(component.summary()).toEqual(customSummary);
    });

    it('should set loading to false after successful fetch', () => {
      expect(component.loading()).toBeTrue();

      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
    });

    it('should handle error when fetching summary fails', () => {
      const error = new Error('Failed to fetch projects summary');
      projectServiceSpy.getProjectsSummary.and.returnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: error.message,
      });
    });

    it('should set loading to false even when error occurs', () => {
      projectServiceSpy.getProjectsSummary.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
    });
  });

  describe('template rendering', () => {
    it('should display loading skeletons when loading is true', () => {
      projectServiceSpy.getProjectsSummary.and.returnValue(NEVER);
      fixture.detectChanges();

      const skeletons = fixture.debugElement.queryAll(By.css('app-summary-card-skeleton'));
      expect(skeletons.length).toBe(4);
    });

    it('should render skeleton with correct variants', () => {
      projectServiceSpy.getProjectsSummary.and.returnValue(NEVER);
      fixture.detectChanges();

      const skeletons = fixture.debugElement.queryAll(By.css('app-summary-card-skeleton'));
      expect(skeletons[0].attributes['ng-reflect-variant']).toBe('primary');
      expect(skeletons[1].attributes['ng-reflect-variant']).toBe('success');
      expect(skeletons[2].attributes['ng-reflect-variant']).toBe('warning');
      expect(skeletons[3].attributes['ng-reflect-variant']).toBe('secondary');
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

    it('should display total projects count', () => {
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Total Projects');
      expect(hostText).toContain(mockSummary.totalProjects.toString());
    });

    it('should display active projects count', () => {
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Active Projects');
      expect(hostText).toContain(mockSummary.activeProjects.toString());
    });

    it('should display total budget with currency format', () => {
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Total Budget');
      expect(hostText).toContain('₹5,000,000');
    });

    it('should display average budget with currency format', () => {
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Average Budget');
      expect(hostText).toContain('₹625,000');
    });

    it('should render summary cards with correct types', () => {
      fixture.detectChanges();

      const summaryCards = fixture.nativeElement.querySelectorAll('[card="summary"]');
      expect(summaryCards[0].getAttribute('type')).toBe('primary');
      expect(summaryCards[1].getAttribute('type')).toBe('success');
      expect(summaryCards[2].getAttribute('type')).toBe('warning');
      expect(summaryCards[3].getAttribute('type')).toBe('secondary');
    });

    it('should render icons for each summary card', () => {
      fixture.detectChanges();

      const icons = fixture.nativeElement.querySelectorAll('.summary-icon i');
      expect(icons.length).toBe(4);
      expect(icons[0].className).toContain('pi-briefcase');
      expect(icons[1].className).toContain('pi-play-circle');
      expect(icons[2].className).toContain('pi-indian-rupee');
      expect(icons[3].className).toContain('pi-chart-line');
    });

    it('should display summary data within summary-data class', () => {
      fixture.detectChanges();

      const summaryData = fixture.nativeElement.querySelectorAll('.summary-data');
      expect(summaryData.length).toBe(4);
      expect(summaryData[0].textContent.trim()).toBe(mockSummary.totalProjects.toString());
      expect(summaryData[1].textContent.trim()).toBe(mockSummary.activeProjects.toString());
    });
  });
});
