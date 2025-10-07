import { CardComponent } from '@/shared/components/card/card.component';
import { EmployeeDashboardService } from '@/shared/services/employee-dashboard.service';
import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

@Component({
  selector: 'app-advance-summary',
  imports: [CardComponent, CurrencyPipe],
  templateUrl: './advance-summary.component.html',
  styleUrl: './advance-summary.component.scss',
})
export class AdvanceSummaryComponent {
  dashboardService = inject(EmployeeDashboardService);

  balance = computed(() => {
    if (!this.dashboardService.advanceSummary()) return 0;
    return (
      this.dashboardService.advanceSummary()!.approved -
      this.dashboardService.advanceSummary()!.reconciled
    );
  });
  toReconcile = computed(() => {
    if (!this.dashboardService.advanceSummary()) return 0;
    return (
      this.dashboardService.advanceSummary()!.approved -
      this.dashboardService.advanceSummary()!.reconciled -
      this.dashboardService.advanceSummary()!.pendingReconciliation
    );
  });
  pendingReconciliation = computed(() => {
    if (!this.dashboardService.advanceSummary()) return 0;
    return this.dashboardService.advanceSummary()!.pendingReconciliation;
  });
  rejectedAdvance = computed(() => {
    if (!this.dashboardService.advanceSummary()) return 0;
    return this.dashboardService.advanceSummary()!.rejectedAdvance;
  });
}
