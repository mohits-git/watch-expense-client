import { Component } from '@angular/core';
import { AdvanceSummaryComponent } from '@/shared/components/advance-summary/advance-summary.component';
import { ExpenseSummaryComponent } from '@/shared/components/expense-summary/expense-summary.component';
import { BudgetSummaryComponent } from './budget-summary/budget-summary.component';

@Component({
  selector: 'app-employee-dashboard',
  imports: [
    AdvanceSummaryComponent,
    ExpenseSummaryComponent,
    BudgetSummaryComponent,
  ],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.scss',
})
export class EmployeeDashboardComponent {}
