import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SpinnerComponent } from '@/shared/components/spinner/spinner.component';
import { User, Project, Department } from '@/shared/types';
import { UserRole } from '@/shared/enums';
import { UserService } from '@/shared/services/user.service';
import { ProjectService } from '@/shared/services/project.service';
import { DepartmentService } from '@/shared/services/department.service';
import { UserFormModalComponent } from './components/user-form-modal/user-form-modal.component';
import {
  USER_CONSTANTS,
  API_MESSAGES,
  TOAST_TYPES,
  TOAST_SUMMARIES
} from '@/shared/constants';

type UserRoleFilter = UserRole | 'ALL';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    SelectButtonModule,
    TagModule,
    DialogModule,
    MessageModule,
    ConfirmDialogModule,
    TooltipModule,
    SpinnerComponent,
    UserFormModalComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private projectService = inject(ProjectService);
  private departmentService = inject(DepartmentService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  readonly constants = USER_CONSTANTS;
  readonly UserRole = UserRole;
  roleFilterOptions = [...USER_CONSTANTS.ROLE_OPTIONS];

  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  selectedRoleFilter = signal<UserRoleFilter>('ALL');

  projects = signal<Project[]>([]);
  departments = signal<Department[]>([]);

  userFormVisible = signal<boolean>(false);
  editingUser = signal<User | null>(null);
  loading = signal<boolean>(true);
  submitting = signal<boolean>(false);

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loading.set(true);
    forkJoin({
      users: this.userService.getUsers(),
      projects: this.projectService.getProjects(),
      departments: this.departmentService.getDepartments()
    }).subscribe({
      next: ({ users, projects, departments }) => {
        this.users.set(users);
        this.projects.set(projects);
        this.departments.set(departments);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load initial data:', error);
        this.messageService.add({
          severity: TOAST_TYPES.ERROR,
          summary: TOAST_SUMMARIES.ERROR,
          detail: 'Failed to load data. Please refresh the page.'
        });
        this.loading.set(false);
      }
    });
  }

  onRoleFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    const users = this.users();
    const roleFilter = this.selectedRoleFilter();
    let filtered = users;
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    this.filteredUsers.set(filtered);
  }

  openAddUserModal(): void {
    this.editingUser.set(null);
    this.userFormVisible.set(true);
  }

  openEditUserModal(user: User): void {
    this.editingUser.set({ ...user });
    this.userFormVisible.set(true);
  }

  onUserFormClose(): void {
    this.userFormVisible.set(false);
    this.editingUser.set(null);
  }

  onUserSaved(savedUser: User): void {
    const editingUserValue = this.editingUser();
    if (editingUserValue) {
      const userIndex = this.users().findIndex(u => u.id === editingUserValue.id);
      if (userIndex !== -1) {
        this.users.update(users => {
          const updated = [...users];
          updated[userIndex] = savedUser;
          return updated;
        });
      }
    } else {
      this.users.update(users => [savedUser, ...users]);
    }
    this.applyFilters();
    this.onUserFormClose();
  }

  confirmDeleteUser(user: User): void {
    this.confirmationService.confirm({
      message: `${API_MESSAGES.ADMIN.USER.DELETE_CONFIRMATION} "${user.name}" will be permanently removed.`,
      header: 'Delete User',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteUser(user);
      }
    });
  }

  private deleteUser(user: User): void {
    this.submitting.set(true);

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: TOAST_TYPES.SUCCESS,
          summary: TOAST_SUMMARIES.SUCCESS,
          detail: API_MESSAGES.ADMIN.USER.DELETE_SUCCESS
        });
        this.users.update(users => users.filter(u => u.id !== user.id));
        this.applyFilters();
      },
      error: (error) => {
        console.error('Failed to delete user:', error);
        this.messageService.add({
          severity: TOAST_TYPES.ERROR,
          summary: TOAST_SUMMARIES.ERROR,
          detail: API_MESSAGES.ADMIN.USER.DELETE_ERROR
        });
      },
      complete: () => {
        this.submitting.set(false);
      }
    });
  }

  getRoleSeverity(role: UserRole): string {
    switch (role) {
      case UserRole.Admin:
        return 'danger';
      case UserRole.Employee:
        return 'info';
      default:
        return 'secondary';
    }
  }

  getUserProject(user: User): string {
    if (!user.projectId) return '-';
    const project = this.projects().find(p => p.id === user.projectId);
    return project?.name || 'Unknown Project';
  }

  getUserDepartment(user: User): string {
    if (!user.departmentId) return '-';
    const department = this.departments().find(d => d.id === user.departmentId);
    return department?.name || 'Unknown Department';
  }
}
