import {
  Component,
  inject,
  signal,
  input,
  model,
  computed,
  output,
  effect,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { Advance, RequestStatus, Expense } from '@/shared/types';
import { AdvancesService } from '@/shared/services/advances.service';
import { ExpensesService } from '@/shared/services/expenses.service';
import {
  API_MESSAGES,
  TOAST_TYPES,
  TOAST_SUMMARIES,
  PRIMENG,
} from '@/shared/constants';

@Component({
  selector: 'app-advance-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    TagModule,
    DividerModule,
    DatePipe,
  ],
  templateUrl: './advance-details-modal.component.html',
  styleUrl: './advance-details-modal.component.scss',
})
export class AdvanceDetailsModalComponent {
  visible = model.required<boolean>();
  advance = input<Advance | null>(null);
  isAdmin = input<boolean>(false);

  onStatusChange = output<RequestStatus>();
  onReconcile = output<string>();

  private advancesService = inject(AdvancesService);
  private expensesService = inject(ExpensesService);
  private messageService = inject(MessageService);

  isProcessing = signal(false);
  reconciledExpense = signal<Expense | null>(null);
  loadingExpense = signal(false);
  RequestStatus = RequestStatus;

  constructor() {
    effect(() => {
      const adv = this.advance();
      if (adv?.reconciledExpenseId) {
        this.fetchReconciledExpense(adv.reconciledExpenseId);
      } else {
        this.reconciledExpense.set(null);
      }
    });
  }

  fetchReconciledExpense(expenseId: string): void {
    this.loadingExpense.set(true);
    this.expensesService.fetchExpenseById(expenseId).subscribe({
      next: (expense) => {
        this.reconciledExpense.set(expense);
        this.loadingExpense.set(false);
      },
      error: (error) => {
        this.loadingExpense.set(false);
      },
    });
  }

  canApprove = computed(() => {
    const adv = this.advance();
    return (
      adv?.status === RequestStatus.Pending ||
      adv?.status === RequestStatus.Reviewed
    );
  });

  canReject = computed(() => {
    const adv = this.advance();
    return adv?.status === RequestStatus.Pending;
  });

  canMarkReviewed = computed(() => {
    const adv = this.advance();
    return adv?.status === RequestStatus.Pending;
  });

  canReconcile = computed(() => {
    const adv = this.advance();
    return (
      adv?.status === RequestStatus.Approved &&
      !adv?.reconciledExpenseId &&
      !this.isAdmin()
    );
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

  approveAdvance(): void {
    const adv = this.advance();
    if (!adv) return;

    this.isProcessing.set(true);
    this.advancesService
      .updateAdvanceStatus(adv.id, RequestStatus.Approved)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: TOAST_TYPES.SUCCESS,
            summary: TOAST_SUMMARIES.SUCCESS,
            detail: API_MESSAGES.ADVANCE.ADVANCE_APPROVED,
          });
          this.isProcessing.set(false);
          this.onStatusChange.emit(RequestStatus.Approved);
          this.closeModal();
        },
        error: (error: any) => {
          this.messageService.add({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail:
              error?.error?.message ||
              API_MESSAGES.ADVANCE.ADVANCE_UPDATE_FAILED,
          });
          this.isProcessing.set(false);
        },
      });
  }

  rejectAdvance(): void {
    const adv = this.advance();
    if (!adv) return;

    this.isProcessing.set(true);
    this.advancesService
      .updateAdvanceStatus(adv.id, RequestStatus.Rejected)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: TOAST_TYPES.SUCCESS,
            summary: TOAST_SUMMARIES.SUCCESS,
            detail: API_MESSAGES.ADVANCE.ADVANCE_REJECTED,
          });
          this.isProcessing.set(false);
          this.onStatusChange.emit(RequestStatus.Rejected);
          this.closeModal();
        },
        error: (error: any) => {
          this.messageService.add({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail:
              error?.error?.message ||
              API_MESSAGES.ADVANCE.ADVANCE_UPDATE_FAILED,
          });
          this.isProcessing.set(false);
        },
      });
  }

  markAsReviewed(): void {
    const adv = this.advance();
    if (!adv) return;

    this.isProcessing.set(true);
    this.advancesService
      .updateAdvanceStatus(adv.id, RequestStatus.Reviewed)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: TOAST_TYPES.SUCCESS,
            summary: TOAST_SUMMARIES.SUCCESS,
            detail: API_MESSAGES.ADVANCE.ADVANCE_REVIEWED,
          });
          this.isProcessing.set(false);
          this.onStatusChange.emit(RequestStatus.Reviewed);
          this.closeModal();
        },
        error: (error: any) => {
          this.messageService.add({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail:
              error?.error?.message ||
              API_MESSAGES.ADVANCE.ADVANCE_UPDATE_FAILED,
          });
          this.isProcessing.set(false);
        },
      });
  }

  reconcileAdvance(): void {
    const adv = this.advance();
    if (!adv) return;

    this.onReconcile.emit(adv.id);
    this.closeModal();
  }
}
