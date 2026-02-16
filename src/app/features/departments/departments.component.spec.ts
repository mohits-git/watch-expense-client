import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { DepartmentsComponent } from './departments.component';
import { DepartmentService } from '@/shared/services/department.service';
import { MessageService } from 'primeng/api';
import { Department } from '@/shared/types';

describe('DepartmentsComponent', () => {
  let component: DepartmentsComponent;
  let fixture: ComponentFixture<DepartmentsComponent>;
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
    {
      id: 'dept-3',
      name: 'Sales',
      budget: 400000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  beforeEach(async () => {
    departmentServiceSpy = jasmine.createSpyObj<DepartmentService>('DepartmentService', [
      'getDepartments',
      'createDepartment',
      'updateDepartment',
    ]);
    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

    departmentServiceSpy.getDepartments.and.returnValue(of(mockDepartments));

    await TestBed.configureTestingModule({
      imports: [DepartmentsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: DepartmentService, useValue: departmentServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.departments()).toEqual([]);
    expect(component.loading()).toBeFalse();
    expect(component.submitting()).toBeFalse();
    expect(component.departmentFormVisible()).toBeFalse();
    expect(component.editingDepartment()).toBeNull();
  });

  describe('ngOnInit', () => {
    it('should load initial data on init', () => {
      fixture.detectChanges();

      expect(departmentServiceSpy.getDepartments).toHaveBeenCalledTimes(1);
      expect(component.departments()).toEqual(mockDepartments);
      expect(component.loading()).toBeFalse();
    });

    it('should set loading true while fetching data', () => {
      let loadingDuringFetch = false;
      departmentServiceSpy.getDepartments.and.callFake(() => {
        loadingDuringFetch = component.loading();
        return of(mockDepartments);
      });

      fixture.detectChanges();

      expect(loadingDuringFetch).toBeTrue();
    });

    it('should handle error when loading departments fails', () => {
      const error = new Error('Failed to load departments');
      departmentServiceSpy.getDepartments.and.returnValue(throwError(() => error));

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

  describe('openAddDepartmentModal', () => {
    it('should set editingDepartment to null and open modal', () => {
      component.openAddDepartmentModal();

      expect(component.editingDepartment()).toBeNull();
      expect(component.departmentFormVisible()).toBeTrue();
    });

    it('should clear previous editing department when opening add modal', () => {
      component.editingDepartment.set(mockDepartments[0]);

      component.openAddDepartmentModal();

      expect(component.editingDepartment()).toBeNull();
      expect(component.departmentFormVisible()).toBeTrue();
    });
  });

  describe('openEditDepartmentModal', () => {
    it('should set editingDepartment with copy of department and open modal', () => {
      const departmentToEdit = mockDepartments[0];

      component.openEditDepartmentModal(departmentToEdit);

      expect(component.editingDepartment()).toEqual(departmentToEdit);
      expect(component.editingDepartment()).not.toBe(departmentToEdit);
      expect(component.departmentFormVisible()).toBeTrue();
    });

    it('should create a new object reference when setting editingDepartment', () => {
      const departmentToEdit = mockDepartments[0];

      component.openEditDepartmentModal(departmentToEdit);

      const editingDept = component.editingDepartment();
      expect(editingDept).toEqual(departmentToEdit);
      expect(editingDept).not.toBe(departmentToEdit);
    });
  });

  describe('onDepartmentFormClose', () => {
    it('should close modal and clear editingDepartment', () => {
      component.departmentFormVisible.set(true);
      component.editingDepartment.set(mockDepartments[0]);

      component.onDepartmentFormClose();

      expect(component.departmentFormVisible()).toBeFalse();
      expect(component.editingDepartment()).toBeNull();
    });
  });

  describe('onDepartmentSaved', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update existing department in the list when editing', () => {
      const departmentToEdit = mockDepartments[0];
      component.editingDepartment.set(departmentToEdit);
      
      const updatedDepartment: Department = {
        ...departmentToEdit,
        name: 'Updated Engineering',
        budget: 600000,
      };

      component.onDepartmentSaved(updatedDepartment);

      const departments = component.departments();
      expect(departments[0]).toEqual(updatedDepartment);
      expect(departments.length).toBe(mockDepartments.length);
    });

    it('should add new department at the beginning of the list when creating', () => {
      component.editingDepartment.set(null);
      
      const newDepartment: Department = {
        id: 'dept-4',
        name: 'HR',
        budget: 250000,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      component.onDepartmentSaved(newDepartment);

      const departments = component.departments();
      expect(departments[0]).toEqual(newDepartment);
      expect(departments.length).toBe(mockDepartments.length + 1);
    });

    it('should close modal after saving department', () => {
      const newDepartment: Department = mockDepartments[0];
      component.departmentFormVisible.set(true);
      component.editingDepartment.set(null);

      component.onDepartmentSaved(newDepartment);

      expect(component.departmentFormVisible()).toBeFalse();
      expect(component.editingDepartment()).toBeNull();
    });

    it('should not duplicate department if not found in list during edit', () => {
      const nonExistentDepartment: Department = {
        id: 'non-existent',
        name: 'Non-existent',
        budget: 100000,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      component.editingDepartment.set(nonExistentDepartment);

      const updatedDepartment: Department = {
        ...nonExistentDepartment,
        name: 'Updated',
      };

      component.onDepartmentSaved(updatedDepartment);

      const departments = component.departments();
      expect(departments.length).toBe(mockDepartments.length);
    });

    it('should maintain immutability when updating departments list', () => {
      const originalDepartments = component.departments();
      const departmentToEdit = mockDepartments[1];
      component.editingDepartment.set(departmentToEdit);

      const updatedDepartment: Department = {
        ...departmentToEdit,
        name: 'Updated Marketing',
      };

      component.onDepartmentSaved(updatedDepartment);

      const newDepartments = component.departments();
      expect(newDepartments).not.toBe(originalDepartments);
    });
  });

  describe('template rendering', () => {
    it('should display page title', () => {
      fixture.detectChanges();

      const pageTitle = fixture.debugElement.query(By.css('.page-header h1'));
      expect(pageTitle).toBeTruthy();
      expect(pageTitle.nativeElement.textContent.trim()).toBe('Department Management');
    });

    it('should display add department button', () => {
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

    it('should call openAddDepartmentModal when add button is clicked', () => {
      fixture.detectChanges();
      spyOn(component, 'openAddDepartmentModal');

      const addButton = fixture.debugElement.query(By.css('.page-header p-button'));
      addButton.triggerEventHandler('onClick', null);

      expect(component.openAddDepartmentModal).toHaveBeenCalled();
    });

    it('should show initial loading spinner when loading and no departments', () => {
      // Create a fresh component with empty data from service
      departmentServiceSpy.getDepartments.and.returnValue(of([]));
      const testFixture = TestBed.createComponent(DepartmentsComponent);
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges(); // Trigger ngOnInit which will set loading=false
      
      // Now set loading to true and empty departments after ngOnInit completes
      testComponent.loading.set(true);
      testComponent.departments.set([]);
      testFixture.detectChanges();

      const spinner = testFixture.debugElement.query(By.css('.initial-loading app-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('should not show initial loading spinner when departments exist', () => {
      component.loading.set(true);
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('.initial-loading'));
      expect(spinner).toBeFalsy();
    });

    it('should display departments table when data is loaded', () => {
      fixture.detectChanges();

      const table = fixture.debugElement.query(By.css('p-table'));
      expect(table).toBeTruthy();
    });

    it('should display correct number of departments in table', () => {
      fixture.detectChanges();

      const table = fixture.debugElement.query(By.css('p-table'));
      expect(table.componentInstance.value.length).toBe(mockDepartments.length);
    });

    it('should display department names in table', () => {
      fixture.detectChanges();

      const departmentNames = fixture.debugElement.queryAll(By.css('.department-name'));
      expect(departmentNames.length).toBe(mockDepartments.length);
      expect(departmentNames[0].nativeElement.textContent.trim()).toBe('Engineering');
    });

    it('should display department budgets with currency format', () => {
      fixture.detectChanges();

      const budgets = fixture.debugElement.queryAll(By.css('.budget'));
      expect(budgets.length).toBe(mockDepartments.length);
    });

    it('should display edit button for each department', () => {
      fixture.detectChanges();

      const editButtons = fixture.debugElement.queryAll(By.css('.action-buttons p-button'));
      expect(editButtons.length).toBe(mockDepartments.length);
    });

    it('should call openEditDepartmentModal when edit button is clicked', () => {
      spyOn(component, 'openEditDepartmentModal');
      fixture.detectChanges();

      const editButton = fixture.debugElement.query(By.css('.action-buttons p-button'));
      editButton.triggerEventHandler('onClick', null);

      expect(component.openEditDepartmentModal).toHaveBeenCalledWith(mockDepartments[0]);
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

    it('should display empty state when no departments', () => {
      departmentServiceSpy.getDepartments.and.returnValue(of([]));
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyState).toBeTruthy();
      expect(emptyState.nativeElement.textContent).toContain('No Departments Yet');
    });

    it('should render department form modal component', () => {
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('app-department-form-modal'));
      expect(modal).toBeTruthy();
    });

    it('should bind visible property to modal', () => {
      component.departmentFormVisible.set(true);
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('app-department-form-modal'));
      expect(modal.componentInstance.visible()).toBeTrue();
    });

    it('should pass editingDepartment to modal', () => {
      const departmentToEdit = mockDepartments[0];
      component.editingDepartment.set(departmentToEdit);
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('app-department-form-modal'));
      expect(modal.componentInstance.editingDepartment()).toEqual(departmentToEdit);
    });
  });
});
