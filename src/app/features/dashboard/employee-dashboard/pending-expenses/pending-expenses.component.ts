import { CardComponent } from '@/shared/components/card/card.component';
import { ExpensePreviewComponent } from '@/shared/components/expense-preview/expense-preview.component';
import { SumPipe } from '@/shared/pipes/sum.pipe';
import { ExpensesService } from '@/shared/services/expenses.service';
import { Expense, RequestStatus } from '@/shared/types/expense.type';
import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-pending-expenses',
  imports: [CardComponent, ExpensePreviewComponent, CurrencyPipe, SumPipe],
  templateUrl: './pending-expenses.component.html',
  styleUrl: './pending-expenses.component.scss'
})
export class PendingExpensesComponent {
  expensesService = inject(ExpensesService);
  messageService = inject(MessageService);

  pendingExpenses: Expense[] | undefined;

  ngOnInit() {
    this.expensesService.getExpenses(RequestStatus.Pending).subscribe({
      next: (expenses) => {
        this.pendingExpenses = expenses;
      },
      error: (err) => {
        this.messageService.add({
          severity: "error",
          summary: "Error while fetching pending expenses",
          detail: err.message,
        });
      }
    });
  }
}
