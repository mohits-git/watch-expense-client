import { CardComponent } from '@/shared/components/card/card.component';
import { DEFAULTS } from '@/shared/constants';
import { EmployeeDashboardService } from '@/shared/services/employee-dashboard.service';
import { ExpensesSummary } from '@/shared/types';
import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-expense-summary',
  imports: [CardComponent, CurrencyPipe],
  templateUrl: './expense-summary.component.html',
  styleUrl: './expense-summary.component.scss',
})
export class ExpenseSummaryComponent implements OnInit {
  private dashboardService = inject(EmployeeDashboardService);

  summary = signal<ExpensesSummary>(DEFAULTS.EXPENSE.SUMMARY);

  ngOnInit() {
    this.dashboardService.getExpenseSummary().subscribe({
      next: (summary: ExpensesSummary) => {
        this.summary.set(summary);
      }
    })
  }
}
