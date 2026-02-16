import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { AdminDashboardComponent } from './admin-dashboard.component';
import { DepartmentService } from '@/shared/services/department.service';
import { ProjectService } from '@/shared/services/project.service';
import { UserService } from '@/shared/services/user.service';
import { MessageService } from 'primeng/api';
import { DepartmentsSummary, ProjectsSummary, UsersSummary } from '@/shared/types';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let departmentServiceSpy: jasmine.SpyObj<DepartmentService>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const mockDepartmentsSummary: DepartmentsSummary = {
    totalDepartments: 5,
    totalBudget: 1000000,
    averageBudget: 200000,
  };

  const mockProjectsSummary: ProjectsSummary = {
    totalProjects: 8,
    activeProjects: 5,
    totalBudget: 5000000,
    averageBudget: 625000,
  };

  const mockUsersSummary: UsersSummary = {
    totalUsers: 25,
    adminUsers: 3,
    employeeUsers: 22,
  };

  beforeEach(async () => {
    departmentServiceSpy = jasmine.createSpyObj<DepartmentService>('DepartmentService', [
      'getDepartmentsSummary',
    ]);
    projectServiceSpy = jasmine.createSpyObj<ProjectService>('ProjectService', [
      'getProjectsSummary',
    ]);
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', ['getUsersSummary']);
    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

    departmentServiceSpy.getDepartmentsSummary.and.returnValue(of(mockDepartmentsSummary));
    projectServiceSpy.getProjectsSummary.and.returnValue(of(mockProjectsSummary));
    userServiceSpy.getUsersSummary.and.returnValue(of(mockUsersSummary));

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DepartmentService, useValue: departmentServiceSpy },
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template rendering', () => {
    it('should render three dashboard sections', () => {
      const sections = fixture.debugElement.queryAll(By.css('.dashboard-section'));
      expect(sections.length).toBe(3);
    });

    it('should render section titles', () => {
      const sectionTitles = fixture.debugElement.queryAll(By.css('.section-title'));
      expect(sectionTitles.length).toBe(3);
      expect(sectionTitles[0].nativeElement.textContent.trim()).toBe('Users Overview');
      expect(sectionTitles[1].nativeElement.textContent.trim()).toBe('Departments Overview');
      expect(sectionTitles[2].nativeElement.textContent.trim()).toBe('Projects Overview');
    });

    it('should render users summary component', () => {
      const usersSummary = fixture.debugElement.query(By.css('app-users-summary'));
      expect(usersSummary).toBeTruthy();
    });

    it('should render departments summary component', () => {
      const departmentsSummary = fixture.debugElement.query(By.css('app-departments-summary'));
      expect(departmentsSummary).toBeTruthy();
    });

    it('should render projects summary component', () => {
      const projectsSummary = fixture.debugElement.query(By.css('app-projects-summary'));
      expect(projectsSummary).toBeTruthy();
    });

    it('should have admin-dashboard class on root div', () => {
      const adminDashboard = fixture.debugElement.query(By.css('.admin-dashboard'));
      expect(adminDashboard).toBeTruthy();
    });

    it('should render sections in correct order', () => {
      const sections = fixture.debugElement.queryAll(By.css('.dashboard-section'));
      const firstSection = sections[0].nativeElement;
      const secondSection = sections[1].nativeElement;
      const thirdSection = sections[2].nativeElement;

      expect(firstSection.querySelector('app-users-summary')).toBeTruthy();
      expect(secondSection.querySelector('app-departments-summary')).toBeTruthy();
      expect(thirdSection.querySelector('app-projects-summary')).toBeTruthy();
    });
  });
});
