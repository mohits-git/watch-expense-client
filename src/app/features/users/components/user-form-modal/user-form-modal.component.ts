import { Component, OnInit, OnChanges, SimpleChanges, inject, signal, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';
import { User, Project, Department } from '@/shared/types';
import { UserRole } from '@/shared/enums';
import { UserService } from '@/shared/services/user.service';
import { FieldErrorMessagesComponent } from '@/shared/components/field-error-messages/field-error-messages.component';
import {
  getFieldValidationErrors,
  isFieldInvalid,
  markFormGroupTouched
} from '@/shared/utils/validation.util';
import {
  USER_CONSTANTS,
  API_MESSAGES,
  TOAST_TYPES,
  TOAST_SUMMARIES,
  DEFAULTS
} from '@/shared/constants';
import { FormState, UserForm } from '@/shared/types';
import { validatePassword } from '@/shared/validators/password-validator';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    AutoCompleteModule,
    ButtonModule,
    MessageModule,
    DialogModule,
    FloatLabelModule,
    FieldErrorMessagesComponent,
  ],
  templateUrl: './user-form-modal.component.html',
  styleUrl: './user-form-modal.component.scss'
})
export class UserFormModalComponent implements OnInit, OnChanges {
  visible = model.required<boolean>();
  editingUser = input<User | null>(null);
  projects = input<Project[]>([]);
  departments = input<Department[]>([]);

  userSaved = output<User>();
  formClose = output<void>();

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private messageService = inject(MessageService);

  userForm!: FormGroup<UserForm>;
  formState = signal<FormState>(DEFAULTS.FORM_STATE);
  filteredProjects = signal<Project[]>([]);
  roles: Array<{ label: string; value: string }> = [];
  filteredDepartments: Department[] = [];
  filteredProjectsList: Project[] = [];
  readonly constants = USER_CONSTANTS;
  readonly roleOptions = USER_CONSTANTS.ROLE_OPTIONS.filter(role => role.value !== 'ALL');
  readonly UserRole = UserRole;

