import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ProjectsComponent } from './projects.component';
import { ProjectService } from '@/shared/services/project.service';
import { DepartmentService } from '@/shared/services/department.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Project, Department } from '@/shared/types';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let departmentServiceSpy: jasmine.SpyObj<DepartmentService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const mockDepartments: Department[] = [
    {
      id: 'dept-1',
      name: 'Engineering',
      budget: 500000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'dept-2',
      name: 'Marketing',
      budget: 300000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  const mockProjects: Project[] = [
    {
      id: 'proj-1',
      name: 'Project Alpha',
      description: 'Alpha description',
      budget: 100000,
      startDate: Date.now(),
      endDate: Date.now() + 86400000,
      departmentId: 'dept-1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'proj-2',
      name: 'Project Beta',
      description: 'Beta description',
      budget: 200000,
      startDate: Date.now(),
      endDate: Date.now() + 172800000,
      departmentId: 'dept-2',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'proj-3',
      name: 'Project Gamma',
      description: 'Gamma description',
      budget: 150000,
      startDate: Date.now(),
      endDate: Date.now() + 259200000,
      departmentId: 'dept-1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj<ProjectService>('ProjectService', [
      'getProjects',
      'createProject',
      'updateProject',
    ]);
    departmentServiceSpy = jasmine.createSpyObj<DepartmentService>('DepartmentService', [
      'getDepartments',
      'createDepartment',
      'updateDepartment',
    ]);
    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

    projectServiceSpy.getProjects.and.returnValue(of(mockProjects));
    departmentServiceSpy.getDepartments.and.returnValue(of(mockDepartments));

    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: DepartmentService, useValue: departmentServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        ConfirmationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.projects()).toEqual([]);
    expect(component.departments()).toEqual([]);
    expect(component.loading()).toBeFalse();
    expect(component.submitting()).toBeFalse();
    expect(component.projectFormVisible()).toBeFalse();
    expect(component.editingProject()).toBeNull();
  });

  describe('ngOnInit', () => {
    it('should load initial data on init', () => {
      fixture.detectChanges();

      expect(projectServiceSpy.getProjects).toHaveBeenCalledTimes(1);
      expect(departmentServiceSpy.getDepartments).toHaveBeenCalledTimes(1);
      expect(component.projects()).toEqual(mockProjects);
      expect(component.departments()).toEqual(mockDepartments);
      expect(component.loading()).toBeFalse();
    });

    it('should set loading true while fetching data', () => {
      let loadingDuringFetch = false;
      projectServiceSpy.getProjects.and.callFake(() => {
        loadingDuringFetch = component.loading();
        return of(mockProjects);
      });

      fixture.detectChanges();

      expect(loadingDuringFetch).toBeTrue();
    });

    it('should handle error when loading data fails', () => {
      const error = new Error('Failed to load');
      projectServiceSpy.getProjects.and.returnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load data. Please refresh the page.',
      });
    });

    it('should set loading to false even when error occurs', () => {
      departmentServiceSpy.getDepartments.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
    });
  });

  describe('openAddProjectModal', () => {
    it('should set editingProject to null and open modal', () => {
      component.openAddProjectModal();

      expect(component.editingProject()).toBeNull();
      expect(component.projectFormVisible()).toBeTrue();
    });

    it('should clear previous editing project when opening add modal', () => {
      component.editingProject.set(mockProjects[0]);

      component.openAddProjectModal();

      expect(component.editingProject()).toBeNull();
      expect(component.projectFormVisible()).toBeTrue();
    });
  });

  describe('openEditProjectModal', () => {
    it('should set editingProject with copy of project and open modal', () => {
      const projectToEdit = mockProjects[0];

      component.openEditProjectModal(projectToEdit);

      expect(component.editingProject()).toEqual(projectToEdit);
      expect(component.editingProject()).not.toBe(projectToEdit);
      expect(component.projectFormVisible()).toBeTrue();
    });

    it('should create a new object reference when setting editingProject', () => {
      const projectToEdit = mockProjects[0];

      component.openEditProjectModal(projectToEdit);

      const editingProj = component.editingProject();
      expect(editingProj).toEqual(projectToEdit);
      expect(editingProj).not.toBe(projectToEdit);
    });
  });

  describe('onProjectFormClose', () => {
    it('should close modal and clear editingProject', () => {
      component.projectFormVisible.set(true);
      component.editingProject.set(mockProjects[0]);

      component.onProjectFormClose();

      expect(component.projectFormVisible()).toBeFalse();
      expect(component.editingProject()).toBeNull();
    });
  });

  describe('onProjectSaved', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update existing project in the list when editing', () => {
      const projectToEdit = mockProjects[0];
      component.editingProject.set(projectToEdit);

      const updatedProject: Project = {
        ...projectToEdit,
        name: 'Updated Alpha',
        budget: 150000,
      };

      component.onProjectSaved(updatedProject);

      const projects = component.projects();
      expect(projects[0]).toEqual(updatedProject);
      expect(projects.length).toBe(mockProjects.length);
    });

    it('should add new project at the beginning of the list when creating', () => {
      component.editingProject.set(null);

      const newProject: Project = {
        id: 'proj-4',
        name: 'Project Delta',
        description: 'Delta description',
        budget: 250000,
        startDate: Date.now(),
        endDate: Date.now() + 86400000,
        departmentId: 'dept-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      component.onProjectSaved(newProject);

      const projects = component.projects();
      expect(projects[0]).toEqual(newProject);
      expect(projects.length).toBe(mockProjects.length + 1);
    });

    it('should close modal after saving project', () => {
      const newProject: Project = mockProjects[0];
      component.projectFormVisible.set(true);
      component.editingProject.set(null);

      component.onProjectSaved(newProject);

      expect(component.projectFormVisible()).toBeFalse();
      expect(component.editingProject()).toBeNull();
    });

    it('should not duplicate project if not found in list during edit', () => {
      const nonExistentProject: Project = {
        id: 'non-existent',
        name: 'Non-existent',
        description: 'Does not exist',
        budget: 100000,
        startDate: Date.now(),
        endDate: Date.now(),
        departmentId: 'dept-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      component.editingProject.set(nonExistentProject);

      const updatedProject: Project = {
        ...nonExistentProject,
        name: 'Updated',
      };

      component.onProjectSaved(updatedProject);

      const projects = component.projects();
      expect(projects.length).toBe(mockProjects.length);
    });

    it('should maintain immutability when updating projects list', () => {
      const originalProjects = component.projects();
      const projectToEdit = mockProjects[1];
      component.editingProject.set(projectToEdit);

      const updatedProject: Project = {
        ...projectToEdit,
        name: 'Updated Beta',
      };

      component.onProjectSaved(updatedProject);

      const newProjects = component.projects();
      expect(newProjects).not.toBe(originalProjects);
    });
  });

  describe('getProjectDepartment', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return department name for valid departmentId', () => {
      const result = component.getProjectDepartment(mockProjects[0]);
      expect(result).toBe('Engineering');
    });

    it('should return "-" when project has no departmentId', () => {
      const project: Project = { ...mockProjects[0], departmentId: '' };
      const result = component.getProjectDepartment(project);
      expect(result).toBe('-');
    });

    it('should return "Unknown Department" when department not found', () => {
      const project: Project = { ...mockProjects[0], departmentId: 'non-existent' };
      const result = component.getProjectDepartment(project);
      expect(result).toBe('Unknown Department');
    });
  });

  describe('template rendering', () => {
    it('should display page title', () => {
      fixture.detectChanges();

      const pageTitle = fixture.debugElement.query(By.css('.page-header h1'));
      expect(pageTitle).toBeTruthy();
      expect(pageTitle.nativeElement.textContent.trim()).toBe('Project Management');
    });

    it('should display add project button', () => {
      fixture.detectChanges();

      const addButton = fixture.debugElement.query(By.css('.page-header p-button'));
      expect(addButton).toBeTruthy();
    });

    it('should disable add button when loading', () => {
      fixture.detectChanges();
      component.loading.set(true);
      fixture.detectChanges();

      const addButton = fixture.debugElement.query(By.css('.page-header p-button'));
      expect(addButton.componentInstance.disabled).toBeTrue();
    });

    it('should disable add button when submitting', () => {
      fixture.detectChanges();
      component.submitting.set(true);
      fixture.detectChanges();

      const addButton = fixture.debugElement.query(By.css('.page-header p-button'));
      expect(addButton.componentInstance.disabled).toBeTrue();
    });

    it('should call openAddProjectModal when add button is clicked', () => {
      fixture.detectChanges();
      spyOn(component, 'openAddProjectModal');

      const addButton = fixture.debugElement.query(By.css('.page-header p-button'));
      addButton.triggerEventHandler('onClick', null);

      expect(component.openAddProjectModal).toHaveBeenCalled();
    });

    it('should show initial loading spinner when loading and no projects', () => {
      projectServiceSpy.getProjects.and.returnValue(of([]));
      const testFixture = TestBed.createComponent(ProjectsComponent);
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      testComponent.loading.set(true);
      testComponent.projects.set([]);
      testFixture.detectChanges();

      const spinner = testFixture.debugElement.query(By.css('.initial-loading app-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('should not show initial loading spinner when projects exist', () => {
      component.loading.set(true);
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('.initial-loading'));
      expect(spinner).toBeFalsy();
    });

    it('should display projects table when data is loaded', () => {
      fixture.detectChanges();

      const table = fixture.debugElement.query(By.css('p-table'));
      expect(table).toBeTruthy();
    });

    it('should display correct number of projects in table', () => {
      fixture.detectChanges();

      const table = fixture.debugElement.query(By.css('p-table'));
      expect(table.componentInstance.value.length).toBe(mockProjects.length);
    });

    it('should display project names in table', () => {
      fixture.detectChanges();

      const projectNames = fixture.debugElement.queryAll(By.css('.project-name'));
      expect(projectNames.length).toBe(mockProjects.length);
      expect(projectNames[0].nativeElement.textContent.trim()).toBe('Project Alpha');
    });

    it('should display project budgets with currency format', () => {
      fixture.detectChanges();

      const budgets = fixture.debugElement.queryAll(By.css('.budget'));
      expect(budgets.length).toBe(mockProjects.length);
    });

    it('should display edit button for each project', () => {
      fixture.detectChanges();

      const editButtons = fixture.debugElement.queryAll(By.css('.action-buttons p-button'));
      expect(editButtons.length).toBe(mockProjects.length);
    });

    it('should call openEditProjectModal when edit button is clicked', () => {
      spyOn(component, 'openEditProjectModal');
      fixture.detectChanges();

      const editButton = fixture.debugElement.query(By.css('.action-buttons p-button'));
      editButton.triggerEventHandler('onClick', null);

      expect(component.openEditProjectModal).toHaveBeenCalledWith(mockProjects[0]);
    });

    it('should disable edit buttons when loading', () => {
      fixture.detectChanges();
      component.loading.set(true);
      fixture.detectChanges();

      const editButtons = fixture.debugElement.queryAll(By.css('.action-buttons p-button'));
      editButtons.forEach((button) => {
        expect(button.componentInstance.disabled).toBeTrue();
      });
    });

    it('should disable edit buttons when submitting', () => {
      fixture.detectChanges();
      component.submitting.set(true);
      fixture.detectChanges();

      const editButtons = fixture.debugElement.queryAll(By.css('.action-buttons p-button'));
      editButtons.forEach((button) => {
        expect(button.componentInstance.disabled).toBeTrue();
      });
    });

    it('should display empty state when no projects', () => {
      projectServiceSpy.getProjects.and.returnValue(of([]));
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyState).toBeTruthy();
      expect(emptyState.nativeElement.textContent).toContain('No Projects Yet');
    });

    it('should render project form modal component', () => {
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('app-project-form-modal'));
      expect(modal).toBeTruthy();
    });

    it('should bind visible property to modal', () => {
      component.projectFormVisible.set(true);
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('app-project-form-modal'));
      expect(modal.componentInstance.visible()).toBeTrue();
    });

    it('should pass editingProject to modal', () => {
      const projectToEdit = mockProjects[0];
      component.editingProject.set(projectToEdit);
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('app-project-form-modal'));
      expect(modal.componentInstance.editingProject()).toEqual(projectToEdit);
    });

    it('should pass departments to modal', () => {
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('app-project-form-modal'));
      expect(modal.componentInstance.departments()).toEqual(mockDepartments);
    });
  });
});
