import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SimpleChange } from '@angular/core';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { DepartmentFormModalComponent } from './department-form-modal.component';
import { DepartmentService } from '@/shared/services/department.service';
import { MessageService } from 'primeng/api';
import { Department } from '@/shared/types';

describe('DepartmentFormModalComponent', () => {
  let component: DepartmentFormModalComponent;
  let fixture: ComponentFixture<DepartmentFormModalComponent>;
  let departmentServiceSpy: jasmine.SpyObj<DepartmentService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const mockDepartment: Department = {
    id: 'dept-1',
    name: 'Engineering',
    budget: 500000,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    departmentServiceSpy = jasmine.createSpyObj<DepartmentService>('DepartmentService', [
      'createDepartment',
      'updateDepartment',
    ]);
    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

    departmentServiceSpy.createDepartment.and.returnValue(of('new-dept-id'));
    departmentServiceSpy.updateDepartment.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [DepartmentFormModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: DepartmentService, useValue: departmentServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentFormModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', false);
    fixture.componentRef.setInput('editingDepartment', null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize form with empty values', () => {
      fixture.detectChanges();

      expect(component.departmentForm).toBeTruthy();
      expect(component.departmentForm.value).toEqual({
        name: '',
        budget: 0,
      });
    });

    it('should initialize formState with default values', () => {
      fixture.detectChanges();

      expect(component.formState()).toEqual({
        submitted: false,
        loading: false,
      });
    });

    it('should populate form when editingDepartment is set', () => {
      fixture.componentRef.setInput('editingDepartment', mockDepartment);
      fixture.detectChanges();

      expect(component.departmentForm.value).toEqual({
        name: mockDepartment.name,
        budget: mockDepartment.budget,
      });
    });
  });

  describe('ngOnChanges', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should populate form when editingDepartment changes', () => {
      component.departmentForm.patchValue({
        name: 'Old Name',
        budget: 1000,
      });

      fixture.componentRef.setInput('editingDepartment', mockDepartment);
      const changes = {
        editingDepartment: new SimpleChange(null, mockDepartment, false),
      };
      component.ngOnChanges(changes);

      expect(component.departmentForm.value).toEqual({
        name: mockDepartment.name,
        budget: mockDepartment.budget,
      });
    });

    it('should reset form when editingDepartment changes to null', () => {
      component.departmentForm.patchValue({
        name: 'Old Name',
        budget: 1000,
      });

      fixture.componentRef.setInput('editingDepartment', null);
      const changes = {
        editingDepartment: new SimpleChange(mockDepartment, null, false),
      };
      component.ngOnChanges(changes);

      expect(component.departmentForm.value).toEqual({
        name: '',
        budget: 0,
      });
    });

    it('should reset formState when editingDepartment changes', () => {
      component.formState.set({ submitted: true, loading: true });

      fixture.componentRef.setInput('editingDepartment', mockDepartment);
      const changes = {
        editingDepartment: new SimpleChange(null, mockDepartment, false),
      };
      component.ngOnChanges(changes);

      expect(component.formState()).toEqual({
        submitted: false,
        loading: false,
      });
    });

    it('should not throw error when ngOnChanges called without form initialized', () => {
      const changes = {
        editingDepartment: new SimpleChange(null, mockDepartment, false),
      };

      // Should not throw when form exists
      expect(() => component.ngOnChanges(changes)).not.toThrow();
    });
  });

  describe('form validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should mark name as required when empty', () => {
      const nameControl = component.departmentForm.controls['name'];
      nameControl.setValue('');
      nameControl.markAsTouched();

      expect(nameControl.hasError('required')).toBeTrue();
    });

    it('should enforce name minimum length of 2 characters', () => {
      const nameControl = component.departmentForm.controls['name'];
      nameControl.setValue('A');
      nameControl.markAsTouched();

      expect(nameControl.hasError('minlength')).toBeTrue();
    });

    it('should enforce name maximum length of 100 characters', () => {
      const nameControl = component.departmentForm.controls['name'];
      nameControl.setValue('A'.repeat(101));
      nameControl.markAsTouched();

      expect(nameControl.hasError('maxlength')).toBeTrue();
    });

    it('should accept valid name', () => {
      const nameControl = component.departmentForm.controls['name'];
      nameControl.setValue('Engineering');

      expect(nameControl.valid).toBeTrue();
    });

    it('should mark budget as required', () => {
      const budgetControl = component.departmentForm.controls['budget'];
      budgetControl.setValue(null as any);
      budgetControl.markAsTouched();

      expect(budgetControl.hasError('required')).toBeTrue();
    });

    it('should enforce minimum budget of 0', () => {
      const budgetControl = component.departmentForm.controls['budget'];
      budgetControl.setValue(-100);
      budgetControl.markAsTouched();

      expect(budgetControl.hasError('min')).toBeTrue();
    });

    it('should accept valid budget', () => {
      const budgetControl = component.departmentForm.controls['budget'];
      budgetControl.setValue(500000);

      expect(budgetControl.valid).toBeTrue();
    });

    it('should accept budget of 0', () => {
      const budgetControl = component.departmentForm.controls['budget'];
      budgetControl.setValue(0);

      expect(budgetControl.valid).toBeTrue();
    });
  });

  describe('isFieldInvalid', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return true for invalid touched name field', () => {
      component.departmentForm.controls['name'].setValue('');
      component.departmentForm.controls['name'].markAsTouched();

      expect(component.isFieldInvalid('name')).toBeTrue();
    });

    it('should return false for valid name field', () => {
      component.departmentForm.controls['name'].setValue('Engineering');

      expect(component.isFieldInvalid('name')).toBeFalse();
    });

    it('should return true for invalid touched budget field', () => {
      component.departmentForm.controls['budget'].setValue(-100);
      component.departmentForm.controls['budget'].markAsTouched();

      expect(component.isFieldInvalid('budget')).toBeTrue();
    });
  });

  describe('getFieldErrors', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return name validation errors', () => {
      component.departmentForm.controls['name'].setValue('');
      component.departmentForm.controls['name'].markAsTouched();

      const errors = component.getFieldErrors('name');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should return budget validation errors', () => {
      component.departmentForm.controls['budget'].setValue(-100);
      component.departmentForm.controls['budget'].markAsTouched();

      const errors = component.getFieldErrors('budget');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should return empty array for valid field', () => {
      component.departmentForm.controls['name'].setValue('Engineering');

      const errors = component.getFieldErrors('name');
      expect(errors.length).toBe(0);
    });
  });

  describe('onSubmit - create mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('editingDepartment', null);
      fixture.detectChanges();
    });

    it('should not submit when form is invalid', () => {
      component.departmentForm.controls['name'].setValue('');
      component.departmentForm.controls['budget'].setValue(-100);

      component.onSubmit();

      expect(departmentServiceSpy.createDepartment).not.toHaveBeenCalled();
      expect(component.formState().submitted).toBeTrue();
    });

    it('should call createDepartment with form values when form is valid', () => {
      component.departmentForm.patchValue({
        name: 'New Department',
        budget: 300000,
      });

      component.onSubmit();

      expect(departmentServiceSpy.createDepartment).toHaveBeenCalledWith({
        name: 'New Department',
        budget: 300000,
      });
    });

    it('should set loading state while creating department', () => {
      let loadingDuringCreate = false;
      departmentServiceSpy.createDepartment.and.callFake(() => {
        loadingDuringCreate = component.formState().loading;
        return of('new-dept-id');
      });

      component.departmentForm.patchValue({
        name: 'New Department',
        budget: 300000,
      });

      component.onSubmit();

      expect(loadingDuringCreate).toBeTrue();
    });

    it('should emit departmentSaved with new department on successful create', () => {
      spyOn(component.departmentSaved, 'emit');
      component.departmentForm.patchValue({
        name: 'New Department',
        budget: 300000,
      });

      component.onSubmit();

      expect(component.departmentSaved.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: 'new-dept-id',
          name: 'New Department',
          budget: 300000,
        })
      );
    });

    it('should show success toast on successful create', () => {
      component.departmentForm.patchValue({
        name: 'New Department',
        budget: 300000,
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
      component.departmentForm.patchValue({
        name: 'New Department',
        budget: 300000,
      });

      component.onSubmit();

      expect(component.closeModal).toHaveBeenCalled();
    });

    it('should reset form after successful create', () => {
      component.departmentForm.patchValue({
        name: 'New Department',
        budget: 300000,
      });

      component.onSubmit();

      expect(component.departmentForm.value).toEqual({
        name: '',
        budget: 0,
      });
    });

    it('should show error toast when create fails', () => {
      departmentServiceSpy.createDepartment.and.returnValue(
        throwError(() => new Error('Create failed'))
      );
      component.departmentForm.patchValue({
        name: 'New Department',
        budget: 300000,
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
      departmentServiceSpy.createDepartment.and.returnValue(
        throwError(() => new Error('Create failed'))
      );
      component.departmentForm.patchValue({
        name: 'New Department',
        budget: 300000,
      });

      component.onSubmit();

      expect(component.formState().loading).toBeFalse();
    });

    it('should not close modal when create fails', () => {
      spyOn(component, 'closeModal');
      departmentServiceSpy.createDepartment.and.returnValue(
        throwError(() => new Error('Create failed'))
      );
      component.departmentForm.patchValue({
        name: 'New Department',
        budget: 300000,
      });

      component.onSubmit();

      expect(component.closeModal).not.toHaveBeenCalled();
    });
  });

  describe('onSubmit - edit mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('editingDepartment', mockDepartment);
      fixture.detectChanges();
    });

    it('should call updateDepartment with department id and form values', () => {
      component.departmentForm.patchValue({
        name: 'Updated Engineering',
        budget: 600000,
      });

      component.onSubmit();

      expect(departmentServiceSpy.updateDepartment).toHaveBeenCalledWith(mockDepartment.id, {
        name: 'Updated Engineering',
        budget: 600000,
      });
    });

    it('should set loading state while updating department', () => {
      let loadingDuringUpdate = false;
      departmentServiceSpy.updateDepartment.and.callFake(() => {
        loadingDuringUpdate = component.formState().loading;
        return of(undefined);
      });

      component.departmentForm.patchValue({
        name: 'Updated Engineering',
        budget: 600000,
      });

      component.onSubmit();

      expect(loadingDuringUpdate).toBeTrue();
    });

    it('should emit departmentSaved with updated department on successful update', () => {
      spyOn(component.departmentSaved, 'emit');
      component.departmentForm.patchValue({
        name: 'Updated Engineering',
        budget: 600000,
      });

      component.onSubmit();

      expect(component.departmentSaved.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: mockDepartment.id,
          name: 'Updated Engineering',
          budget: 600000,
        })
      );
    });

    it('should show success toast on successful update', () => {
      component.departmentForm.patchValue({
        name: 'Updated Engineering',
        budget: 600000,
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
      component.departmentForm.patchValue({
        name: 'Updated Engineering',
        budget: 600000,
      });

      component.onSubmit();

      expect(component.closeModal).toHaveBeenCalled();
    });

    it('should not reset form after successful update', () => {
      component.departmentForm.patchValue({
        name: 'Updated Engineering',
        budget: 600000,
      });
      const formValueBeforeSubmit = component.departmentForm.value;

      component.onSubmit();

      expect(component.departmentForm.value).toEqual(formValueBeforeSubmit);
    });

    it('should show error toast when update fails', () => {
      departmentServiceSpy.updateDepartment.and.returnValue(
        throwError(() => new Error('Update failed'))
      );
      component.departmentForm.patchValue({
        name: 'Updated Engineering',
        budget: 600000,
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
      departmentServiceSpy.updateDepartment.and.returnValue(
        throwError(() => new Error('Update failed'))
      );
      component.departmentForm.patchValue({
        name: 'Updated Engineering',
        budget: 600000,
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
    it('should display "Add Department" header when not editing', () => {
      fixture.componentRef.setInput('editingDepartment', null);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      expect(dialog.componentInstance.header).toBe('Add Department');
    });

    it('should display "Edit Department" header when editing', () => {
      fixture.componentRef.setInput('editingDepartment', mockDepartment);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      expect(dialog.componentInstance.header).toBe('Edit Department');
    });

    it('should render name input field', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]'));
      expect(nameInput).toBeTruthy();
    });

    it('should render budget input field', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const budgetInput = fixture.debugElement.query(By.css('p-inputNumber[formControlName="budget"]'));
      expect(budgetInput).toBeTruthy();
    });

    it('should display validation errors when form is submitted with invalid data', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();
      
      component.departmentForm.controls['name'].setValue('');
      component.departmentForm.controls['name'].markAsTouched();
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

    it('should render submit button with "Create Department" label when not editing', () => {
      fixture.componentRef.setInput('editingDepartment', null);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const submitButtons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      const submitButton = submitButtons[1];
      expect(submitButton.componentInstance.label).toBe('Create Department');
    });

    it('should render submit button with "Update Department" label when editing', () => {
      fixture.componentRef.setInput('editingDepartment', mockDepartment);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const submitButtons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      const submitButton = submitButtons[1];
      expect(submitButton.componentInstance.label).toBe('Update Department');
    });

    it('should change submit button label to "Creating..." when loading in create mode', () => {
      fixture.componentRef.setInput('editingDepartment', null);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();
      component.formState.set({ submitted: true, loading: true });
      fixture.detectChanges();

      const submitButtons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      const submitButton = submitButtons[1];
      expect(submitButton.componentInstance.label).toBe('Creating...');
    });

    it('should change submit button label to "Updating..." when loading in edit mode', () => {
      fixture.componentRef.setInput('editingDepartment', mockDepartment);
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