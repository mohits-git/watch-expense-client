import { Expense } from '@/shared/types/expense.type';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-expense-preview',
  imports: [CardComponent, CurrencyPipe, DatePipe],
  templateUrl: './expense-preview.component.html',
  styleUrl: './expense-preview.component.scss'
})
export class ExpensePreviewComponent {
  expense = input.required<Expense>();
}