  ngOnInit(): void {
    this.initializeForm();
    this.roles = [...this.roleOptions];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingUser'] && this.userForm) {
      this.populateForm();
    }
    if (changes['projects'] || changes['departments']) {
      this.filteredDepartments = [...this.departments()];
      this.updateFilteredProjects();
    }
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      employeeId: this.fb.control('', {
        validators: [Validators.required, Validators.maxLength(20)],
        nonNullable: true
      }),
      name: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
        nonNullable: true
      }),
      email: this.fb.control('', {
        validators: [Validators.required, Validators.email],
        nonNullable: true
      }),
      password: this.fb.control('', {
        validators: [Validators.required, validatePassword],
        nonNullable: true
      }),
      role: this.fb.control<string | { label: string; value: string } | null>(null, {
        validators: [Validators.required]
      }),
      departmentId: this.fb.control<string | { id: string; name: string } | null>(null, {
        validators: [Validators.required]
      }),
      projectId: this.fb.control<string | { id: string; name: string } | null>(null)
    });
    this.userForm.get('role')?.valueChanges.subscribe((role) => {
      this.handleRoleChange(role);
    });
    this.userForm.get('departmentId')?.valueChanges.subscribe(() => {
      this.updateFilteredProjects();
    });
    this.populateForm();
  }

  private handleRoleChange(role: string | { label: string; value: string } | null): void {
    const roleValue = typeof role === 'string' ? role : role?.value;
    const departmentControl = this.userForm.get('departmentId');
    const projectControl = this.userForm.get('projectId');

    if (roleValue === UserRole.Employee) {
      departmentControl?.setValidators([Validators.required]);
    } else {
      departmentControl?.clearValidators();
      departmentControl?.setValue(null);
      projectControl?.setValue(null);
      this.filteredProjects.set([]);
      this.filteredProjectsList = [];
    }
    departmentControl?.updateValueAndValidity();
  }

  private populateForm(): void {
    this.formState.set(DEFAULTS.FORM_STATE);
    const editingUserValue = this.editingUser();
    if (editingUserValue && this.userForm) {
      const roleObj = this.roleOptions.find(r => r.value === editingUserValue.role);
      const departmentObj = this.departments().find(d => d.id === editingUserValue.departmentId);
      const projectObj = this.projects().find(p => p.id === editingUserValue.projectId);
      this.userForm.patchValue({
        employeeId: editingUserValue.employeeId,
        name: editingUserValue.name,
        email: editingUserValue.email,
        password: '',
        role: roleObj,
        departmentId: departmentObj,
        projectId: projectObj || null
      });
      if (editingUserValue) {
        this.userForm.get('employeeId')?.disable();
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
      }
    } else {
      const defaultRole = this.roleOptions.find(r => r.value === UserRole.Employee);
      this.userForm?.patchValue({
        employeeId: '',
        name: '',
        email: '',
        password: '',
        role: defaultRole,
        departmentId: null,
        projectId: null
      });
      this.userForm.get('employeeId')?.enable();
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  private updateFilteredProjects(): void {
    const selectedDepartment = this.userForm?.get('departmentId')?.value;
    const departmentId = typeof selectedDepartment === 'string'
      ? selectedDepartment
      : selectedDepartment?.id;

    if (departmentId) {
      const filtered = this.projects().filter((project: Project) =>
        project.departmentId === departmentId
      );
      this.filteredProjects.set(filtered);
      this.filteredProjectsList = [...filtered];
      const currentProject = this.userForm?.get('projectId')?.value;
      const currentProjectId = typeof currentProject === 'string'
        ? currentProject
        : currentProject?.id;

      if (currentProjectId && !filtered.find((p: Project) => p.id === currentProjectId)) {
        this.userForm?.get('projectId')?.setValue(null);
      }
    } else {
      this.filteredProjects.set([]);
      this.filteredProjectsList = [];
      this.userForm?.get('projectId')?.setValue(null);
    }
  }

  filterRoles(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase().trim();
    if (!query) {
      this.roles = [...this.roleOptions];
    } else {
      this.roles = this.roleOptions.filter(role =>
        role.label.toLowerCase().includes(query)
      );
    }
  }
  filterDepartments(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase().trim();
    const allDepartments = this.departments();
    if (!query) {
      this.filteredDepartments = [...allDepartments];
    } else {
      this.filteredDepartments = allDepartments.filter(dept =>
        dept.name.toLowerCase().includes(query)
      );
    }
  }
  filterProjects(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase().trim();
    const availableProjects = this.filteredProjects();
    if (!query) {
      this.filteredProjectsList = [...availableProjects];
    } else {
      this.filteredProjectsList = availableProjects.filter(proj =>
        proj.name.toLowerCase().includes(query)
      );
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.formState.update((prev) => ({ ...prev, submitted: true }));
      markFormGroupTouched(this.userForm);
      return;
    }

    this.formState.set({ submitted: true, loading: true });
    const rawFormValue = this.userForm.getRawValue();
    const editingUserValue = this.editingUser();

    const roleValue = typeof rawFormValue.role === 'string'
      ? rawFormValue.role
      : rawFormValue.role?.value ?? '';
    const departmentIdValue = typeof rawFormValue.departmentId === 'string'
      ? rawFormValue.departmentId
      : rawFormValue.departmentId?.id;
    const projectIdValue = typeof rawFormValue.projectId === 'string'
      ? rawFormValue.projectId
      : rawFormValue.projectId?.id;

    const formValue: Partial<User> = {
      employeeId: editingUserValue ? editingUserValue.employeeId : rawFormValue.employeeId,
      name: rawFormValue.name,
      email: rawFormValue.email,
      role: roleValue as UserRole,
      departmentId: departmentIdValue,
      projectId: projectIdValue
    };

    if (rawFormValue.password && rawFormValue.password.trim() !== '') {
      (formValue as any).password = rawFormValue.password;
    }

    if (!formValue.departmentId) {
      delete formValue.departmentId;
    }
    if (!formValue.projectId) {
      delete formValue.projectId;
    }

    if (editingUserValue) {
      this.userService.updateUser(editingUserValue.id, formValue).subscribe({
        next: () => {
          const successMessage = API_MESSAGES.ADMIN.USER.UPDATE_SUCCESS;
          this.messageService.add({
            severity: TOAST_TYPES.SUCCESS,
            summary: TOAST_SUMMARIES.SUCCESS,
            detail: successMessage
          });
          const updatedUser: User = { ...editingUserValue, ...formValue } as User;
          this.userSaved.emit(updatedUser);
          this.closeModal();
        },
        error: () => {
          const errorMessage = API_MESSAGES.ADMIN.USER.UPDATE_ERROR;
          this.messageService.add({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: errorMessage
          });
          this.formState.update((prev) => ({ ...prev, loading: false }));
        },
        complete: () => {
          this.formState.update((prev) => ({ ...prev, loading: false }));
        }
      });
    } else {
      this.userService.createUser(formValue).subscribe({
        next: (userId: string) => {
          const successMessage = API_MESSAGES.ADMIN.USER.CREATE_SUCCESS;
          this.messageService.add({
            severity: TOAST_TYPES.SUCCESS,
            summary: TOAST_SUMMARIES.SUCCESS,
            detail: successMessage
          });
          const newUser: User = {
            id: userId,
            ...formValue,
            createdAt: Date.now(),
            updatedAt: Date.now()
          } as User;
          this.userSaved.emit(newUser);
          this.closeModal();
          this.userForm.reset();
        },
        error: () => {
          const errorMessage = API_MESSAGES.ADMIN.USER.CREATE_ERROR;
          this.messageService.add({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: errorMessage
          });
          this.formState.update((prev) => ({ ...prev, loading: false }));
        },
        complete: () => {
          this.formState.update((prev) => ({ ...prev, loading: false }));
        }
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

  isEmployeeRole(): boolean {
    const role = this.userForm.get('role')?.value;
    const roleValue = typeof role === 'string' ? role : role?.value;
    return roleValue === UserRole.Employee;
  }

  isFieldInvalid(fieldName: string): boolean {
    return isFieldInvalid(this.userForm.get(fieldName));
  }

  getFieldErrors(fieldName: string): string[] {
    const control = this.userForm.get(fieldName);
    const fieldLabel = this.getFieldLabel(fieldName);
    return getFieldValidationErrors(control, fieldLabel);
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      employeeId: this.constants.FORM_LABELS.EMPLOYEE_ID,
      name: this.constants.FORM_LABELS.NAME,
      email: this.constants.FORM_LABELS.EMAIL,
      password: this.constants.FORM_LABELS.PASSWORD,
      role: this.constants.FORM_LABELS.ROLE,
      departmentId: this.constants.FORM_LABELS.DEPARTMENT,
      projectId: this.constants.FORM_LABELS.PROJECT
    };
    return labels[fieldName] || fieldName;
  }
}
