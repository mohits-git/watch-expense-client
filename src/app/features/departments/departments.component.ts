import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { Department } from '@/shared/types';
import { DepartmentService } from '@/shared/services/department.service';
import { SpinnerComponent } from '@/shared/components/spinner/spinner.component';
import { DepartmentFormModalComponent } from './components/department-form-modal/department-form-modal.component';
import {
  DEPARTMENT_CONSTANTS,
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
    SpinnerComponent,
    DepartmentFormModalComponent,
    CurrencyPipe,
  ],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.scss',
})
export class DepartmentsComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private messageService = inject(MessageService);

  departments = signal<Department[]>([]);
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

    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departments.set(departments);
        this.loading.set(false);
      },
      error: () => {
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
}
