import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SimpleChange } from '@angular/core';

import { UserFormModalComponent } from './user-form-modal.component';
import { UserService } from '@/shared/services/user.service';
import { MessageService } from 'primeng/api';
import { User, Project, Department } from '@/shared/types';
import { UserRole } from '@/shared/enums';
import { USER_CONSTANTS, API_MESSAGES, DEFAULTS } from '@/shared/constants';

describe('UserFormModalComponent', () => {
  let component: UserFormModalComponent;
  let fixture: ComponentFixture<UserFormModalComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
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
  ];

  const mockUsers: User[] = [
    {
      id: 'user-1',
      employeeId: 'EMP001',
      name: 'John Doe',
      email: 'john@example.com',
      role: UserRole.Admin,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'user-2',
      employeeId: 'EMP002',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: UserRole.Employee,
      departmentId: 'dept-1',
      projectId: 'proj-1',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', [
      'getUsers',
      'createUser',
      'updateUser',
      'deleteUser',
    ]);
    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

    userServiceSpy.createUser.and.returnValue(of('new-user-id'));
    userServiceSpy.updateUser.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [UserFormModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormModalComponent);
    component = fixture.componentInstance;
    // Set required model input
    fixture.componentRef.setInput('visible', true);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize the form on init', () => {
    fixture.detectChanges();
    expect(component.userForm).toBeTruthy();
    expect(component.userForm.get('employeeId')).toBeTruthy();
    expect(component.userForm.get('name')).toBeTruthy();
    expect(component.userForm.get('email')).toBeTruthy();
    expect(component.userForm.get('password')).toBeTruthy();
    expect(component.userForm.get('role')).toBeTruthy();
    expect(component.userForm.get('departmentId')).toBeTruthy();
    expect(component.userForm.get('projectId')).toBeTruthy();
  });

  it('should initialize with default form state', () => {
    fixture.detectChanges();
    expect(component.formState()).toEqual(DEFAULTS.FORM_STATE);
  });

  it('should initialize roles from USER_CONSTANTS excluding ALL', () => {
    fixture.detectChanges();
    expect(component.roles.length).toBe(
      USER_CONSTANTS.ROLE_OPTIONS.filter(r => r.value !== 'ALL').length
    );
    expect(component.roles.every(r => r.value !== 'ALL')).toBeTrue();
  });

  it('should expose constants', () => {
    fixture.detectChanges();
    expect(component.constants).toBe(USER_CONSTANTS);
  });

  describe('form initialization for new user (no editingUser)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('editingUser', null);
      fixture.detectChanges();
    });

    it('should set default role to Employee', () => {
      const roleValue = component.userForm.get('role')?.value;
      expect(roleValue).toBeTruthy();
      expect(typeof roleValue === 'object' ? roleValue?.value : roleValue).toBe(UserRole.Employee);
    });

    it('should have empty employeeId, name, email, and password', () => {
      expect(component.userForm.get('employeeId')?.value).toBe('');
      expect(component.userForm.get('name')?.value).toBe('');
      expect(component.userForm.get('email')?.value).toBe('');
      expect(component.userForm.get('password')?.value).toBe('');
    });

    it('should require password for new user', () => {
      component.userForm.get('password')?.setValue('');
      component.userForm.get('password')?.markAsTouched();
      expect(component.userForm.get('password')?.hasError('required')).toBeTrue();
    });

    it('should have null departmentId and projectId', () => {
      expect(component.userForm.get('departmentId')?.value).toBeNull();
      expect(component.userForm.get('projectId')?.value).toBeNull();
    });
  });

  describe('form initialization for editing user', () => {
    it('should populate form with editing user data', () => {
      fixture.componentRef.setInput('editingUser', mockUsers[1]);
      fixture.componentRef.setInput('projects', mockProjects);
      fixture.componentRef.setInput('departments', mockDepartments);
      fixture.detectChanges();

      component.ngOnChanges({
        editingUser: new SimpleChange(null, mockUsers[1], false),
        projects: new SimpleChange([], mockProjects, false),
        departments: new SimpleChange([], mockDepartments, false),
      });

      expect(component.userForm.get('employeeId')?.value).toBe('EMP002');
      expect(component.userForm.get('name')?.value).toBe('Jane Smith');
      expect(component.userForm.get('email')?.value).toBe('jane@example.com');
    });

    it('should not require password when editing', () => {
      fixture.componentRef.setInput('editingUser', mockUsers[1]);
      fixture.componentRef.setInput('projects', mockProjects);
      fixture.componentRef.setInput('departments', mockDepartments);
      fixture.detectChanges();

      component.ngOnChanges({
        editingUser: new SimpleChange(null, mockUsers[1], false),
      });

      component.userForm.get('password')?.setValue('');
      component.userForm.get('password')?.markAsTouched();
      expect(component.userForm.get('password')?.hasError('required')).toBeFalse();
    });

    it('should set password field to empty when editing', () => {
      fixture.componentRef.setInput('editingUser', mockUsers[1]);
      fixture.componentRef.setInput('projects', mockProjects);
      fixture.componentRef.setInput('departments', mockDepartments);
      fixture.detectChanges();

      component.ngOnChanges({
        editingUser: new SimpleChange(null, mockUsers[1], false),
      });

      expect(component.userForm.get('password')?.value).toBe('');
    });

    it('should set role to matching role option object', () => {
      fixture.componentRef.setInput('editingUser', mockUsers[1]);
      fixture.componentRef.setInput('projects', mockProjects);
      fixture.componentRef.setInput('departments', mockDepartments);
      fixture.detectChanges();

      component.ngOnChanges({
        editingUser: new SimpleChange(null, mockUsers[1], false),
      });

      const roleValue = component.userForm.get('role')?.value;
      const expectedRole = component.roleOptions.find(r => r.value === UserRole.Employee);
      expect(roleValue).toEqual(expectedRole);
    });

    it('should set department to matching department object', () => {
      fixture.componentRef.setInput('editingUser', mockUsers[1]);
      fixture.componentRef.setInput('projects', mockProjects);
      fixture.componentRef.setInput('departments', mockDepartments);
      fixture.detectChanges();

      component.ngOnChanges({
        editingUser: new SimpleChange(null, mockUsers[1], false),
        departments: new SimpleChange([], mockDepartments, false),
      });

      const deptValue = component.userForm.get('departmentId')?.value;
      expect(deptValue).toEqual(mockDepartments[0]);
    });

    it('should set project to matching project object', () => {
      fixture.componentRef.setInput('editingUser', mockUsers[1]);
      fixture.componentRef.setInput('projects', mockProjects);
      fixture.componentRef.setInput('departments', mockDepartments);
      fixture.detectChanges();

      component.ngOnChanges({
        editingUser: new SimpleChange(null, mockUsers[1], false),
        projects: new SimpleChange([], mockProjects, false),
      });

      const projValue = component.userForm.get('projectId')?.value;
      expect(projValue).toEqual(mockProjects[0]);
    });
  });

  describe('form validation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('editingUser', null);
      fixture.detectChanges();
    });

    it('should be invalid when form is empty', () => {
      component.userForm.get('employeeId')?.setValue('');
      component.userForm.get('name')?.setValue('');
      component.userForm.get('email')?.setValue('');
      component.userForm.get('password')?.setValue('');
      component.userForm.get('role')?.setValue(null);
      expect(component.userForm.invalid).toBeTrue();
    });

    it('should require employeeId', () => {
      component.userForm.get('employeeId')?.setValue('');
      component.userForm.get('employeeId')?.markAsTouched();
      expect(component.userForm.get('employeeId')?.hasError('required')).toBeTrue();
    });

    it('should enforce maxLength on employeeId', () => {
      component.userForm.get('employeeId')?.setValue('A'.repeat(21));
      expect(component.userForm.get('employeeId')?.hasError('maxlength')).toBeTrue();
    });

    it('should require name', () => {
      component.userForm.get('name')?.setValue('');
      component.userForm.get('name')?.markAsTouched();
      expect(component.userForm.get('name')?.hasError('required')).toBeTrue();
    });

    it('should enforce minLength on name', () => {
      component.userForm.get('name')?.setValue('A');
      expect(component.userForm.get('name')?.hasError('minlength')).toBeTrue();
    });

    it('should enforce maxLength on name', () => {
      component.userForm.get('name')?.setValue('A'.repeat(101));
      expect(component.userForm.get('name')?.hasError('maxlength')).toBeTrue();
    });

    it('should require email', () => {
      component.userForm.get('email')?.setValue('');
      component.userForm.get('email')?.markAsTouched();
      expect(component.userForm.get('email')?.hasError('required')).toBeTrue();
    });

    it('should validate email format', () => {
      component.userForm.get('email')?.setValue('not-an-email');
      expect(component.userForm.get('email')?.hasError('email')).toBeTrue();
    });

    it('should accept valid email', () => {
      component.userForm.get('email')?.setValue('test@example.com');
      expect(component.userForm.get('email')?.hasError('email')).toBeFalse();
    });

    it('should require password for new user', () => {
      component.userForm.get('password')?.setValue('');
      component.userForm.get('password')?.markAsTouched();
      expect(component.userForm.get('password')?.hasError('required')).toBeTrue();
    });

    it('should validate password complexity', () => {
      component.userForm.get('password')?.setValue('weakpass');
      expect(component.userForm.get('password')?.hasError('INVALID_PASSWORD')).toBeTrue();
    });

    it('should accept valid password', () => {
      component.userForm.get('password')?.setValue('StrongP@ss1');
      expect(component.userForm.get('password')?.hasError('INVALID_PASSWORD')).toBeFalse();
      expect(component.userForm.get('password')?.hasError('required')).toBeFalse();
    });

    it('should require role', () => {
      component.userForm.get('role')?.setValue(null);
      component.userForm.get('role')?.markAsTouched();
      expect(component.userForm.get('role')?.hasError('required')).toBeTrue();
    });
  });

  describe('role change handling', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('editingUser', null);
      fixture.componentRef.setInput('projects', mockProjects);
      fixture.componentRef.setInput('departments', mockDepartments);
      fixture.detectChanges();
    });

    it('should require departmentId when role is Employee', () => {
      const employeeRole = component.roleOptions.find(r => r.value === UserRole.Employee);
      component.userForm.get('role')?.setValue(employeeRole!);

      component.userForm.get('departmentId')?.setValue(null);
      component.userForm.get('departmentId')?.markAsTouched();
      expect(component.userForm.get('departmentId')?.hasError('required')).toBeTrue();
    });

    it('should clear departmentId and projectId when role changes to Admin', () => {
      // set Employee first
      const employeeRole = component.roleOptions.find(r => r.value === UserRole.Employee);
      component.userForm.get('role')?.setValue(employeeRole!);
      component.userForm.get('departmentId')?.setValue(mockDepartments[0]);
      component.userForm.get('projectId')?.setValue(mockProjects[0]);

      // now change to Admin
      const adminRole = component.roleOptions.find(r => r.value === UserRole.Admin);
      component.userForm.get('role')?.setValue(adminRole!);

      expect(component.userForm.get('departmentId')?.value).toBeNull();
      expect(component.userForm.get('projectId')?.value).toBeNull();
    });

    it('should clear departmentId validators when role is Admin', () => {
      const adminRole = component.roleOptions.find(r => r.value === UserRole.Admin);
      component.userForm.get('role')?.setValue(adminRole!);

      component.userForm.get('departmentId')?.setValue(null);
      component.userForm.get('departmentId')?.markAsTouched();
      expect(component.userForm.get('departmentId')?.hasError('required')).toBeFalse();
    });
  });

  describe('isEmployeeRole', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return true when role is Employee', () => {
      const employeeRole = component.roleOptions.find(r => r.value === UserRole.Employee);
      component.userForm.get('role')?.setValue(employeeRole!);
      expect(component.isEmployeeRole()).toBeTrue();
    });

    it('should return false when role is Admin', () => {
      const adminRole = component.roleOptions.find(r => r.value === UserRole.Admin);
      component.userForm.get('role')?.setValue(adminRole!);
      expect(component.isEmployeeRole()).toBeFalse();
    });

    it('should return false when role is null', () => {
      component.userForm.get('role')?.setValue(null);
      expect(component.isEmployeeRole()).toBeFalse();
    });

    it('should handle string role value', () => {
      component.userForm.get('role')?.setValue(UserRole.Employee);
      expect(component.isEmployeeRole()).toBeTrue();
    });
  });

  describe('filtered projects based on department', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('projects', mockProjects);
      fixture.componentRef.setInput('departments', mockDepartments);
      fixture.detectChanges();

      component.ngOnChanges({
        projects: new SimpleChange([], mockProjects, false),
        departments: new SimpleChange([], mockDepartments, false),
      });
    });

    it('should filter projects by selected department', () => {
      component.userForm.get('departmentId')?.setValue(mockDepartments[0]);

      expect(component.filteredProjects().length).toBe(1);
      expect(component.filteredProjects()[0].departmentId).toBe('dept-1');
    });

    it('should clear filtered projects when no department selected', () => {
      component.userForm.get('departmentId')?.setValue(null);

      expect(component.filteredProjects().length).toBe(0);
    });

    it('should clear projectId if current project does not belong to new department', () => {
      component.userForm.get('departmentId')?.setValue(mockDepartments[0]);
      component.userForm.get('projectId')?.setValue(mockProjects[0]); // proj-1, dept-1

      // switch to dept-2
      component.userForm.get('departmentId')?.setValue(mockDepartments[1]);

      expect(component.userForm.get('projectId')?.value).toBeNull();
    });

    it('should keep projectId if current project belongs to new department', () => {
      component.userForm.get('departmentId')?.setValue(mockDepartments[0]);
      component.userForm.get('projectId')?.setValue(mockProjects[0]); // proj-1, dept-1

      // re-set same department
      component.userForm.get('departmentId')?.setValue(mockDepartments[0]);

      const projValue = component.userForm.get('projectId')?.value;
      expect(projValue).toEqual(mockProjects[0]);
    });
  });

  describe('filterRoles', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return all roles when query is empty', () => {
      component.filterRoles({ query: '' } as any);
      expect(component.roles.length).toBe(component.roleOptions.length);
    });

    it('should filter roles by query', () => {
      component.filterRoles({ query: 'admin' } as any);
      expect(component.roles.length).toBe(1);
      expect(component.roles[0].value).toBe(UserRole.Admin);
    });

    it('should return empty when no roles match query', () => {
      component.filterRoles({ query: 'nonexistent' } as any);
      expect(component.roles.length).toBe(0);
    });
  });

  describe('filterDepartments', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('departments', mockDepartments);
      fixture.detectChanges();

      component.ngOnChanges({
        departments: new SimpleChange([], mockDepartments, false),
      });
    });

    it('should return all departments when query is empty', () => {
      component.filterDepartments({ query: '' } as any);
      expect(component.filteredDepartments.length).toBe(mockDepartments.length);
    });

    it('should filter departments by query', () => {
      component.filterDepartments({ query: 'eng' } as any);
      expect(component.filteredDepartments.length).toBe(1);
      expect(component.filteredDepartments[0].name).toBe('Engineering');
    });

    it('should return empty when no departments match query', () => {
      component.filterDepartments({ query: 'nonexistent' } as any);
      expect(component.filteredDepartments.length).toBe(0);
    });
  });

  describe('filterProjects', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('projects', mockProjects);
      fixture.componentRef.setInput('departments', mockDepartments);
      fixture.detectChanges();

      component.ngOnChanges({
        projects: new SimpleChange([], mockProjects, false),
        departments: new SimpleChange([], mockDepartments, false),
      });
      // select dept-1 so filtered projects are available
      component.userForm.get('departmentId')?.setValue(mockDepartments[0]);
    });

    it('should return all filtered projects for department when query is empty', () => {
      component.filterProjects({ query: '' } as any);
      expect(component.filteredProjectsList.length).toBe(1); // only dept-1 projects
    });

    it('should filter projects by query within selected department', () => {
      component.filterProjects({ query: 'alpha' } as any);
      expect(component.filteredProjectsList.length).toBe(1);
      expect(component.filteredProjectsList[0].name).toBe('Project Alpha');
    });

    it('should return empty when no projects match query', () => {
      component.filterProjects({ query: 'nonexistent' } as any);
      expect(component.filteredProjectsList.length).toBe(0);
    });
  });

  describe('onSubmit - invalid form', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('editingUser', null);
      fixture.detectChanges();
    });

    it('should not call userService when form is invalid', () => {
      component.onSubmit();

      expect(userServiceSpy.createUser).not.toHaveBeenCalled();
      expect(userServiceSpy.updateUser).not.toHaveBeenCalled();
    });

    it('should set submitted to true when form is invalid', () => {
      component.onSubmit();

      expect(component.formState().submitted).toBeTrue();
    });

    it('should mark all form controls as touched', () => {
      component.onSubmit();

      expect(component.userForm.get('employeeId')?.touched).toBeTrue();
      expect(component.userForm.get('name')?.touched).toBeTrue();
      expect(component.userForm.get('email')?.touched).toBeTrue();
    });
  });

  describe('onSubmit - create user', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('editingUser', null);
      fixture.componentRef.setInput('projects', mockProjects);
      fixture.componentRef.setInput('departments', mockDepartments);
      fixture.detectChanges();

      component.ngOnChanges({
        projects: new SimpleChange([], mockProjects, false),
        departments: new SimpleChange([], mockDepartments, false),
      });
    });

    function fillValidForm(): void {
      const employeeRole = component.roleOptions.find(r => r.value === UserRole.Employee);
      component.userForm.patchValue({
        employeeId: 'EMP099',
        name: 'Test User',
        email: 'test@example.com',
        password: 'StrongP@ss1',
        role: employeeRole,
        departmentId: mockDepartments[0],
        projectId: mockProjects[0],
      });
    }

    it('should call userService.createUser with correct data', () => {
      fillValidForm();
      component.onSubmit();

      expect(userServiceSpy.createUser).toHaveBeenCalledTimes(1);
      const callArg = userServiceSpy.createUser.calls.mostRecent().args[0];
      expect(callArg.employeeId).toBe('EMP099');
      expect(callArg.name).toBe('Test User');
      expect(callArg.email).toBe('test@example.com');
      expect(callArg.role).toBe(UserRole.Employee);
      expect((callArg as any).password).toBe('StrongP@ss1');
    });

    it('should show success message on successful create', () => {
      fillValidForm();
      component.onSubmit();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'success',
          summary: 'Success',
          detail: API_MESSAGES.ADMIN.USER.CREATE_SUCCESS,
        })
      );
    });

    it('should emit userSaved with new user on successful create', () => {
      fillValidForm();
      spyOn(component.userSaved, 'emit');
      component.onSubmit();

      expect(component.userSaved.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: 'new-user-id',
          employeeId: 'EMP099',
          name: 'Test User',
          email: 'test@example.com',
        })
      );
    });

    it('should close modal on successful create', () => {
      fillValidForm();
      spyOn(component.formClose, 'emit');
      component.onSubmit();

      expect(component.visible()).toBeFalse();
      expect(component.formClose.emit).toHaveBeenCalled();
    });

    it('should set formState loading to true during submission', () => {
      let loadingDuringSubmit = false;
      userServiceSpy.createUser.and.callFake(() => {
        loadingDuringSubmit = component.formState().loading;
        return of('new-user-id');
      });

      fillValidForm();
      component.onSubmit();

      expect(loadingDuringSubmit).toBeTrue();
    });

    it('should show error message on create failure', () => {
      userServiceSpy.createUser.and.returnValue(throwError(() => new Error('Create failed')));
      fillValidForm();
      component.onSubmit();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'error',
          summary: 'Error',
          detail: API_MESSAGES.ADMIN.USER.CREATE_ERROR,
        })
      );
    });

    it('should set loading to false on create failure', () => {
      userServiceSpy.createUser.and.returnValue(throwError(() => new Error('Create failed')));
      fillValidForm();
      component.onSubmit();

      expect(component.formState().loading).toBeFalse();
    });

    it('should not include password if blank when creating', () => {
      const adminRole = component.roleOptions.find(r => r.value === UserRole.Admin);
      component.userForm.patchValue({
        employeeId: 'EMP099',
        name: 'Test Admin',
        email: 'admin@example.com',
        password: '',
        role: adminRole,
      });
      // Remove required on password to allow submit
      component.userForm.get('password')?.clearValidators();
      component.userForm.get('password')?.updateValueAndValidity();
      // Clear department required since admin
      component.userForm.get('departmentId')?.clearValidators();
      component.userForm.get('departmentId')?.updateValueAndValidity();

      component.onSubmit();

      const callArg = userServiceSpy.createUser.calls.mostRecent().args[0];
      expect((callArg as any).password).toBeUndefined();
    });
  });

  describe('onSubmit - update user', () => {
    const editingUser = {
      id: 'user-2',
      employeeId: 'EMP002',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: UserRole.Employee,
      departmentId: 'dept-1',
      projectId: 'proj-1',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    beforeEach(() => {
      fixture.componentRef.setInput('editingUser', editingUser);
      fixture.componentRef.setInput('projects', mockProjects);
      fixture.componentRef.setInput('departments', mockDepartments);
      fixture.detectChanges();

      component.ngOnChanges({
        editingUser: new SimpleChange(null, editingUser, false),
        projects: new SimpleChange([], mockProjects, false),
        departments: new SimpleChange([], mockDepartments, false),
      });
    });

    it('should call userService.updateUser with correct args', () => {
      component.userForm.get('name')?.setValue('Updated Jane');
      component.onSubmit();

      expect(userServiceSpy.updateUser).toHaveBeenCalledTimes(1);
      expect(userServiceSpy.updateUser.calls.mostRecent().args[0]).toBe('user-2');
      const updatePayload = userServiceSpy.updateUser.calls.mostRecent().args[1];
      expect(updatePayload.name).toBe('Updated Jane');
    });

    it('should show success message on successful update', () => {
      component.onSubmit();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'success',
          summary: 'Success',
          detail: API_MESSAGES.ADMIN.USER.UPDATE_SUCCESS,
        })
      );
    });

    it('should emit userSaved with updated user on successful update', () => {
      spyOn(component.userSaved, 'emit');
      component.userForm.get('name')?.setValue('Updated Jane');
      component.onSubmit();

      expect(component.userSaved.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: 'user-2',
          name: 'Updated Jane',
        })
      );
    });

    it('should close modal on successful update', () => {
      spyOn(component.formClose, 'emit');
      component.onSubmit();

      expect(component.visible()).toBeFalse();
      expect(component.formClose.emit).toHaveBeenCalled();
    });

    it('should show error message on update failure', () => {
      userServiceSpy.updateUser.and.returnValue(throwError(() => new Error('Update failed')));
      component.onSubmit();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'error',
          summary: 'Error',
          detail: API_MESSAGES.ADMIN.USER.UPDATE_ERROR,
        })
      );
    });

    it('should set loading to false on update failure', () => {
      userServiceSpy.updateUser.and.returnValue(throwError(() => new Error('Update failed')));
      component.onSubmit();

      expect(component.formState().loading).toBeFalse();
    });

    it('should not include password in payload if left blank', () => {
      component.userForm.get('password')?.setValue('');
      component.onSubmit();

      const callArg = userServiceSpy.updateUser.calls.mostRecent().args[1];
      expect((callArg as any).password).toBeUndefined();
    });

    it('should include password in payload if provided', () => {
      component.userForm.get('password')?.setValue('NewStrongP@ss1');
      component.onSubmit();

      const callArg = userServiceSpy.updateUser.calls.mostRecent().args[1];
      expect((callArg as any).password).toBe('NewStrongP@ss1');
    });
  });

  describe('closeModal', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set visible to false', () => {
      component.closeModal();
      expect(component.visible()).toBeFalse();
    });

    it('should emit formClose', () => {
      spyOn(component.formClose, 'emit');
      component.closeModal();
      expect(component.formClose.emit).toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should reset formState to defaults', () => {
      component.formState.set({ submitted: true, loading: true });
      component.onCancel();
      expect(component.formState()).toEqual(DEFAULTS.FORM_STATE);
    });

    it('should close modal', () => {
      spyOn(component.formClose, 'emit');
      component.onCancel();
      expect(component.visible()).toBeFalse();
      expect(component.formClose.emit).toHaveBeenCalled();
    });
  });

  describe('isFieldInvalid', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return true for invalid and touched field', () => {
      component.userForm.get('employeeId')?.setValue('');
      component.userForm.get('employeeId')?.markAsTouched();
      expect(component.isFieldInvalid('employeeId')).toBeTrue();
    });

    it('should return false for valid field', () => {
      component.userForm.get('employeeId')?.setValue('EMP001');
      component.userForm.get('employeeId')?.markAsTouched();
      expect(component.isFieldInvalid('employeeId')).toBeFalse();
    });

    it('should return false for invalid but untouched field', () => {
      component.userForm.get('employeeId')?.setValue('');
      expect(component.isFieldInvalid('employeeId')).toBeFalse();
    });
  });

  describe('getFieldErrors', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return error messages for invalid field', () => {
      component.userForm.get('employeeId')?.setValue('');
      component.userForm.get('employeeId')?.markAsTouched();
      const errors = component.getFieldErrors('employeeId');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should return empty array for valid field', () => {
      component.userForm.get('employeeId')?.setValue('EMP001');
      component.userForm.get('employeeId')?.markAsTouched();
      const errors = component.getFieldErrors('employeeId');
      expect(errors.length).toBe(0);
    });
  });

  describe('ngOnChanges', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update filteredDepartments when departments input changes', () => {
      fixture.componentRef.setInput('departments', mockDepartments);
      component.ngOnChanges({
        departments: new SimpleChange([], mockDepartments, false),
      });

      expect(component.filteredDepartments.length).toBe(mockDepartments.length);
    });

    it('should call updateFilteredProjects when projects input changes', () => {
      fixture.componentRef.setInput('projects', mockProjects);
      fixture.componentRef.setInput('departments', mockDepartments);
      component.ngOnChanges({
        projects: new SimpleChange([], mockProjects, false),
        departments: new SimpleChange([], mockDepartments, false),
      });

      // Select a department, which triggers updateFilteredProjects
      component.userForm.get('departmentId')?.setValue(mockDepartments[0]);
      const filtered = component.filteredProjects();
      expect(filtered.every(p => p.departmentId === 'dept-1')).toBeTrue();
    });
  });

  describe('template rendering', () => {
    it('should display dialog with correct header for new user', () => {
      fixture.componentRef.setInput('editingUser', null);
      fixture.detectChanges();

      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      expect(dialog).toBeTruthy();
      expect(dialog.componentInstance.header).toBe(USER_CONSTANTS.ACTIONS.ADD_USER);
    });

    it('should display dialog with correct header for editing user', () => {
      fixture.componentRef.setInput('editingUser', mockUsers[0]);
      fixture.detectChanges();

      component.ngOnChanges({
        editingUser: new SimpleChange(null, mockUsers[0], false),
      });
      fixture.detectChanges();

      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      expect(dialog.componentInstance.header).toBe(USER_CONSTANTS.ACTIONS.EDIT_USER);
    });

    it('should render form inputs', () => {
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('#employeeId'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('#name'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('#email'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('#password'))).toBeTruthy();
    });

    it('should render cancel and submit buttons', () => {
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      expect(buttons.length).toBe(2);
    });

    it('should show password help text when editing', () => {
      fixture.componentRef.setInput('editingUser', mockUsers[0]);
      fixture.detectChanges();

      component.ngOnChanges({
        editingUser: new SimpleChange(null, mockUsers[0], false),
      });
      fixture.detectChanges();

      const helpText = fixture.debugElement.query(By.css('.field-help'));
      expect(helpText).toBeTruthy();
      expect(helpText.nativeElement.textContent).toContain('Leave blank to keep the current password');
    });

    it('should show department and project fields when role is Employee', () => {
      fixture.componentRef.setInput('departments', mockDepartments);
      fixture.componentRef.setInput('projects', mockProjects);
      fixture.detectChanges();

      const employeeRole = component.roleOptions.find(r => r.value === UserRole.Employee);
      component.userForm.get('role')?.setValue(employeeRole!);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('#departmentId'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('#projectId'))).toBeTruthy();
    });

    it('should hide department and project fields when role is Admin', () => {
      fixture.detectChanges();

      const adminRole = component.roleOptions.find(r => r.value === UserRole.Admin);
      component.userForm.get('role')?.setValue(adminRole!);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('#departmentId'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('#projectId'))).toBeFalsy();
    });

    it('should call onSubmit when submit button is clicked', () => {
      fixture.detectChanges();
      spyOn(component, 'onSubmit');

      const buttons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      const submitButton = buttons[1]; // second button is submit
      submitButton.triggerEventHandler('onClick', null);

      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', () => {
      fixture.detectChanges();
      spyOn(component, 'onCancel');

      const buttons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      const cancelButton = buttons[0]; // first button is cancel
      cancelButton.triggerEventHandler('onClick', null);

      expect(component.onCancel).toHaveBeenCalled();
    });

    it('should show submit button label as "Create User" for new user', () => {
      fixture.componentRef.setInput('editingUser', null);
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      const submitButton = buttons[1];
      expect(submitButton.componentInstance.label).toBe(USER_CONSTANTS.ACTIONS.CREATE);
    });

    it('should show submit button label as "Update User" for editing user', () => {
      fixture.componentRef.setInput('editingUser', mockUsers[0]);
      fixture.detectChanges();

      component.ngOnChanges({
        editingUser: new SimpleChange(null, mockUsers[0], false),
      });
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      const submitButton = buttons[1];
      expect(submitButton.componentInstance.label).toBe(USER_CONSTANTS.ACTIONS.UPDATE);
    });

    it('should disable buttons when loading', () => {
      fixture.detectChanges();
      component.formState.set({ submitted: true, loading: true });
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      buttons.forEach(button => {
        expect(button.componentInstance.disabled).toBeTrue();
      });
    });

    it('should show "Creating..." label on submit button when loading during create', () => {
      fixture.componentRef.setInput('editingUser', null);
      fixture.detectChanges();

      component.formState.set({ submitted: true, loading: true });
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      const submitButton = buttons[1];
      expect(submitButton.componentInstance.label).toBe('Creating...');
    });

    it('should show "Updating..." label on submit button when loading during edit', () => {
      fixture.componentRef.setInput('editingUser', mockUsers[0]);
      fixture.detectChanges();

      component.ngOnChanges({
        editingUser: new SimpleChange(null, mockUsers[0], false),
      });

      component.formState.set({ submitted: true, loading: true });
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('.button-container p-button'));
      const submitButton = buttons[1];
      expect(submitButton.componentInstance.label).toBe('Updating...');
    });
  });
});
