import { Component, OnInit, OnChanges, SimpleChanges, inject, signal, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';
import { Project, User, Department } from '@/shared/types';
import { ProjectService } from '@/shared/services/project.service';
import { FieldErrorMessagesComponent } from '@/shared/components/field-error-messages/field-error-messages.component';
import {
  getFieldValidationErrors,
  isFieldInvalid,
  markFormGroupTouched
} from '@/shared/utils/validation.util';
import {
  PROJECT_CONSTANTS,
  API_MESSAGES,
  TOAST_TYPES,
  TOAST_SUMMARIES,
  DEFAULTS
} from '@/shared/constants';
import { FormState, ProjectForm } from '@/shared/types';

@Component({
  selector: 'app-project-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextarea,
    InputNumberModule,
    CalendarModule,
    AutoCompleteModule,
    ButtonModule,
    MessageModule,
    DialogModule,
    FloatLabelModule,
    FieldErrorMessagesComponent,
  ],
  templateUrl: './project-form-modal.component.html',
  styleUrl: './project-form-modal.component.scss'
})
export class ProjectFormModalComponent implements OnInit, OnChanges {
  visible = model.required<boolean>();
  editingProject = input<Project | null>(null);
  users = input<User[]>([]);
  departments = input<Department[]>([]);

  projectSaved = output<Project>();
  formClose = output<void>();

  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private messageService = inject(MessageService);

  projectForm!: FormGroup<ProjectForm>;
  formState = signal<FormState>(DEFAULTS.FORM_STATE);
  filteredManagers: User[] = [];
  filteredDepartments: Department[] = [];
  readonly constants = PROJECT_CONSTANTS;

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingProject'] && this.projectForm) {
      this.populateForm();
    }
    if (changes['users']) {
      this.filteredManagers = [...this.users()];
    }
    if (changes['departments']) {
      this.filteredDepartments = [...this.departments()];
    }
  }

  private initializeForm(): void {
    this.projectForm = this.fb.group({
      name: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
        nonNullable: true
      }),
      description: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(10), Validators.maxLength(500)],
        nonNullable: true
      }),
      budget: this.fb.control(0, {
        validators: [Validators.required, Validators.min(0)],
        nonNullable: true
      }),
      startDate: this.fb.control<Date | null>(null, {
        validators: [Validators.required]
      }),
      endDate: this.fb.control<Date | null>(null, {
        validators: [Validators.required]
      }),
      projectManagerId: this.fb.control<string | { id: string; name: string } | null>(null, {
        validators: [Validators.required]
      }),
      departmentId: this.fb.control<string | { id: string; name: string } | null>(null, {
        validators: [Validators.required]
      })
    });
    this.populateForm();
  }

  private populateForm(): void {
    this.formState.set(DEFAULTS.FORM_STATE);
    const editingProjectValue = this.editingProject();
    if (editingProjectValue && this.projectForm) {
      const managerObj = this.users().find(u => u.id === editingProjectValue.projectManagerId);
      const departmentObj = this.departments().find(d => d.id === editingProjectValue.departmentId);
      this.projectForm.patchValue({
        name: editingProjectValue.name,
        description: editingProjectValue.description,
        budget: editingProjectValue.budget,
        startDate: new Date(editingProjectValue.startDate),
        endDate: new Date(editingProjectValue.endDate),
        projectManagerId: managerObj || null,
        departmentId: departmentObj || null
      });
    } else {
      this.projectForm?.patchValue({
        name: '',
        description: '',
        budget: 0,
        startDate: null,
        endDate: null,
        projectManagerId: null,
        departmentId: null
      });
    }
  }

  filterManagers(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase().trim();
    const allUsers = this.users();
    if (!query) {
      this.filteredManagers = [...allUsers];
    } else {
      this.filteredManagers = allUsers.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
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

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.formState.update((prev) => ({ ...prev, submitted: true }));
      markFormGroupTouched(this.projectForm);
      return;
    }

    this.formState.set({ submitted: true, loading: true });
    const rawFormValue = this.projectForm.getRawValue();
    const editingProjectValue = this.editingProject();

    const managerIdValue = typeof rawFormValue.projectManagerId === 'string'
      ? rawFormValue.projectManagerId
      : rawFormValue.projectManagerId?.id ?? '';
    const departmentIdValue = typeof rawFormValue.departmentId === 'string'
      ? rawFormValue.departmentId
      : rawFormValue.departmentId?.id ?? '';

    const formValue: Partial<Project> = {
      name: rawFormValue.name,
      description: rawFormValue.description,
      budget: rawFormValue.budget,
      startDate: rawFormValue.startDate?.getTime() ?? Date.now(),
      endDate: rawFormValue.endDate?.getTime() ?? Date.now(),
      projectManagerId: managerIdValue,
      departmentId: departmentIdValue
    };

    if (editingProjectValue) {
      this.projectService.updateProject(editingProjectValue.id, formValue).subscribe({
        next: () => {
          const successMessage = API_MESSAGES.ADMIN.PROJECT.UPDATE_SUCCESS;
          this.messageService.add({
            severity: TOAST_TYPES.SUCCESS,
            summary: TOAST_SUMMARIES.SUCCESS,
            detail: successMessage
          });
          const updatedProject: Project = { ...editingProjectValue, ...formValue } as Project;
          this.projectSaved.emit(updatedProject);
          this.closeModal();
          this.projectForm.reset();
        },
        error: () => {
          const errorMessage = API_MESSAGES.ADMIN.PROJECT.UPDATE_ERROR;
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
      this.projectService.createProject(formValue as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>).subscribe({
        next: (projectId: string) => {
          const successMessage = API_MESSAGES.ADMIN.PROJECT.CREATE_SUCCESS;
          this.messageService.add({
            severity: TOAST_TYPES.SUCCESS,
            summary: TOAST_SUMMARIES.SUCCESS,
            detail: successMessage
          });
          const newProject: Project = {
            id: projectId,
            ...formValue,
            createdAt: Date.now(),
            updatedAt: Date.now()
          } as Project;
          this.projectSaved.emit(newProject);
          this.closeModal();
          this.projectForm.reset();
        },
        error: () => {
          const errorMessage = API_MESSAGES.ADMIN.PROJECT.CREATE_ERROR;
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

  isFieldInvalid(fieldName: string): boolean {
    return isFieldInvalid(this.projectForm.get(fieldName));
  }

  getFieldErrors(fieldName: string): string[] {
    const control = this.projectForm.get(fieldName);
    const fieldLabel = this.getFieldLabel(fieldName);
    return getFieldValidationErrors(control, fieldLabel);
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: this.constants.FORM_LABELS.NAME,
      description: this.constants.FORM_LABELS.DESCRIPTION,
      budget: this.constants.FORM_LABELS.BUDGET,
      startDate: this.constants.FORM_LABELS.START_DATE,
      endDate: this.constants.FORM_LABELS.END_DATE,
      projectManagerId: this.constants.FORM_LABELS.PROJECT_MANAGER,
      departmentId: this.constants.FORM_LABELS.DEPARTMENT
    };
    return labels[fieldName] || fieldName;
  }
}
