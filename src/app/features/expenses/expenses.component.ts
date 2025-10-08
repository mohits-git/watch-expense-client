import { ExpenseSummaryComponent } from '@/shared/components/expense-summary/expense-summary.component';
import { NewExpenseFormComponent } from '@/shared/components/new-expense-form/new-expense-form.component';
import { ExpensesService } from '@/shared/services/expenses.service';
import { Expense, RequestStatus } from '@/shared/types/expense.type';
import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '@/shared/components/spinner/spinner.component';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-expenses',
  imports: [
    ExpenseSummaryComponent,
    NewExpenseFormComponent,
    TableModule,
    TagModule,
    SelectButtonModule,
    DatePipe,
    FormsModule,
    SpinnerComponent,
    MessageModule,
    ButtonModule,
    PaginatorModule,
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
})
export class ExpensesComponent {
  private expenseService = inject(ExpensesService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  totalRecords = signal(0);
  page = signal(0);
  expenses = signal<Expense[] | null>(null);
  dataFetchingError = signal('');

  openNewExpenseForm = signal(false);

  status = signal<RequestStatus | 'ALL'>('ALL');
  statusOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Reviewed', value: 'REVIEWED' },
  ];

  ngOnInit() {
    const paramsSub = this.activatedRoute.queryParams.subscribe({
      next: (value) => {
        const status = value['status']
          ? (String(value['status']) as RequestStatus)
          : undefined;
        this.status.set(status ?? 'ALL');
        const page = value['page'] ? Number(value['page']) : 1;
        const limit = value['limit'] ? Number(value['limit']) : 10;
        this.expenseService.getExpenses(status, page, limit).subscribe({
          next: (val) => {
            console.log(val)
            this.totalRecords.set(val.totalExpenses);
            this.expenses.set(val.expenses);
          },
          error: (err) => {
            this.dataFetchingError.set(err.message);
          },
        });
      },
    });

    this.destroyRef.onDestroy(() => {
      paramsSub.unsubscribe();
    });
  }

  getSeverity(status: string) {
    switch (status) {
      case RequestStatus.Pending:
        return 'warn';
      case RequestStatus.Approved:
        return 'success';
      case RequestStatus.Rejected:
        return 'error';
      case RequestStatus.Reviewed:
        return 'info';
      default:
        return 'primary';
    }
  }

  openAddExpenseForm() {
    this.openNewExpenseForm.set(true);
  }

  onPageChange(event: PaginatorState) {
    console.log(event.page ?? 0 + 1);
    this.router.navigate(['expenses'], {
      queryParams: {
        page: `${(event.page ?? 0) + 1}`,
      },
      queryParamsHandling: 'merge',
    });
  }

  onStatusChange(status: RequestStatus | 'ALL') {
    this.router.navigate(['expenses'], {
      queryParams: {
        ...(status !== 'ALL' ? { status: status } : { status: null }),
        page: '1',
      },
      queryParamsHandling: 'merge',
    });
    this.page.set(0);
    this.expenses.set(null);
  }
}
