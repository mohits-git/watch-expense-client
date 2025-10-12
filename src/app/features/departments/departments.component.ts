import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { Department, User } from '@/shared/types';
import { DepartmentService } from '@/shared/services/department.service';
import { UserService } from '@/shared/services/user.service';
import { SpinnerComponent } from '@/shared/components/spinner/spinner.component';
import { DepartmentFormModalComponent } from './components/department-form-modal/department-form-modal.component';
import {
  DEPARTMENT_CONSTANTS,
  API_MESSAGES,
  TOAST_TYPES,
  TOAST_SUMMARIES,
} from '@/shared/constants';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    TooltipModule,
    ConfirmDialogModule,
    SpinnerComponent,
    DepartmentFormModalComponent,
    CurrencyPipe,
  ],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.scss',
})
export class DepartmentsComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  departments = signal<Department[]>([]);
  users = signal<User[]>([]);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  departmentFormVisible = signal<boolean>(false);
  editingDepartment = signal<Department | null>(null);

  readonly constants = DEPARTMENT_CONSTANTS;

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loading.set(true);

    forkJoin({
      departments: this.departmentService.getDepartments(),
      users: this.userService.getUsers(),
    }).subscribe({
      next: ({ departments, users }) => {
        this.departments.set(departments);
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load initial data:', error);
        this.messageService.add({
          severity: TOAST_TYPES.ERROR,
          summary: TOAST_SUMMARIES.ERROR,
          detail: 'Failed to load data. Please refresh the page.',
        });
        this.loading.set(false);
      },
    });
  }

  openAddDepartmentModal(): void {
    this.editingDepartment.set(null);
    this.departmentFormVisible.set(true);
  }

  openEditDepartmentModal(department: Department): void {
    this.editingDepartment.set({ ...department });
    this.departmentFormVisible.set(true);
  }

  onDepartmentFormClose(): void {
    this.departmentFormVisible.set(false);
    this.editingDepartment.set(null);
  }

  onDepartmentSaved(savedDepartment: Department): void {
    const editingDepartmentValue = this.editingDepartment();
    if (editingDepartmentValue) {
      const departmentIndex = this.departments().findIndex(
        (d) => d.id === editingDepartmentValue.id,
      );
      if (departmentIndex !== -1) {
        this.departments.update((departments) => {
          const updated = [...departments];
          updated[departmentIndex] = savedDepartment;
          return updated;
        });
      }
    } else {
      this.departments.update((departments) => [
        savedDepartment,
        ...departments,
      ]);
    }
    this.onDepartmentFormClose();
  }

  confirmDeleteDepartment(department: Department): void {
    this.confirmationService.confirm({
      message: `${API_MESSAGES.ADMIN.DEPARTMENT.DELETE_CONFIRMATION} "${department.name}" will be permanently removed.`,
      header: 'Delete Department',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteDepartment(department);
      },
    });
  }

  private deleteDepartment(department: Department): void {
    this.submitting.set(true);

    this.departmentService.deleteDepartment(department.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: TOAST_TYPES.SUCCESS,
          summary: TOAST_SUMMARIES.SUCCESS,
          detail: API_MESSAGES.ADMIN.DEPARTMENT.DELETE_SUCCESS,
        });
        this.departments.update((departments) =>
          departments.filter((d) => d.id !== department.id),
        );
      },
      error: (error) => {
        console.error('Failed to delete department:', error);
        this.messageService.add({
          severity: TOAST_TYPES.ERROR,
          summary: TOAST_SUMMARIES.ERROR,
          detail: API_MESSAGES.ADMIN.DEPARTMENT.DELETE_ERROR,
        });
      },
      complete: () => {
        this.submitting.set(false);
      },
    });
  }

  getDepartmentManager(department: Department): string {
    if (!department.managerId) return '-';
    const manager = this.users().find((u) => u.id === department.managerId);
    return manager?.name || 'Unknown Manager';
  }
}
