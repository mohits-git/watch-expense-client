import { CardComponent } from '@/shared/components/card/card.component';
import { DEFAULTS } from '@/shared/constants';
import { EmployeeDashboardService } from '@/shared/services/employee-dashboard.service';
import { AdvanceSummary } from '@/shared/types';
import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-advance-summary',
  imports: [CardComponent, CurrencyPipe],
  templateUrl: './advance-summary.component.html',
  styleUrl: './advance-summary.component.scss',
})
export class AdvanceSummaryComponent implements OnInit {
  private dashboardService = inject(EmployeeDashboardService);
  private summary = signal<AdvanceSummary>(DEFAULTS.ADVANCE_SUMMARY);

  balance = computed(() => {
    if (!this.summary()) return 0;
    return this.summary().approved - this.summary().reconciled;
  });

  toReconcile = computed(() => {
    if (!this.summary()) return 0;
    return (
      this.summary().approved -
      this.summary().reconciled -
      this.summary().pendingReconciliation
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
    this.dashboardService.getAdvanceSummary().subscribe({
      next: (summary: AdvanceSummary) => {
        this.summary.set(summary);
      },
    });
  }
}
