import { Component } from '@angular/core';
import { PendingExpensesComponent } from './pending-expenses/pending-expenses.component';
import { PendingAdvanceComponent } from './pending-advance/pending-advance.component';

@Component({
  selector: 'app-employee-dashboard',
  imports: [PendingExpensesComponent, PendingAdvanceComponent],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.scss'
})
export class EmployeeDashboardComponent {
}
