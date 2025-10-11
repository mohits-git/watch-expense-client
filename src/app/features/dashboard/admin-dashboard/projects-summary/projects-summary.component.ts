import { CardComponent } from '@/shared/components/card/card.component';
import { ProjectService } from '@/shared/services/project.service';
import { ProjectsSummary } from '@/shared/types';
import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { SummaryCardSkeletonComponent } from '@/shared/components/card/summary-card-skeleton/summary-card-skeleton.component';
import { DEFAULTS, TOAST_TYPES, TOAST_SUMMARIES } from '@/shared/constants';

@Component({
  selector: 'app-projects-summary',
  imports: [CardComponent, CurrencyPipe, SummaryCardSkeletonComponent],
  templateUrl: './projects-summary.component.html',
  styleUrl: './projects-summary.component.scss',
})
export class ProjectsSummaryComponent implements OnInit {
  private projectService = inject(ProjectService);
  private messageService = inject(MessageService);

  summary = signal<ProjectsSummary>(DEFAULTS.ADMIN.PROJECTS_SUMMARY);
  loading = signal(true);

  ngOnInit() {
    this.projectService.getProjectsSummary().subscribe({
      next: (summary: ProjectsSummary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: TOAST_TYPES.ERROR,
          summary: TOAST_SUMMARIES.ERROR,
          detail: err.message,
        });
      },
    });
  }
}
