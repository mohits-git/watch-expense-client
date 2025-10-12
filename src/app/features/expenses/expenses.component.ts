import { ExpenseSummaryComponent } from '@/shared/components/expense-summary/expense-summary.component';
import { NewExpenseFormComponent } from '@/shared/components/new-expense-form/new-expense-form.component';
import { ExpenseDetailsModalComponent } from './components/expense-details-modal/expense-details-modal.component';
import { ExpensesService } from '@/shared/services/expenses.service';
import { Expense, ExpenseStatusFilter, RequestStatus } from '@/shared/types';
import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '@/shared/components/spinner/spinner.component';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import {
  EXPENSE,
  PRIMENG,
  APP_ROUTES,
  NAVIGATION_OPTIONS,
  TOAST_SUMMARIES,
  TOAST_TYPES,
  API_MESSAGES,
} from '@/shared/constants';
import { getRouteSegments } from '@/shared/utils/routes.util';
import { AuthService } from '@/shared/services/auth.serivce';
import { UserRole } from '@/shared/enums';

@Component({
  selector: 'app-expenses',
  imports: [
    ExpenseSummaryComponent,
    NewExpenseFormComponent,
    ExpenseDetailsModalComponent,
    TableModule,
    TagModule,
    SelectButtonModule,
    DatePipe,
    FormsModule,
    SpinnerComponent,
    MessageModule,
    ButtonModule,
    PaginatorModule,
    TooltipModule,
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
})
export class ExpensesComponent implements OnInit {
  private expenseService = inject(ExpensesService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  isAdmin = computed(() => this.authService.hasRole(UserRole.Admin));

  totalRecords = signal<number>(0);
  expenses = signal<Expense[] | null>(null);
  loading = signal(true);
  dataFetchingError = signal('');

  openNewExpenseForm = signal(false);

  page = signal(0);
  limit = signal(5);
  status = signal<ExpenseStatusFilter>(EXPENSE.STATUS_FILTER.ALL);
  statusOptions = EXPENSE.STATUS_FILTER_OPTIONS;

  openExpenseDetailsModal = signal(false);
  selectedExpense = signal<Expense | null>(null);

  ngOnInit(): void {
    const paramsSub = this.activatedRoute.queryParams.subscribe({
      next: (value) => {
        const status = value[EXPENSE.QUERY_PARAMS.STATUS]
          ? (String(value[EXPENSE.QUERY_PARAMS.STATUS]) as RequestStatus)
          : undefined;
        const page = Number(value[EXPENSE.QUERY_PARAMS.PAGE] ?? 1);
        const limit = Number(value[EXPENSE.QUERY_PARAMS.LIMIT] ?? 10);

        this.status.set(status ?? EXPENSE.STATUS_FILTER.ALL);
        this.page.set(page);
        this.loading.set(true);
        this.expenses.set(null);
        this.getExpenses(status, page, limit);
      },
    });

    this.destroyRef.onDestroy(() => {
      paramsSub.unsubscribe();
    });
  }

  getExpenses(status?: RequestStatus, page?: number, limit?: number) {
    this.expenseService.fetchExpenses(status, page, limit).subscribe({
      next: (val) => {
        this.expenses.set(val.expenses);
        this.totalRecords.set(val.totalExpenses);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.dataFetchingError.set(err.message);
        this.loading.set(false);
        this.messageService.add({
          severity: TOAST_TYPES.ERROR,
          summary: TOAST_SUMMARIES.ERROR,
          detail: err.message || API_MESSAGES.EXPENSE.FETCH_ERROR,
        });
      },
    });
  }

  getSeverity(status: string) {
    switch (status) {
      case RequestStatus.Pending:
        return PRIMENG.SEVERITY.WARN;
      case RequestStatus.Approved:
        return PRIMENG.SEVERITY.SUCCESS;
      case RequestStatus.Rejected:
        return PRIMENG.SEVERITY.DANGER;
      case RequestStatus.Reviewed:
        return PRIMENG.SEVERITY.INFO;
      default:
        return PRIMENG.SEVERITY.PRIMARY;
    }
  }

  openAddExpenseForm() {
    this.openNewExpenseForm.set(true);
  }

  onPageChange(event: PaginatorState) {
    this.router.navigate(getRouteSegments(APP_ROUTES.EXPENSES), {
      queryParams: {
        page: `${(event.page ?? 0) + 1}`,
      },
      queryParamsHandling: NAVIGATION_OPTIONS.QUERY_PARAMS_HANDLING.MERGE,
    });
  }

  onStatusChange(status: ExpenseStatusFilter) {
    this.router.navigate(getRouteSegments(APP_ROUTES.EXPENSES), {
      queryParams: {
        status: status === EXPENSE.STATUS_FILTER.ALL ? null : status,
        page: `${1}`,
      },
      queryParamsHandling: NAVIGATION_OPTIONS.QUERY_PARAMS_HANDLING.MERGE,
    });
    this.page.set(0);
  }

  addNewExpense(expense: Expense) {
    if (
      !this.status() ||
      this.status() === EXPENSE.STATUS_FILTER.ALL ||
      this.status() === EXPENSE.STATUS_FILTER.PENDING
    ) {
      this.expenses.update((expenses) => [expense, ...(expenses ?? [])]);
      this.totalRecords.update((total) => total + 1);
    }
  }

  openExpenseDetails(expense: Expense) {
    this.selectedExpense.set(expense);
    this.openExpenseDetailsModal.set(true);
  }

  onExpenseStatusChange(status: RequestStatus) {
    const selectedExpense = this.selectedExpense();
    if (!selectedExpense) return;
    this.expenses.update((expenses) => {
      if (!expenses) return expenses;
      return expenses.map((exp) => {
        if (exp.id === selectedExpense.id) {
          return { ...exp, status };
        }
        return exp;
      });
    });
    this.selectedExpense.update((exp) => (exp ? { ...exp, status } : exp));
  }
}
