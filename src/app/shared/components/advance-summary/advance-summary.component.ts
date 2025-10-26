import { CardComponent } from '@/shared/components/card/card.component';
import { SummaryCardSkeletonComponent } from '@/shared/components/card/summary-card-skeleton/summary-card-skeleton.component';
import { DEFAULTS } from '@/shared/constants';
import { EmployeeDashboardService } from '@/shared/services/employee-dashboard.service';
import { AdvanceSummary } from '@/shared/types';
import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-advance-summary',
  imports: [CardComponent, SummaryCardSkeletonComponent, CurrencyPipe],
  templateUrl: './advance-summary.component.html',
  styleUrl: './advance-summary.component.scss',
})
export class AdvanceSummaryComponent implements OnInit {
  private dashboardService = inject(EmployeeDashboardService);
  private summary = signal<AdvanceSummary>(DEFAULTS.ADVANCE_SUMMARY);
  loading = signal<boolean>(true);

  balance = computed(() => {
    if (!this.summary()) return 0;
    return this.summary().approved - this.summary().reconciled;
  });

  toReconcile = computed(() => {
    if (!this.summary()) return 0;
    return (
      this.summary().approved -
      this.summary().reconciled
    );
  });

  pendingReconciliation = computed(() => {
    if (!this.summary()) return 0;
    return this.summary().pendingReconciliation;
  });

  rejectedAdvance = computed(() => {
    if (!this.summary()) return 0;
    return this.summary().rejectedAdvance;
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.dashboardService.getAdvanceSummary().subscribe({
      next: (summary: AdvanceSummary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
