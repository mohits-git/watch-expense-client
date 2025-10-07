import { CardComponent } from '@/shared/components/card/card.component';
import { EmployeeDashboardService } from '@/shared/services/employee-dashboard.service';
import { ExpensesSummary } from '@/shared/types/expense-summary.type';
import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

@Component({
  selector: 'app-expense-summary',
  imports: [CardComponent, CurrencyPipe],
  templateUrl: './expense-summary.component.html',
  styleUrl: './expense-summary.component.scss'
})
export class ExpenseSummaryComponent {
  dashboardService = inject(EmployeeDashboardService);

  summary = computed((): ExpensesSummary => {
    if(!this.dashboardService.expenseSummary()) {
      return {
        totalExpense: 0,
        reimbursedExpense: 0,
        pendingExpense: 0,
        rejectedExpense: 0,
      };
    }
    return this.dashboardService.expenseSummary()!;
  });
}
