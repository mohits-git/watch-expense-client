import { Component, inject, signal, input, model, computed, output, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { Expense, RequestStatus, Advance } from '@/shared/types';
import { ExpensesService } from '@/shared/services/expenses.service';
import { AdvancesService } from '@/shared/services/advances.service';
import {
  API_MESSAGES,
  TOAST_TYPES,
  TOAST_SUMMARIES,
  PRIMENG,
} from '@/shared/constants';

@Component({
  selector: 'app-expense-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    TagModule,
    DividerModule,
    DatePipe,
  ],
  templateUrl: './expense-details-modal.component.html',
  styleUrl: './expense-details-modal.component.scss'
})
export class ExpenseDetailsModalComponent {
  visible = model.required<boolean>();
  expense = input<Expense | null>(null);
  isAdmin = input<boolean>(false);

  onStatusChange = output<RequestStatus>();

  private expensesService = inject(ExpensesService);
  private advancesService = inject(AdvancesService);
  private messageService = inject(MessageService);

  isProcessing = signal(false);
  relatedAdvance = signal<Advance | null>(null);
  loadingAdvance = signal(false);
  RequestStatus = RequestStatus;

  constructor() {
    effect(() => {
      const exp = this.expense();
      if (exp?.advanceId) {
        this.fetchRelatedAdvance(exp.advanceId);
      } else {
        this.relatedAdvance.set(null);
      }
    });
  }

  fetchRelatedAdvance(advanceId: string): void {
    this.loadingAdvance.set(true);
    this.advancesService.fetchAdvanceById(advanceId).subscribe({
      next: (advance) => {
        this.relatedAdvance.set(advance);
        this.loadingAdvance.set(false);
      },
      error: (error) => {
        console.error('Failed to fetch related advance:', error);
        this.loadingAdvance.set(false);
      },
    });
  }

  canApprove = computed(() => {
    const exp = this.expense();
    return exp?.status === RequestStatus.Pending || exp?.status === RequestStatus.Reviewed;
  });

  canReject = computed(() => {
    const exp = this.expense();
    return exp?.status === RequestStatus.Pending;
  });

  canMarkReviewed = computed(() => {
    const exp = this.expense();
    return exp?.status === RequestStatus.Pending;
  });

  getSeverity(status: RequestStatus): string {
    switch (status) {
      case RequestStatus.Approved:
        return PRIMENG.SEVERITY.SUCCESS;
      case RequestStatus.Pending:
        return PRIMENG.SEVERITY.WARN;
      case RequestStatus.Rejected:
        return PRIMENG.SEVERITY.DANGER;
      case RequestStatus.Reviewed:
        return PRIMENG.SEVERITY.INFO;
      default:
        return PRIMENG.SEVERITY.PRIMARY;
    }
  }

  closeModal(): void {
    this.visible.set(false);
  }

  approveExpense(): void {
    const exp = this.expense();
    if (!exp) return;

    this.isProcessing.set(true);
    this.expensesService.updateExpenseStatus(exp.id, RequestStatus.Approved).subscribe({
      next: () => {
        this.messageService.add({
          severity: TOAST_TYPES.SUCCESS,
          summary: TOAST_SUMMARIES.SUCCESS,
          detail: API_MESSAGES.EXPENSE.EXPENSE_APPROVED,
        });
        this.isProcessing.set(false);
        this.onStatusChange.emit(RequestStatus.Approved);
        this.closeModal();
      },
      error: (error: any) => {
        this.messageService.add({
          severity: TOAST_TYPES.ERROR,
          summary: TOAST_SUMMARIES.ERROR,
          detail: error?.error?.message || API_MESSAGES.EXPENSE.EXPENSE_UPDATE_FAILED,
        });
        this.isProcessing.set(false);
      },
    });
  }

  rejectExpense(): void {
    const exp = this.expense();
    if (!exp) return;

    this.isProcessing.set(true);
    this.expensesService.updateExpenseStatus(exp.id, RequestStatus.Rejected).subscribe({
      next: () => {
        this.messageService.add({
          severity: TOAST_TYPES.SUCCESS,
          summary: TOAST_SUMMARIES.SUCCESS,
          detail: API_MESSAGES.EXPENSE.EXPENSE_REJECTED,
        });
        this.isProcessing.set(false);
        this.onStatusChange.emit(RequestStatus.Rejected);
        this.closeModal();
      },
      error: (error: any) => {
        this.messageService.add({
          severity: TOAST_TYPES.ERROR,
          summary: TOAST_SUMMARIES.ERROR,
          detail: error?.error?.message || API_MESSAGES.EXPENSE.EXPENSE_UPDATE_FAILED,
        });
        this.isProcessing.set(false);
      },
    });
  }

  markAsReviewed(): void {
    const exp = this.expense();
    if (!exp) return;

    this.isProcessing.set(true);
    this.expensesService.updateExpenseStatus(exp.id, RequestStatus.Reviewed).subscribe({
      next: () => {
        this.messageService.add({
          severity: TOAST_TYPES.SUCCESS,
          summary: TOAST_SUMMARIES.SUCCESS,
          detail: API_MESSAGES.EXPENSE.EXPENSE_REVIEWED,
        });
        this.isProcessing.set(false);
        this.onStatusChange.emit(RequestStatus.Reviewed);
        this.closeModal();
      },
      error: (error: any) => {
        this.messageService.add({
          severity: TOAST_TYPES.ERROR,
          summary: TOAST_SUMMARIES.ERROR,
          detail: error?.error?.message || API_MESSAGES.EXPENSE.EXPENSE_UPDATE_FAILED,
        });
        this.isProcessing.set(false);
      },
    });
  }
}
