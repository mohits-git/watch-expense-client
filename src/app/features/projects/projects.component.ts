import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { Project, Department } from '@/shared/types';
import { ProjectService } from '@/shared/services/project.service';
import { DepartmentService } from '@/shared/services/department.service';
import { SpinnerComponent } from '@/shared/components/spinner/spinner.component';
import { ProjectFormModalComponent } from './components/project-form-modal/project-form-modal.component';
import {
  PROJECT_CONSTANTS,
  API_MESSAGES,
  TOAST_TYPES,
  TOAST_SUMMARIES
} from '@/shared/constants';

@Component({
  selector: 'app-projects',
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
    ProjectFormModalComponent,
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  private projectService = inject(ProjectService);
  private departmentService = inject(DepartmentService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  projects = signal<Project[]>([]);
  departments = signal<Department[]>([]);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  projectFormVisible = signal<boolean>(false);
  editingProject = signal<Project | null>(null);

  readonly constants = PROJECT_CONSTANTS;

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loading.set(true);

    forkJoin({
      projects: this.projectService.getProjects(),
      departments: this.departmentService.getDepartments()
    }).subscribe({
      next: ({ projects, departments }) => {
        this.projects.set(projects);
        this.departments.set(departments);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: TOAST_TYPES.ERROR,
          summary: TOAST_SUMMARIES.ERROR,
          detail: 'Failed to load data. Please refresh the page.'
        });
        this.loading.set(false);
      }
    });
  }

  openAddProjectModal(): void {
    this.editingProject.set(null);
    this.projectFormVisible.set(true);
  }

  openEditProjectModal(project: Project): void {
    this.editingProject.set({ ...project });
    this.projectFormVisible.set(true);
  }

  onProjectFormClose(): void {
    this.projectFormVisible.set(false);
    this.editingProject.set(null);
  }

  onProjectSaved(savedProject: Project): void {
    const editingProjectValue = this.editingProject();
    if (editingProjectValue) {
      const projectIndex = this.projects().findIndex(p => p.id === editingProjectValue.id);
      if (projectIndex !== -1) {
        this.projects.update(projects => {
          const updated = [...projects];
          updated[projectIndex] = savedProject;
          return updated;
        });
      }
    } else {
      this.projects.update(projects => [savedProject, ...projects]);
    }
    this.onProjectFormClose();
  }

  confirmDeleteProject(project: Project): void {
    this.confirmationService.confirm({
      message: `${API_MESSAGES.ADMIN.PROJECT.DELETE_CONFIRMATION} "${project.name}" will be permanently removed.`,
      header: 'Delete Project',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteProject(project);
      }
    });
  }

  private deleteProject(project: Project): void {
    this.submitting.set(true);

    this.projectService.deleteProject(project.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: TOAST_TYPES.SUCCESS,
          summary: TOAST_SUMMARIES.SUCCESS,
          detail: API_MESSAGES.ADMIN.PROJECT.DELETE_SUCCESS
        });
        this.projects.update(projects => projects.filter(p => p.id !== project.id));
      },
      error: () => {
        this.messageService.add({
          severity: TOAST_TYPES.ERROR,
          summary: TOAST_SUMMARIES.ERROR,
          detail: API_MESSAGES.ADMIN.PROJECT.DELETE_ERROR
        });
      },
      complete: () => {
        this.submitting.set(false);
      }
    });
  }

  getProjectDepartment(project: Project): string {
    if (!project.departmentId) return '-';
    const department = this.departments().find(d => d.id === project.departmentId);
    return department?.name || 'Unknown Department';
  }
}
