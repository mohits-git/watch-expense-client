import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { UsersComponent } from './users.component';
import { UserService } from '@/shared/services/user.service';
import { ProjectService } from '@/shared/services/project.service';
import { DepartmentService } from '@/shared/services/department.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { User, Project, Department } from '@/shared/types';
import { UserRole } from '@/shared/enums';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let departmentServiceSpy: jasmine.SpyObj<DepartmentService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;

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
    {
      id: 'user-3',
      employeeId: 'EMP003',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: UserRole.Employee,
      departmentId: 'dept-2',
      projectId: 'proj-2',
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
    confirmationServiceSpy = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm', 'close', 'onAccept']);
    confirmationServiceSpy.requireConfirmation$ = new Subject<any>().asObservable();
    (confirmationServiceSpy as any).accept = new Subject<any>().asObservable();

    userServiceSpy.getUsers.and.returnValue(of(mockUsers));
    projectServiceSpy.getProjects.and.returnValue(of(mockProjects));
    departmentServiceSpy.getDepartments.and.returnValue(of(mockDepartments));
    userServiceSpy.deleteUser.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: DepartmentService, useValue: departmentServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: ConfirmationService, useValue: confirmationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.users()).toEqual([]);
    expect(component.filteredUsers()).toEqual([]);
    expect(component.selectedRoleFilter()).toBe('ALL');
    expect(component.projects()).toEqual([]);
    expect(component.departments()).toEqual([]);
    expect(component.userFormVisible()).toBeFalse();
    expect(component.editingUser()).toBeNull();
    expect(component.loading()).toBeTrue();
    expect(component.submitting()).toBeFalse();
  });

  describe('ngOnInit', () => {
    it('should load initial data on init', () => {
      fixture.detectChanges();

      expect(userServiceSpy.getUsers).toHaveBeenCalledTimes(1);
      expect(projectServiceSpy.getProjects).toHaveBeenCalledTimes(1);
      expect(departmentServiceSpy.getDepartments).toHaveBeenCalledTimes(1);
      expect(component.users()).toEqual(mockUsers);
      expect(component.projects()).toEqual(mockProjects);
      expect(component.departments()).toEqual(mockDepartments);
      expect(component.loading()).toBeFalse();
    });

    it('should set loading true while fetching data', () => {
      let loadingDuringFetch = false;
      userServiceSpy.getUsers.and.callFake(() => {
        loadingDuringFetch = component.loading();
        return of(mockUsers);
      });

      fixture.detectChanges();

      expect(loadingDuringFetch).toBeTrue();
    });

    it('should apply filters after loading data', () => {
      fixture.detectChanges();

      expect(component.filteredUsers()).toEqual(mockUsers);
    });

    it('should handle error when loading data fails', () => {
      const error = new Error('Failed to load');
      userServiceSpy.getUsers.and.returnValue(throwError(() => error));

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

  describe('role filtering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show all users when filter is ALL', () => {
      component.selectedRoleFilter.set('ALL');
      component.onRoleFilterChange();

      expect(component.filteredUsers().length).toBe(mockUsers.length);
    });

    it('should filter users by Admin role', () => {
      component.selectedRoleFilter.set(UserRole.Admin);
      component.onRoleFilterChange();

      const filtered = component.filteredUsers();
      expect(filtered.length).toBe(1);
      expect(filtered[0].role).toBe(UserRole.Admin);
    });

    it('should filter users by Employee role', () => {
      component.selectedRoleFilter.set(UserRole.Employee);
      component.onRoleFilterChange();

      const filtered = component.filteredUsers();
      expect(filtered.length).toBe(2);
      filtered.forEach(user => {
        expect(user.role).toBe(UserRole.Employee);
      });
    });

    it('should return empty list when no users match filter', () => {
      component.users.set([mockUsers[0]]); // Only Admin
      component.selectedRoleFilter.set(UserRole.Employee);
      component.onRoleFilterChange();

      expect(component.filteredUsers().length).toBe(0);
    });
  });

  describe('openAddUserModal', () => {
    it('should set editingUser to null and open modal', () => {
      component.openAddUserModal();

      expect(component.editingUser()).toBeNull();
      expect(component.userFormVisible()).toBeTrue();
    });

    it('should clear previous editing user when opening add modal', () => {
      component.editingUser.set(mockUsers[0]);

      component.openAddUserModal();

      expect(component.editingUser()).toBeNull();
      expect(component.userFormVisible()).toBeTrue();
    });
  });

  describe('openEditUserModal', () => {
    it('should set editingUser with copy of user and open modal', () => {
      const userToEdit = mockUsers[0];

      component.openEditUserModal(userToEdit);

      expect(component.editingUser()).toEqual(userToEdit);
      expect(component.editingUser()).not.toBe(userToEdit);
      expect(component.userFormVisible()).toBeTrue();
    });

    it('should create a new object reference when setting editingUser', () => {
      const userToEdit = mockUsers[0];

      component.openEditUserModal(userToEdit);

      const editingUsr = component.editingUser();
      expect(editingUsr).toEqual(userToEdit);
      expect(editingUsr).not.toBe(userToEdit);
    });
  });

  describe('onUserFormClose', () => {
    it('should close modal and clear editingUser', () => {
      component.userFormVisible.set(true);
      component.editingUser.set(mockUsers[0]);

      component.onUserFormClose();

      expect(component.userFormVisible()).toBeFalse();
      expect(component.editingUser()).toBeNull();
    });
  });

  describe('onUserSaved', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update existing user in the list when editing', () => {
      const userToEdit = mockUsers[0];
      component.editingUser.set(userToEdit);

      const updatedUser: User = {
        ...userToEdit,
        name: 'Updated John',
        email: 'updated.john@example.com',
      };

      component.onUserSaved(updatedUser);

      const users = component.users();
      expect(users[0]).toEqual(updatedUser);
      expect(users.length).toBe(mockUsers.length);
    });

    it('should add new user at the beginning of the list when creating', () => {
      component.editingUser.set(null);

      const newUser: User = {
        id: 'user-4',
        employeeId: 'EMP004',
        name: 'Alice Brown',
        email: 'alice@example.com',
        role: UserRole.Employee,
        departmentId: 'dept-1',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      component.onUserSaved(newUser);

      const users = component.users();
      expect(users[0]).toEqual(newUser);
      expect(users.length).toBe(mockUsers.length + 1);
    });

    it('should close modal after saving user', () => {
      const newUser: User = mockUsers[0];
      component.userFormVisible.set(true);
      component.editingUser.set(null);

      component.onUserSaved(newUser);

      expect(component.userFormVisible()).toBeFalse();
      expect(component.editingUser()).toBeNull();
    });

    it('should apply filters after saving user', () => {
      component.selectedRoleFilter.set(UserRole.Admin);
      component.onRoleFilterChange();
      const filteredBefore = component.filteredUsers().length;

      component.editingUser.set(null);
      const newAdmin: User = {
        id: 'user-4',
        employeeId: 'EMP004',
        name: 'New Admin',
        email: 'admin2@example.com',
        role: UserRole.Admin,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      component.onUserSaved(newAdmin);

      expect(component.filteredUsers().length).toBe(filteredBefore + 1);
    });

    it('should not duplicate user if not found in list during edit', () => {
      const nonExistentUser: User = {
        id: 'non-existent',
        employeeId: 'EMP999',
        name: 'Non-existent',
        email: 'none@example.com',
        role: UserRole.Employee,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      component.editingUser.set(nonExistentUser);

      const updatedUser: User = {
        ...nonExistentUser,
        name: 'Updated',
      };

      component.onUserSaved(updatedUser);

      const users = component.users();
      expect(users.length).toBe(mockUsers.length);
    });

    it('should maintain immutability when updating users list', () => {
      const originalUsers = component.users();
      const userToEdit = mockUsers[1];
      component.editingUser.set(userToEdit);

      const updatedUser: User = {
        ...userToEdit,
        name: 'Updated Jane',
      };

      component.onUserSaved(updatedUser);

      const newUsers = component.users();
      expect(newUsers).not.toBe(originalUsers);
    });
  });

  describe('confirmDeleteUser', () => {
    it('should call confirmationService.confirm with correct parameters', () => {
      const user = mockUsers[0];
      component.confirmDeleteUser(user);

      expect(confirmationServiceSpy.confirm).toHaveBeenCalledWith(
        jasmine.objectContaining({
          header: 'Delete User',
          icon: 'pi pi-exclamation-triangle',
        })
      );
    });

    it('should include user name in confirmation message', () => {
      const user = mockUsers[0];
      component.confirmDeleteUser(user);

      const confirmCall = confirmationServiceSpy.confirm.calls.mostRecent().args[0];
      expect(confirmCall.message).toContain(user.name);
    });

    it('should call deleteUser when accept is invoked', () => {
      fixture.detectChanges();
      const user = mockUsers[0];
      confirmationServiceSpy.confirm.and.callFake((config: any) => {
        config.accept();
        return confirmationServiceSpy;
      });

      component.confirmDeleteUser(user);

      expect(userServiceSpy.deleteUser).toHaveBeenCalledWith(user.id);
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should remove user from list on successful delete', () => {
      confirmationServiceSpy.confirm.and.callFake((config: any) => {
        config.accept();
        return confirmationServiceSpy;
      });

      component.confirmDeleteUser(mockUsers[0]);

      const users = component.users();
      expect(users.find(u => u.id === mockUsers[0].id)).toBeUndefined();
      expect(users.length).toBe(mockUsers.length - 1);
    });

    it('should show success toast on successful delete', () => {
      confirmationServiceSpy.confirm.and.callFake((config: any) => {
        config.accept();
        return confirmationServiceSpy;
      });

      component.confirmDeleteUser(mockUsers[0]);

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'success',
          summary: 'Success',
        })
      );
    });

    it('should set submitting to false after successful delete', () => {
      confirmationServiceSpy.confirm.and.callFake((config: any) => {
        config.accept();
        return confirmationServiceSpy;
      });

      component.confirmDeleteUser(mockUsers[0]);

      expect(component.submitting()).toBeFalse();
    });

    it('should apply filters after successful delete', () => {
      component.selectedRoleFilter.set(UserRole.Employee);
      component.onRoleFilterChange();
      const filteredBefore = component.filteredUsers().length;

      confirmationServiceSpy.confirm.and.callFake((config: any) => {
        config.accept();
        return confirmationServiceSpy;
      });

      component.confirmDeleteUser(mockUsers[1]); // Delete an Employee

      expect(component.filteredUsers().length).toBe(filteredBefore - 1);
    });

    it('should show error toast when delete fails', () => {
      userServiceSpy.deleteUser.and.returnValue(
        throwError(() => new Error('Delete failed'))
      );
      confirmationServiceSpy.confirm.and.callFake((config: any) => {
        config.accept();
        return confirmationServiceSpy;
      });

      component.confirmDeleteUser(mockUsers[0]);

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'error',
          summary: 'Error',
        })
      );
    });

    it('should set submitting to false after delete error', () => {
      userServiceSpy.deleteUser.and.returnValue(
        throwError(() => new Error('Delete failed'))
      );
      confirmationServiceSpy.confirm.and.callFake((config: any) => {
        config.accept();
        return confirmationServiceSpy;
      });

      component.confirmDeleteUser(mockUsers[0]);

      expect(component.submitting()).toBeFalse();
    });
  });

  describe('getRoleSeverity', () => {
    it('should return "danger" for Admin role', () => {
      expect(component.getRoleSeverity(UserRole.Admin)).toBe('danger');
    });

    it('should return "info" for Employee role', () => {
      expect(component.getRoleSeverity(UserRole.Employee)).toBe('info');
    });
  });

  describe('getUserProject', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return project name for valid projectId', () => {
      const result = component.getUserProject(mockUsers[1]);
      expect(result).toBe('Project Alpha');
    });

    it('should return "-" when user has no projectId', () => {
      const result = component.getUserProject(mockUsers[0]);
      expect(result).toBe('-');
    });

    it('should return "Unknown Project" when project not found', () => {
      const user: User = { ...mockUsers[1], projectId: 'non-existent' };
      const result = component.getUserProject(user);
      expect(result).toBe('Unknown Project');
    });
  });

  describe('getUserDepartment', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return department name for valid departmentId', () => {
      const result = component.getUserDepartment(mockUsers[1]);
      expect(result).toBe('Engineering');
    });

    it('should return "-" when user has no departmentId', () => {
      const result = component.getUserDepartment(mockUsers[0]);
      expect(result).toBe('-');
    });

    it('should return "Unknown Department" when department not found', () => {
      const user: User = { ...mockUsers[1], departmentId: 'non-existent' };
      const result = component.getUserDepartment(user);
      expect(result).toBe('Unknown Department');
    });
  });

  describe('template rendering', () => {
    it('should display page title', () => {
      fixture.detectChanges();

      const pageTitle = fixture.debugElement.query(By.css('.page-header h1'));
      expect(pageTitle).toBeTruthy();
      expect(pageTitle.nativeElement.textContent.trim()).toBe('User Management');
    });

    it('should display add user button', () => {
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

    it('should call openAddUserModal when add button is clicked', () => {
      fixture.detectChanges();
      spyOn(component, 'openAddUserModal');

      const addButton = fixture.debugElement.query(By.css('.page-header p-button'));
      addButton.triggerEventHandler('onClick', null);

      expect(component.openAddUserModal).toHaveBeenCalled();
    });

    it('should render role filter section', () => {
      fixture.detectChanges();

      const filterSection = fixture.debugElement.query(By.css('.filters-section'));
      expect(filterSection).toBeTruthy();
    });

    it('should show initial loading spinner when loading and no users', () => {
      userServiceSpy.getUsers.and.returnValue(of([]));
      const testFixture = TestBed.createComponent(UsersComponent);
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      testComponent.loading.set(true);
      testComponent.filteredUsers.set([]);
      testFixture.detectChanges();

      const spinner = testFixture.debugElement.query(By.css('.initial-loading app-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('should not show initial loading spinner when users exist', () => {
      fixture.detectChanges();
      component.loading.set(true);
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('.initial-loading'));
      expect(spinner).toBeFalsy();
    });

    it('should display users table when data is loaded', () => {
      fixture.detectChanges();

      const table = fixture.debugElement.query(By.css('p-table'));
      expect(table).toBeTruthy();
    });

    it('should display correct number of users in table', () => {
      fixture.detectChanges();

      const table = fixture.debugElement.query(By.css('p-table'));
      expect(table.componentInstance.value.length).toBe(mockUsers.length);
    });

    it('should display employee IDs in table', () => {
      fixture.detectChanges();

      const employeeIds = fixture.debugElement.queryAll(By.css('.employee-id'));
      expect(employeeIds.length).toBe(mockUsers.length);
      expect(employeeIds[0].nativeElement.textContent.trim()).toBe('EMP001');
    });

    it('should display edit and delete buttons for each user', () => {
      fixture.detectChanges();

      const actionButtons = fixture.debugElement.queryAll(By.css('.action-buttons'));
      expect(actionButtons.length).toBe(mockUsers.length);
      actionButtons.forEach(actionGroup => {
        const buttons = actionGroup.queryAll(By.css('p-button'));
        expect(buttons.length).toBe(2);
      });
    });

    it('should call openEditUserModal when edit button is clicked', () => {
      spyOn(component, 'openEditUserModal');
      fixture.detectChanges();

      const editButton = fixture.debugElement.query(By.css('.action-buttons p-button'));
      editButton.triggerEventHandler('onClick', null);

      expect(component.openEditUserModal).toHaveBeenCalledWith(mockUsers[0]);
    });

    it('should disable action buttons when loading', () => {
      fixture.detectChanges();
      component.loading.set(true);
      fixture.detectChanges();

      const actionButtons = fixture.debugElement.queryAll(By.css('.action-buttons p-button'));
      actionButtons.forEach((button) => {
        expect(button.componentInstance.disabled).toBeTrue();
      });
    });

    it('should disable action buttons when submitting', () => {
      fixture.detectChanges();
      component.submitting.set(true);
      fixture.detectChanges();

      const actionButtons = fixture.debugElement.queryAll(By.css('.action-buttons p-button'));
      actionButtons.forEach((button) => {
        expect(button.componentInstance.disabled).toBeTrue();
      });
    });

    it('should display empty state when no users at all', () => {
      userServiceSpy.getUsers.and.returnValue(of([]));
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyState).toBeTruthy();
      expect(emptyState.nativeElement.textContent).toContain('No Users Yet');
    });

    it('should display filter empty state when users exist but none match filter', () => {
      fixture.detectChanges();
      component.users.set(mockUsers);
      component.filteredUsers.set([]);
      fixture.detectChanges();

      const emptyStates = fixture.debugElement.queryAll(By.css('.empty-state'));
      const filterEmptyState = emptyStates.find(el =>
        el.nativeElement.textContent.includes('No Users Found')
      );
      expect(filterEmptyState).toBeTruthy();
    });

    it('should render user form modal component', () => {
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('app-user-form-modal'));
      expect(modal).toBeTruthy();
    });

    it('should bind visible property to modal', () => {
      component.userFormVisible.set(true);
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('app-user-form-modal'));
      expect(modal.componentInstance.visible()).toBeTrue();
    });

    it('should pass editingUser to modal', () => {
      const userToEdit = mockUsers[0];
      component.editingUser.set(userToEdit);
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('app-user-form-modal'));
      expect(modal.componentInstance.editingUser()).toEqual(userToEdit);
    });

    it('should pass projects to modal', () => {
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('app-user-form-modal'));
      expect(modal.componentInstance.projects()).toEqual(mockProjects);
    });

    it('should pass departments to modal', () => {
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('app-user-form-modal'));
      expect(modal.componentInstance.departments()).toEqual(mockDepartments);
    });
  });
});
