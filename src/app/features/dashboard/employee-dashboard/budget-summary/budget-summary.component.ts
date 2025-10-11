import { CardComponent } from '@/shared/components/card/card.component';
import { EmployeeDashboardService } from '@/shared/services/employee-dashboard.service';
import { ExpensesSummary, BudgetSummary } from '@/shared/types';
import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-budget-summary',
  imports: [CardComponent, CurrencyPipe],
  templateUrl: './budget-summary.component.html',
  styleUrl: './budget-summary.component.scss',
})
export class BudgetSummaryComponent implements OnInit {
  private dashboardService = inject(EmployeeDashboardService);

  private expenseSummary = signal<ExpensesSummary | null>(null);

  budget = signal<number>(0);

  budgetLeft = computed(() => {
    return (this.budget() ?? 0) - (this.expenseSummary()?.totalExpense ?? 0);
  });

  ngOnInit() {
    this.dashboardService.getExpenseSummary().subscribe({
      next: (summary: ExpensesSummary) => {
        this.expenseSummary.set(summary);
      },
    });
    this.dashboardService.getBudget().subscribe({
      next: (summary: BudgetSummary) => {
        this.budget.set(summary.budget);
      },
    });
  }
}
