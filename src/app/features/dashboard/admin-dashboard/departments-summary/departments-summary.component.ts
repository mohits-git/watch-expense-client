import { CardComponent } from '@/shared/components/card/card.component';
import { DepartmentService } from '@/shared/services/department.service';
import { DepartmentsSummary } from '@/shared/types';
import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DEFAULTS, TOAST_TYPES, TOAST_SUMMARIES } from '@/shared/constants';
import { SummaryCardSkeletonComponent } from '@/shared/components/card/summary-card-skeleton/summary-card-skeleton.component';

@Component({
  selector: 'app-departments-summary',
  imports: [CardComponent, CurrencyPipe, SummaryCardSkeletonComponent],
  templateUrl: './departments-summary.component.html',
  styleUrl: './departments-summary.component.scss',
})
export class DepartmentsSummaryComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private messageService = inject(MessageService);

  summary = signal<DepartmentsSummary>(DEFAULTS.ADMIN.DEPARTMENTS_SUMMARY);
  loading = signal(true);

  ngOnInit() {
    this.departmentService.getDepartmentsSummary().subscribe({
      next: (summary: DepartmentsSummary) => {
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
