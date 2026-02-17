import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SimpleChange } from '@angular/core';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ProjectFormModalComponent } from './project-form-modal.component';
import { ProjectService } from '@/shared/services/project.service';
import { MessageService } from 'primeng/api';
import { Project, Department } from '@/shared/types';

describe('ProjectFormModalComponent', () => {
  let component: ProjectFormModalComponent;
  let fixture: ComponentFixture<ProjectFormModalComponent>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
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

  const mockProject: Project = {
    id: 'proj-1',
    name: 'Project Alpha',
    description: 'Alpha project description here',
    budget: 100000,
    startDate: new Date('2025-01-01').getTime(),
    endDate: new Date('2025-12-31').getTime(),
    departmentId: 'dept-1',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj<ProjectService>('ProjectService', [
      'createProject',
      'updateProject',
    ]);
    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

    projectServiceSpy.createProject.and.returnValue(of('new-proj-id'));
    projectServiceSpy.updateProject.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [ProjectFormModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectFormModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', false);
    fixture.componentRef.setInput('editingProject', null);
    fixture.componentRef.setInput('departments', mockDepartments);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize form with empty values', () => {
      fixture.detectChanges();

      expect(component.projectForm).toBeTruthy();
      expect(component.projectForm.value).toEqual({
        name: '',
        description: '',
        budget: 0,
        startDate: null,
        endDate: null,
        departmentId: null,
      });
    });

    it('should initialize formState with default values', () => {
      fixture.detectChanges();

      expect(component.formState()).toEqual({
        submitted: false,
        loading: false,
      });
    });

    it('should populate form when editingProject is set', () => {
      fixture.componentRef.setInput('editingProject', mockProject);
      fixture.detectChanges();

      expect(component.projectForm.get('name')?.value).toBe(mockProject.name);
      expect(component.projectForm.get('description')?.value).toBe(mockProject.description);
      expect(component.projectForm.get('budget')?.value).toBe(mockProject.budget);
    });
  });

  describe('ngOnChanges', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should populate form when editingProject changes', () => {
      component.projectForm.patchValue({
        name: 'Old Name',
        description: 'Old description text',
        budget: 1000,
      });

      fixture.componentRef.setInput('editingProject', mockProject);
      const changes = {
        editingProject: new SimpleChange(null, mockProject, false),
      };
      component.ngOnChanges(changes);

      expect(component.projectForm.get('name')?.value).toBe(mockProject.name);
      expect(component.projectForm.get('description')?.value).toBe(mockProject.description);
      expect(component.projectForm.get('budget')?.value).toBe(mockProject.budget);
    });

    it('should reset form when editingProject changes to null', () => {
      component.projectForm.patchValue({
        name: 'Old Name',
        description: 'Old description text',
        budget: 1000,
      });

      fixture.componentRef.setInput('editingProject', null);
      const changes = {
        editingProject: new SimpleChange(mockProject, null, false),
      };
      component.ngOnChanges(changes);

      expect(component.projectForm.get('name')?.value).toBe('');
      expect(component.projectForm.get('description')?.value).toBe('');
      expect(component.projectForm.get('budget')?.value).toBe(0);
      expect(component.projectForm.get('startDate')?.value).toBeNull();
      expect(component.projectForm.get('endDate')?.value).toBeNull();
      expect(component.projectForm.get('departmentId')?.value).toBeNull();
    });

    it('should reset formState when editingProject changes', () => {
      component.formState.set({ submitted: true, loading: true });

      fixture.componentRef.setInput('editingProject', mockProject);
      const changes = {
        editingProject: new SimpleChange(null, mockProject, false),
      };
      component.ngOnChanges(changes);

      expect(component.formState()).toEqual({
        submitted: false,
        loading: false,
      });
    });

    it('should update filteredDepartments when departments change', () => {
      const newDepartments: Department[] = [mockDepartments[0]];
      fixture.componentRef.setInput('departments', newDepartments);
      const changes = {
        departments: new SimpleChange(mockDepartments, newDepartments, false),
      };
      component.ngOnChanges(changes);

      expect(component.filteredDepartments).toEqual(newDepartments);
    });
  });

  describe('form validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should mark name as required when empty', () => {
      const nameControl = component.projectForm.controls['name'];
      nameControl.setValue('');
      nameControl.markAsTouched();

      expect(nameControl.hasError('required')).toBeTrue();
    });

    it('should enforce name minimum length of 2 characters', () => {
      const nameControl = component.projectForm.controls['name'];
      nameControl.setValue('A');
      nameControl.markAsTouched();

      expect(nameControl.hasError('minlength')).toBeTrue();
    });

    it('should enforce name maximum length of 100 characters', () => {
      const nameControl = component.projectForm.controls['name'];
      nameControl.setValue('A'.repeat(101));
      nameControl.markAsTouched();

      expect(nameControl.hasError('maxlength')).toBeTrue();
    });

    it('should accept valid name', () => {
      const nameControl = component.projectForm.controls['name'];
      nameControl.setValue('Project Alpha');

      expect(nameControl.valid).toBeTrue();
    });

    it('should mark description as required when empty', () => {
      const descControl = component.projectForm.controls['description'];
      descControl.setValue('');
      descControl.markAsTouched();

      expect(descControl.hasError('required')).toBeTrue();
    });

    it('should enforce description minimum length of 10 characters', () => {
      const descControl = component.projectForm.controls['description'];
      descControl.setValue('Short');
      descControl.markAsTouched();

      expect(descControl.hasError('minlength')).toBeTrue();
    });

    it('should enforce description maximum length of 500 characters', () => {
      const descControl = component.projectForm.controls['description'];
      descControl.setValue('A'.repeat(501));
      descControl.markAsTouched();

      expect(descControl.hasError('maxlength')).toBeTrue();
    });

    it('should accept valid description', () => {
      const descControl = component.projectForm.controls['description'];
      descControl.setValue('A valid description for the project');

      expect(descControl.valid).toBeTrue();
    });

    it('should mark budget as required', () => {
      const budgetControl = component.projectForm.controls['budget'];
      budgetControl.setValue(null as any);
      budgetControl.markAsTouched();

      expect(budgetControl.hasError('required')).toBeTrue();
    });

    it('should enforce minimum budget of 0', () => {
      const budgetControl = component.projectForm.controls['budget'];
      budgetControl.setValue(-100);
      budgetControl.markAsTouched();

      expect(budgetControl.hasError('min')).toBeTrue();
    });

    it('should accept valid budget', () => {
      const budgetControl = component.projectForm.controls['budget'];
      budgetControl.setValue(100000);

      expect(budgetControl.valid).toBeTrue();
    });

    it('should accept budget of 0', () => {
      const budgetControl = component.projectForm.controls['budget'];
      budgetControl.setValue(0);

      expect(budgetControl.valid).toBeTrue();
    });

    it('should mark startDate as required', () => {
      const startDateControl = component.projectForm.controls['startDate'];
      startDateControl.setValue(null);
      startDateControl.markAsTouched();

      expect(startDateControl.hasError('required')).toBeTrue();
    });

    it('should accept valid startDate', () => {
      const startDateControl = component.projectForm.controls['startDate'];
      startDateControl.setValue(new Date());

      expect(startDateControl.valid).toBeTrue();
    });

    it('should mark endDate as required', () => {
      const endDateControl = component.projectForm.controls['endDate'];
      endDateControl.setValue(null);
      endDateControl.markAsTouched();

      expect(endDateControl.hasError('required')).toBeTrue();
    });

    it('should mark departmentId as required', () => {
      const deptControl = component.projectForm.controls['departmentId'];
      deptControl.setValue(null);
      deptControl.markAsTouched();

      expect(deptControl.hasError('required')).toBeTrue();
    });

    it('should accept valid departmentId', () => {
      const deptControl = component.projectForm.controls['departmentId'];
      deptControl.setValue(mockDepartments[0] as any);

      expect(deptControl.valid).toBeTrue();
    });
  });

  describe('isFieldInvalid', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return true for invalid touched name field', () => {
      component.projectForm.controls['name'].setValue('');
      component.projectForm.controls['name'].markAsTouched();

      expect(component.isFieldInvalid('name')).toBeTrue();
    });

    it('should return false for valid name field', () => {
      component.projectForm.controls['name'].setValue('Project Alpha');

      expect(component.isFieldInvalid('name')).toBeFalse();
    });

    it('should return true for invalid touched description field', () => {
      component.projectForm.controls['description'].setValue('');
      component.projectForm.controls['description'].markAsTouched();

      expect(component.isFieldInvalid('description')).toBeTrue();
    });
  });

  describe('getFieldErrors', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return name validation errors', () => {
      component.projectForm.controls['name'].setValue('');
      component.projectForm.controls['name'].markAsTouched();

      const errors = component.getFieldErrors('name');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should return description validation errors', () => {
      component.projectForm.controls['description'].setValue('');
      component.projectForm.controls['description'].markAsTouched();

      const errors = component.getFieldErrors('description');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should return empty array for valid field', () => {
      component.projectForm.controls['name'].setValue('Project Alpha');

      const errors = component.getFieldErrors('name');
      expect(errors.length).toBe(0);
    });
  });

  describe('filterDepartments', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return all departments when query is empty', () => {
      component.filterDepartments({ query: '' } as any);

      expect(component.filteredDepartments).toEqual(mockDepartments);
    });

    it('should filter departments by query', () => {
      component.filterDepartments({ query: 'eng' } as any);

      expect(component.filteredDepartments.length).toBe(1);
      expect(component.filteredDepartments[0].name).toBe('Engineering');
    });

    it('should return empty array when no departments match', () => {
      component.filterDepartments({ query: 'xyz' } as any);

      expect(component.filteredDepartments.length).toBe(0);
    });
  });

  describe('onSubmit - create mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('editingProject', null);
      fixture.detectChanges();
    });

    it('should not submit when form is invalid', () => {
      component.projectForm.controls['name'].setValue('');
      component.projectForm.controls['description'].setValue('');

      component.onSubmit();

      expect(projectServiceSpy.createProject).not.toHaveBeenCalled();
      expect(component.formState().submitted).toBeTrue();
    });

    it('should call createProject with form values when form is valid', () => {
      component.projectForm.patchValue({
        name: 'New Project',
        description: 'A new project description',
        budget: 300000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        departmentId: mockDepartments[0],
      });

      component.onSubmit();

      expect(projectServiceSpy.createProject).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'New Project',
          description: 'A new project description',
          budget: 300000,
          departmentId: 'dept-1',
        })
      );
    });

    it('should set loading state while creating project', () => {
      let loadingDuringCreate = false;
      projectServiceSpy.createProject.and.callFake(() => {
        loadingDuringCreate = component.formState().loading;
        return of('new-proj-id');
      });

      component.projectForm.patchValue({
        name: 'New Project',
        description: 'A new project description',
        budget: 300000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        departmentId: mockDepartments[0],
      });

      component.onSubmit();

      expect(loadingDuringCreate).toBeTrue();
    });

    it('should emit projectSaved with new project on successful create', () => {
      spyOn(component.projectSaved, 'emit');
      component.projectForm.patchValue({
        name: 'New Project',
        description: 'A new project description',
        budget: 300000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        departmentId: mockDepartments[0],
      });

      component.onSubmit();

      expect(component.projectSaved.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: 'new-proj-id',
          name: 'New Project',
          description: 'A new project description',
          budget: 300000,
        })
      );
    });

    it('should show success toast on successful create', () => {
      component.projectForm.patchValue({
        name: 'New Project',
        description: 'A new project description',
        budget: 300000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        departmentId: mockDepartments[0],
      });

      component.onSubmit();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'success',
          summary: 'Success',
        })
      );
    });

    it('should close modal after successful create', () => {
      spyOn(component, 'closeModal');
      component.projectForm.patchValue({
        name: 'New Project',
        description: 'A new project description',
        budget: 300000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        departmentId: mockDepartments[0],
      });

      component.onSubmit();

      expect(component.closeModal).toHaveBeenCalled();
    });

    it('should show error toast when create fails', () => {
      projectServiceSpy.createProject.and.returnValue(
        throwError(() => new Error('Create failed'))
      );
      component.projectForm.patchValue({
        name: 'New Project',
        description: 'A new project description',
        budget: 300000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        departmentId: mockDepartments[0],
      });

      component.onSubmit();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'error',
          summary: 'Error',
        })
      );
    });

    it('should stop loading after create error', () => {
      projectServiceSpy.createProject.and.returnValue(
        throwError(() => new Error('Create failed'))
      );
      component.projectForm.patchValue({
        name: 'New Project',
        description: 'A new project description',
        budget: 300000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        departmentId: mockDepartments[0],
      });

      component.onSubmit();

      expect(component.formState().loading).toBeFalse();
    });

    it('should not close modal when create fails', () => {
      spyOn(component, 'closeModal');
      projectServiceSpy.createProject.and.returnValue(
        throwError(() => new Error('Create failed'))
      );
      component.projectForm.patchValue({
        name: 'New Project',
        description: 'A new project description',
        budget: 300000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        departmentId: mockDepartments[0],
      });

      component.onSubmit();

      expect(component.closeModal).not.toHaveBeenCalled();
    });
  });

  describe('onSubmit - edit mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('editingProject', mockProject);
      fixture.detectChanges();
    });

    it('should call updateProject with project id and form values', () => {
      component.projectForm.patchValue({
        name: 'Updated Alpha',
        description: 'Updated project description',
        budget: 600000,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2026-01-31'),
        departmentId: mockDepartments[0],
      });

      component.onSubmit();

      expect(projectServiceSpy.updateProject).toHaveBeenCalledWith(
        mockProject.id,
        jasmine.objectContaining({
          name: 'Updated Alpha',
          description: 'Updated project description',
          budget: 600000,
        })
      );
    });

    it('should set loading state while updating project', () => {
      let loadingDuringUpdate = false;
      projectServiceSpy.updateProject.and.callFake(() => {
        loadingDuringUpdate = component.formState().loading;
        return of(undefined);
      });

      component.projectForm.patchValue({
        name: 'Updated Alpha',
        description: 'Updated project description',
        budget: 600000,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2026-01-31'),
        departmentId: mockDepartments[0],
      });

      component.onSubmit();

      expect(loadingDuringUpdate).toBeTrue();
    });

    it('should emit projectSaved with updated project on successful update', () => {
      spyOn(component.projectSaved, 'emit');
      component.projectForm.patchValue({
        name: 'Updated Alpha',
        description: 'Updated project description',
        budget: 600000,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2026-01-31'),
        departmentId: mockDepartments[0],
      });

      component.onSubmit();

      expect(component.projectSaved.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: mockProject.id,
          name: 'Updated Alpha',
          description: 'Updated project description',
          budget: 600000,
        })
      );
    });

    it('should show success toast on successful update', () => {
      component.projectForm.patchValue({
        name: 'Updated Alpha',
        description: 'Updated project description',
        budget: 600000,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2026-01-31'),
        departmentId: mockDepartments[0],
      });

      component.onSubmit();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'success',
          summary: 'Success',
        })
      );
    });

    it('should close modal after successful update', () => {
      spyOn(component, 'closeModal');
      component.projectForm.patchValue({
        name: 'Updated Alpha',
        description: 'Updated project description',
        budget: 600000,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2026-01-31'),
        departmentId: mockDepartments[0],
      });

      component.onSubmit();

      expect(component.closeModal).toHaveBeenCalled();
    });

    it('should show error toast when update fails', () => {
      projectServiceSpy.updateProject.and.returnValue(
        throwError(() => new Error('Update failed'))
      );
      component.projectForm.patchValue({
        name: 'Updated Alpha',
        description: 'Updated project description',
        budget: 600000,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2026-01-31'),
        departmentId: mockDepartments[0],
      });

      component.onSubmit();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'error',
          summary: 'Error',
        })
      );
    });

    it('should stop loading after update error', () => {
      projectServiceSpy.updateProject.and.returnValue(
        throwError(() => new Error('Update failed'))
      );
      component.projectForm.patchValue({
        name: 'Updated Alpha',
        description: 'Updated project description',
        budget: 600000,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2026-01-31'),
        departmentId: mockDepartments[0],
      });

      component.onSubmit();

      expect(component.formState().loading).toBeFalse();
    });
  });

  describe('closeModal', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set visible to false', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      component.closeModal();

      expect(component.visible()).toBeFalse();
    });

    it('should emit formClose event', () => {
      spyOn(component.formClose, 'emit');

      component.closeModal();

      expect(component.formClose.emit).toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should reset formState', () => {
      component.formState.set({ submitted: true, loading: true });

      component.onCancel();

      expect(component.formState()).toEqual({
        submitted: false,
        loading: false,
      });
    });

    it('should close modal', () => {
      spyOn(component, 'closeModal');

      component.onCancel();

      expect(component.closeModal).toHaveBeenCalled();
    });
  });

  describe('template rendering', () => {
    it('should display "Add Project" header when not editing', () => {
      fixture.componentRef.setInput('editingProject', null);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      expect(dialog.componentInstance.header).toBe('Add Project');
    });

    it('should display "Edit Project" header when editing', () => {
      fixture.componentRef.setInput('editingProject', mockProject);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      expect(dialog.componentInstance.header).toBe('Edit Project');
    });

    it('should render name input field', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]'));
      expect(nameInput).toBeTruthy();
    });

    it('should render description textarea field', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const descInput = fixture.debugElement.query(By.css('textarea[formControlName="description"]'));
      expect(descInput).toBeTruthy();
    });

    it('should render budget input field', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const budgetInput = fixture.debugElement.query(By.css('p-inputNumber[formControlName="budget"]'));
      expect(budgetInput).toBeTruthy();
    });

    it('should render start date calendar field', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const calendar = fixture.debugElement.query(By.css('p-calendar[formControlName="startDate"]'));
      expect(calendar).toBeTruthy();
    });

    it('should render end date calendar field', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const calendar = fixture.debugElement.query(By.css('p-calendar[formControlName="endDate"]'));
      expect(calendar).toBeTruthy();
    });

    it('should render department autocomplete field', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const autoComplete = fixture.debugElement.query(By.css('p-autoComplete[formControlName="departmentId"]'));
      expect(autoComplete).toBeTruthy();
    });

    it('should display validation errors when form is submitted with invalid data', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      component.projectForm.controls['name'].setValue('');
      component.projectForm.controls['name'].markAsTouched();
      component.formState.set({ submitted: true, loading: false });
      fixture.detectChanges();

      const errorMessages = fixture.debugElement.queryAll(By.css('app-field-error-messages'));
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    it('should render cancel button', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const cancelButton = fixture.debugElement.query(By.css('p-button[severity="secondary"]'));
      expect(cancelButton).toBeTruthy();
    });

    it('should render submit button with "Create Project" label when not editing', () => {
      fixture.componentRef.setInput('editingProject', null);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const submitButtons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      const submitButton = submitButtons[1];
      expect(submitButton.componentInstance.label).toBe('Create Project');
    });

    it('should render submit button with "Update Project" label when editing', () => {
      fixture.componentRef.setInput('editingProject', mockProject);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const submitButtons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      const submitButton = submitButtons[1];
      expect(submitButton.componentInstance.label).toBe('Update Project');
    });

    it('should change submit button label to "Creating..." when loading in create mode', () => {
      fixture.componentRef.setInput('editingProject', null);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();
      component.formState.set({ submitted: true, loading: true });
      fixture.detectChanges();

      const submitButtons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      const submitButton = submitButtons[1];
      expect(submitButton.componentInstance.label).toBe('Creating...');
    });

    it('should change submit button label to "Updating..." when loading in edit mode', () => {
      fixture.componentRef.setInput('editingProject', mockProject);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();
      component.formState.set({ submitted: true, loading: true });
      fixture.detectChanges();

      const submitButtons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      const submitButton = submitButtons[1];
      expect(submitButton.componentInstance.label).toBe('Updating...');
    });

    it('should disable cancel button when loading', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();
      component.formState.set({ submitted: true, loading: true });
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      const cancelButton = buttons[0];
      expect(cancelButton.componentInstance.disabled).toBeTrue();
    });

    it('should disable submit button when loading', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();
      component.formState.set({ submitted: true, loading: true });
      fixture.detectChanges();

      const submitButtons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      const submitButton = submitButtons[1];
      expect(submitButton.componentInstance.disabled).toBeTrue();
    });
  });
});
