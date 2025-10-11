import { CardComponent } from '@/shared/components/card/card.component';
import { SummaryCardSkeletonComponent } from '@/shared/components/card/summary-card-skeleton/summary-card-skeleton.component';
import { EmployeeDashboardService } from '@/shared/services/employee-dashboard.service';
import {
  ExpensesSummary,
  BudgetSummary,
  UserBudgetAPIResponse,
} from '@/shared/types';
import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-budget-summary',
  imports: [CardComponent, SummaryCardSkeletonComponent, CurrencyPipe],
  templateUrl: './budget-summary.component.html',
  styleUrl: './budget-summary.component.scss',
})
export class BudgetSummaryComponent implements OnInit {
  private dashboardService = inject(EmployeeDashboardService);

  budgetSummary = signal<BudgetSummary>({
    allocatedBudget: 0,
    usedBudget: 0,
    remainingBudget: 0,
    usagePercentage: 0,
  });
  loading = signal<boolean>(true);

  ngOnInit() {
    this.loading.set(true);
    this.dashboardService.getBudget().subscribe({
      next: (budgetResponse: UserBudgetAPIResponse) => {
        const allocatedBudget = budgetResponse.budget || 0;
        this.dashboardService.getExpenseSummary().subscribe({
          next: (expenseSummary: ExpensesSummary) => {
            const usedBudget = expenseSummary.totalExpense || 0;
            const remainingBudget = Math.max(0, allocatedBudget - usedBudget);
            const usagePercentage =
              allocatedBudget > 0
                ? Math.round((usedBudget / allocatedBudget) * 100)
                : 0;

            this.budgetSummary.set({
              allocatedBudget,
              usedBudget,
              remainingBudget,
              usagePercentage: Math.min(100, Math.max(0, usagePercentage)),
            });
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
