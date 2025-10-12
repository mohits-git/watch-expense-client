import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  input,
  output,
  model,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import {
  AutoCompleteModule,
  AutoCompleteCompleteEvent,
} from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';
import { Department, User } from '@/shared/types';
import { DepartmentService } from '@/shared/services/department.service';
import { FieldErrorMessagesComponent } from '@/shared/components/field-error-messages/field-error-messages.component';
import {
  getFieldValidationErrors,
  isFieldInvalid,
  markFormGroupTouched,
} from '@/shared/utils/validation.util';
import {
  DEPARTMENT_CONSTANTS,
  API_MESSAGES,
  TOAST_TYPES,
  TOAST_SUMMARIES,
  DEFAULTS,
} from '@/shared/constants';
import { FormState, DepartmentForm } from '@/shared/types';

@Component({
  selector: 'app-department-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    AutoCompleteModule,
    ButtonModule,
    MessageModule,
    DialogModule,
    FloatLabelModule,
    FieldErrorMessagesComponent,
  ],
  templateUrl: './department-form-modal.component.html',
  styleUrl: './department-form-modal.component.scss',
})
export class DepartmentFormModalComponent implements OnInit, OnChanges {
  visible = model.required<boolean>();
  editingDepartment = input<Department | null>(null);
  users = input<User[]>([]);

  departmentSaved = output<Department>();
  formClose = output<void>();

  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);
  private messageService = inject(MessageService);

  departmentForm!: FormGroup<DepartmentForm>;
  formState = signal<FormState>(DEFAULTS.FORM_STATE);
  filteredManagers: User[] = [];
  readonly constants = DEPARTMENT_CONSTANTS;

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingDepartment'] && this.departmentForm) {
      this.populateForm();
    }
    if (changes['users']) {
      this.filteredManagers = [...this.users()];
    }
  }

  private initializeForm(): void {
    this.departmentForm = this.fb.group({
      name: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
        nonNullable: true,
      }),
      budget: this.fb.control(0, {
        validators: [Validators.required, Validators.min(0)],
        nonNullable: true,
      }),
      managerId: this.fb.control<string | { id: string; name: string } | null>(
        null,
        {
          validators: [Validators.required],
        },
      ),
    });
    this.populateForm();
  }

  private populateForm(): void {
    this.formState.set(DEFAULTS.FORM_STATE);
    const editingDepartmentValue = this.editingDepartment();
    if (editingDepartmentValue && this.departmentForm) {
      const managerObj = this.users().find(
        (u) => u.id === editingDepartmentValue.managerId,
      );
      this.departmentForm.patchValue({
        name: editingDepartmentValue.name,
        budget: editingDepartmentValue.budget,
        managerId: managerObj || null,
      });
    } else {
      this.departmentForm?.patchValue({
        name: '',
        budget: 0,
        managerId: null,
      });
    }
  }

  filterManagers(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase().trim();
    const allUsers = this.users();
    if (!query) {
      this.filteredManagers = [...allUsers];
    } else {
      this.filteredManagers = allUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query),
      );
    }
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      this.formState.update((prev) => ({ ...prev, submitted: true }));
      markFormGroupTouched(this.departmentForm);
      return;
    }

    this.formState.set({ submitted: true, loading: true });
    const rawFormValue = this.departmentForm.getRawValue();
    const editingDepartmentValue = this.editingDepartment();

    const managerIdValue =
      typeof rawFormValue.managerId === 'string'
        ? rawFormValue.managerId
        : (rawFormValue.managerId?.id ?? '');

    const formValue: Partial<Department> = {
      name: rawFormValue.name,
      budget: rawFormValue.budget,
      managerId: managerIdValue,
    };

    if (editingDepartmentValue) {
      this.departmentService
        .updateDepartment(editingDepartmentValue.id, formValue)
        .subscribe({
          next: () => {
            const successMessage = API_MESSAGES.ADMIN.DEPARTMENT.UPDATE_SUCCESS;
            this.messageService.add({
              severity: TOAST_TYPES.SUCCESS,
              summary: TOAST_SUMMARIES.SUCCESS,
              detail: successMessage,
            });
            const updatedDepartment: Department = {
              ...editingDepartmentValue,
              ...formValue,
            } as Department;
            this.departmentSaved.emit(updatedDepartment);
            this.closeModal();
          },
          error: () => {
            const errorMessage = API_MESSAGES.ADMIN.DEPARTMENT.UPDATE_ERROR;
            this.messageService.add({
              severity: TOAST_TYPES.ERROR,
              summary: TOAST_SUMMARIES.ERROR,
              detail: errorMessage,
            });
            this.formState.update((prev) => ({ ...prev, loading: false }));
          },
          complete: () => {
            this.formState.update((prev) => ({ ...prev, loading: false }));
          },
        });
    } else {
      this.departmentService
        .createDepartment(
          formValue as Omit<Department, 'id' | 'createdAt' | 'updatedAt'>,
        )
        .subscribe({
          next: (departmentId: string) => {
            const successMessage = API_MESSAGES.ADMIN.DEPARTMENT.CREATE_SUCCESS;
            this.messageService.add({
              severity: TOAST_TYPES.SUCCESS,
              summary: TOAST_SUMMARIES.SUCCESS,
              detail: successMessage,
            });
            const newDepartment: Department = {
              id: departmentId,
              ...formValue,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            } as Department;
            this.departmentSaved.emit(newDepartment);
            this.closeModal();
            this.departmentForm.reset();
          },
          error: () => {
            const errorMessage = API_MESSAGES.ADMIN.DEPARTMENT.CREATE_ERROR;
            this.messageService.add({
              severity: TOAST_TYPES.ERROR,
              summary: TOAST_SUMMARIES.ERROR,
              detail: errorMessage,
            });
            this.formState.update((prev) => ({ ...prev, loading: false }));
          },
          complete: () => {
            this.formState.update((prev) => ({ ...prev, loading: false }));
          },
        });
    }
  }

  closeModal(): void {
    this.visible.set(false);
    this.formClose.emit();
  }

  onCancel(): void {
    this.formState.set(DEFAULTS.FORM_STATE);
    this.closeModal();
  }

  isFieldInvalid(fieldName: string): boolean {
    return isFieldInvalid(this.departmentForm.get(fieldName));
  }

  getFieldErrors(fieldName: string): string[] {
    const control = this.departmentForm.get(fieldName);
    const fieldLabel = this.getFieldLabel(fieldName);
    return getFieldValidationErrors(control, fieldLabel);
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: this.constants.FORM_LABELS.NAME,
      budget: this.constants.FORM_LABELS.BUDGET,
      managerId: this.constants.FORM_LABELS.MANAGER,
    };
    return labels[fieldName] || fieldName;
  }
}
