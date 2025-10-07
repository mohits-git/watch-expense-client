import { CardComponent } from '@/shared/components/card/card.component';
import { EmployeeDashboardService } from '@/shared/services/employee-dashboard.service';
import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

@Component({
  selector: 'app-budget-summary',
  imports: [CardComponent, CurrencyPipe],
  templateUrl: './budget-summary.component.html',
  styleUrl: './budget-summary.component.scss'
})
export class BudgetSummaryComponent {
  dashboardService = inject(EmployeeDashboardService);

  budget = computed(() => {
    return this.dashboardService.budget() ?? 0;
  })

  budgetLeft = computed(() => {
    return this.dashboardService.budgetLeft() ?? 0;
  });
}
