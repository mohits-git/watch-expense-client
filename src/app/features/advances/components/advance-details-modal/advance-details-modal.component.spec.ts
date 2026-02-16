import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AdvanceDetailsModalComponent } from './advance-details-modal.component';
import { MessageService } from 'primeng/api';
import { AdvancesService } from '@/shared/services/advances.service';
import { ExpensesService } from '@/shared/services/expenses.service';
import { Advance, Expense, RequestStatus } from '@/shared/types';
import { API_MESSAGES } from '@/shared/constants';

describe('AdvanceDetailsModalComponent', () => {
  let component: AdvanceDetailsModalComponent;
  let fixture: ComponentFixture<AdvanceDetailsModalComponent>;
  let advancesServiceSpy: jasmine.SpyObj<AdvancesService>;
  let expensesServiceSpy: jasmine.SpyObj<ExpensesService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const mockAdvancePending: Advance = {
    id: 'adv-1',
    userId: 'user-1',
    amount: 5000,
    purpose: 'Travel expenses',
    status: RequestStatus.Pending,
    description: 'Business trip to Mumbai',
    createdAt: new Date('2026-01-15T10:00:00Z').getTime(),
    updatedAt: new Date('2026-01-15T10:00:00Z').getTime(),
    approvedBy: null,
    approvedAt: null,
    reviewedBy: null,
    reviewedAt: null,
    reconciledExpenseId: null,
  };

  const mockAdvanceApproved: Advance = {
    ...mockAdvancePending,
    id: 'adv-2',
    status: RequestStatus.Approved,
    approvedBy: 'admin-1',
    approvedAt: new Date('2026-01-16T10:00:00Z').getTime(),
    reconciledExpenseId: null,
  };

  const mockAdvanceReconciled: Advance = {
    ...mockAdvanceApproved,
    id: 'adv-3',
    reconciledExpenseId: 'exp-1',
  };

  const mockAdvanceReviewed: Advance = {
    ...mockAdvancePending,
    id: 'adv-4',
    status: RequestStatus.Reviewed,
    reviewedBy: 'admin-1',
    reviewedAt: new Date('2026-01-17T10:00:00Z').getTime(),
  };

  const mockAdvanceRejected: Advance = {
    ...mockAdvancePending,
    id: 'adv-5',
    status: RequestStatus.Rejected,
  };

  const mockExpense: Expense = {
    id: 'exp-1',
    userId: 'user-1',
    amount: 4500,
    purpose: 'Travel reimbursement',
    status: RequestStatus.Pending,
    description: 'Return trip expenses',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    approvedBy: null,
    approvedAt: null,
    reviewedBy: null,
    reviewedAt: null,
    isReconciled: false,
    advanceId: 'adv-3',
    bills: [],
  };

  beforeEach(async () => {
    advancesServiceSpy = jasmine.createSpyObj<AdvancesService>('AdvancesService', [
      'updateAdvanceStatus',
    ]);
    advancesServiceSpy.updateAdvanceStatus.and.returnValue(of(undefined));

    expensesServiceSpy = jasmine.createSpyObj<ExpensesService>('ExpensesService', [
      'fetchExpenseById',
    ]);
    expensesServiceSpy.fetchExpenseById.and.returnValue(of(mockExpense));

    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [AdvanceDetailsModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: AdvancesService, useValue: advancesServiceSpy },
        { provide: ExpensesService, useValue: expensesServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvanceDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('advance', null);
    fixture.componentRef.setInput('isAdmin', false);
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('computed properties', () => {
    describe('canApprove', () => {
      it('should return true when advance is Pending', () => {
        fixture.componentRef.setInput('advance', mockAdvancePending);
        fixture.detectChanges();

        expect(component.canApprove()).toBeTrue();
      });

      it('should return true when advance is Reviewed', () => {
        fixture.componentRef.setInput('advance', mockAdvanceReviewed);
        fixture.detectChanges();

        expect(component.canApprove()).toBeTrue();
      });

      it('should return false when advance is Approved', () => {
        fixture.componentRef.setInput('advance', mockAdvanceApproved);
        fixture.detectChanges();

        expect(component.canApprove()).toBeFalse();
      });

      it('should return false when advance is Rejected', () => {
        fixture.componentRef.setInput('advance', mockAdvanceRejected);
        fixture.detectChanges();

        expect(component.canApprove()).toBeFalse();
      });
    });

    describe('canReject', () => {
      it('should return true when advance is Pending', () => {
        fixture.componentRef.setInput('advance', mockAdvancePending);
        fixture.detectChanges();

        expect(component.canReject()).toBeTrue();
      });

      it('should return false when advance is Approved', () => {
        fixture.componentRef.setInput('advance', mockAdvanceApproved);
        fixture.detectChanges();

        expect(component.canReject()).toBeFalse();
      });

      it('should return false when advance is Reviewed', () => {
        fixture.componentRef.setInput('advance', mockAdvanceReviewed);
        fixture.detectChanges();

        expect(component.canReject()).toBeFalse();
      });
    });

    describe('canMarkReviewed', () => {
      it('should return true when advance is Pending', () => {
        fixture.componentRef.setInput('advance', mockAdvancePending);
        fixture.detectChanges();

        expect(component.canMarkReviewed()).toBeTrue();
      });

      it('should return false when advance is Approved', () => {
        fixture.componentRef.setInput('advance', mockAdvanceApproved);
        fixture.detectChanges();

        expect(component.canMarkReviewed()).toBeFalse();
      });
    });

    describe('canReconcile', () => {
      it('should return true when advance is Approved, not reconciled, and user is not admin', () => {
        fixture.componentRef.setInput('advance', mockAdvanceApproved);
        fixture.componentRef.setInput('isAdmin', false);
        fixture.detectChanges();

        expect(component.canReconcile()).toBeTrue();
      });

      it('should return false when advance is Approved but user is admin', () => {
        fixture.componentRef.setInput('advance', mockAdvanceApproved);
        fixture.componentRef.setInput('isAdmin', true);
        fixture.detectChanges();

        expect(component.canReconcile()).toBeFalse();
      });

      it('should return false when advance is already reconciled', () => {
        fixture.componentRef.setInput('advance', mockAdvanceReconciled);
        fixture.componentRef.setInput('isAdmin', false);
        fixture.detectChanges();

        expect(component.canReconcile()).toBeFalse();
      });

      it('should return false when advance is Pending', () => {
        fixture.componentRef.setInput('advance', mockAdvancePending);
        fixture.componentRef.setInput('isAdmin', false);
        fixture.detectChanges();

        expect(component.canReconcile()).toBeFalse();
      });
    });
  });

  describe('getSeverity', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return "success" for Approved status', () => {
      expect(component.getSeverity(RequestStatus.Approved)).toBe('success');
    });

    it('should return "warn" for Pending status', () => {
      expect(component.getSeverity(RequestStatus.Pending)).toBe('warn');
    });

    it('should return "danger" for Rejected status', () => {
      expect(component.getSeverity(RequestStatus.Rejected)).toBe('danger');
    });

    it('should return "info" for Reviewed status', () => {
      expect(component.getSeverity(RequestStatus.Reviewed)).toBe('info');
    });

    it('should return "primary" for unknown status', () => {
      expect(component.getSeverity('UNKNOWN' as RequestStatus)).toBe('primary');
    });
  });

  describe('closeModal', () => {
    it('should set visible to false', () => {
      fixture.detectChanges();

      expect(component.visible()).toBeTrue();
      component.closeModal();
      expect(component.visible()).toBeFalse();
    });
  });

  describe('approveAdvance', () => {
    it('should call updateAdvanceStatus with Approved, show success toast, emit and close', () => {
      fixture.componentRef.setInput('advance', mockAdvancePending);
      fixture.componentRef.setInput('isAdmin', true);
      fixture.detectChanges();

      const statusChangeSpy = spyOn(component.onStatusChange, 'emit');

      component.approveAdvance();

      expect(advancesServiceSpy.updateAdvanceStatus).toHaveBeenCalledWith(
        'adv-1',
        RequestStatus.Approved,
      );
      expect(component.isProcessing()).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'success',
          detail: API_MESSAGES.ADVANCE.ADVANCE_APPROVED,
        }),
      );
      expect(statusChangeSpy).toHaveBeenCalledWith(RequestStatus.Approved);
      expect(component.visible()).toBeFalse();
    });

    it('should do nothing when advance is null', () => {
      fixture.componentRef.setInput('advance', null);
      fixture.detectChanges();

      component.approveAdvance();

      expect(advancesServiceSpy.updateAdvanceStatus).not.toHaveBeenCalled();
    });

    it('should show error toast and stop processing on error', () => {
      advancesServiceSpy.updateAdvanceStatus.and.returnValue(
        throwError(() => ({ error: { message: 'Approval failed' } })),
      );
      fixture.componentRef.setInput('advance', mockAdvancePending);
      fixture.detectChanges();

      component.approveAdvance();

      expect(component.isProcessing()).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    });

    it('should set isProcessing to true while request is in flight', () => {
      fixture.componentRef.setInput('advance', mockAdvancePending);
      fixture.detectChanges();

      component.isProcessing.set(false);
      // Verify the method sets isProcessing
      advancesServiceSpy.updateAdvanceStatus.and.callFake(() => {
        expect(component.isProcessing()).toBeTrue();
        return of(undefined);
      });

      component.approveAdvance();
    });
  });

  describe('rejectAdvance', () => {
    it('should call updateAdvanceStatus with Rejected, show success toast, emit and close', () => {
      fixture.componentRef.setInput('advance', mockAdvancePending);
      fixture.componentRef.setInput('isAdmin', true);
      fixture.detectChanges();

      const statusChangeSpy = spyOn(component.onStatusChange, 'emit');

      component.rejectAdvance();

      expect(advancesServiceSpy.updateAdvanceStatus).toHaveBeenCalledWith(
        'adv-1',
        RequestStatus.Rejected,
      );
      expect(component.isProcessing()).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'success',
          detail: API_MESSAGES.ADVANCE.ADVANCE_REJECTED,
        }),
      );
      expect(statusChangeSpy).toHaveBeenCalledWith(RequestStatus.Rejected);
      expect(component.visible()).toBeFalse();
    });

    it('should do nothing when advance is null', () => {
      fixture.componentRef.setInput('advance', null);
      fixture.detectChanges();

      component.rejectAdvance();

      expect(advancesServiceSpy.updateAdvanceStatus).not.toHaveBeenCalled();
    });

    it('should show error toast on failure', () => {
      advancesServiceSpy.updateAdvanceStatus.and.returnValue(
        throwError(() => ({ error: { message: 'Rejection failed' } })),
      );
      fixture.componentRef.setInput('advance', mockAdvancePending);
      fixture.detectChanges();

      component.rejectAdvance();

      expect(component.isProcessing()).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    });
  });

  describe('markAsReviewed', () => {
    it('should call updateAdvanceStatus with Reviewed, show success toast, emit and close', () => {
      fixture.componentRef.setInput('advance', mockAdvancePending);
      fixture.componentRef.setInput('isAdmin', true);
      fixture.detectChanges();

      const statusChangeSpy = spyOn(component.onStatusChange, 'emit');

      component.markAsReviewed();

      expect(advancesServiceSpy.updateAdvanceStatus).toHaveBeenCalledWith(
        'adv-1',
        RequestStatus.Reviewed,
      );
      expect(component.isProcessing()).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'success',
          detail: API_MESSAGES.ADVANCE.ADVANCE_REVIEWED,
        }),
      );
      expect(statusChangeSpy).toHaveBeenCalledWith(RequestStatus.Reviewed);
      expect(component.visible()).toBeFalse();
    });

    it('should do nothing when advance is null', () => {
      fixture.componentRef.setInput('advance', null);
      fixture.detectChanges();

      component.markAsReviewed();

      expect(advancesServiceSpy.updateAdvanceStatus).not.toHaveBeenCalled();
    });

    it('should show error toast on failure', () => {
      advancesServiceSpy.updateAdvanceStatus.and.returnValue(
        throwError(() => ({ error: { message: 'Review failed' } })),
      );
      fixture.componentRef.setInput('advance', mockAdvancePending);
      fixture.detectChanges();

      component.markAsReviewed();

      expect(component.isProcessing()).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    });
  });

  describe('reconcileAdvance', () => {
    it('should emit advance id and close modal', () => {
      fixture.componentRef.setInput('advance', mockAdvanceApproved);
      fixture.detectChanges();

      const reconcileSpy = spyOn(component.onReconcile, 'emit');

      component.reconcileAdvance();

      expect(reconcileSpy).toHaveBeenCalledWith('adv-2');
      expect(component.visible()).toBeFalse();
    });

    it('should do nothing when advance is null', () => {
      fixture.componentRef.setInput('advance', null);
      fixture.detectChanges();

      const reconcileSpy = spyOn(component.onReconcile, 'emit');

      component.reconcileAdvance();

      expect(reconcileSpy).not.toHaveBeenCalled();
    });
  });

  describe('fetchReconciledExpense', () => {
    it('should fetch and set the reconciled expense', () => {
      fixture.detectChanges();

      component.fetchReconciledExpense('exp-1');

      expect(expensesServiceSpy.fetchExpenseById).toHaveBeenCalledWith('exp-1');
      expect(component.reconciledExpense()).toEqual(mockExpense);
      expect(component.loadingExpense()).toBeFalse();
    });

    it('should stop loading on error', () => {
      expensesServiceSpy.fetchExpenseById.and.returnValue(
        throwError(() => new Error('Not found')),
      );
      fixture.detectChanges();

      component.fetchReconciledExpense('exp-1');

      expect(component.loadingExpense()).toBeFalse();
      expect(component.reconciledExpense()).toBeNull();
    });
  });

  describe('effect: auto-fetch reconciled expense', () => {
    it('should fetch reconciled expense when advance has reconciledExpenseId', () => {
      fixture.componentRef.setInput('advance', mockAdvanceReconciled);
      fixture.detectChanges();

      expect(expensesServiceSpy.fetchExpenseById).toHaveBeenCalledWith('exp-1');
      expect(component.reconciledExpense()).toEqual(mockExpense);
    });

    it('should clear reconciled expense when advance has no reconciledExpenseId', () => {
      fixture.componentRef.setInput('advance', mockAdvancePending);
      fixture.detectChanges();

      expect(component.reconciledExpense()).toBeNull();
    });

    it('should clear reconciled expense when advance is null', () => {
      fixture.componentRef.setInput('advance', null);
      fixture.detectChanges();

      expect(component.reconciledExpense()).toBeNull();
    });
  });

  describe('template rendering', () => {
    it('should render the dialog', () => {
      fixture.componentRef.setInput('advance', mockAdvancePending);
      fixture.detectChanges();

      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      expect(dialog).toBeTruthy();
    });

    it('should display advance details when advance is provided', () => {
      fixture.componentRef.setInput('advance', mockAdvancePending);
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Travel expenses');
      expect(hostText).toContain('5000');
      expect(hostText).toContain('Business trip to Mumbai');
    });

    it('should show approved by details when advance has approvedBy', () => {
      fixture.componentRef.setInput('advance', mockAdvanceApproved);
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Approved By');
      expect(hostText).toContain('admin-1');
    });

    it('should show reviewed by details when advance has reviewedBy', () => {
      fixture.componentRef.setInput('advance', mockAdvanceReviewed);
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Reviewed By');
      expect(hostText).toContain('admin-1');
    });

    it('should show reconciliation status when advance is reconciled', () => {
      fixture.componentRef.setInput('advance', mockAdvanceReconciled);
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Reconciled');
    });

    describe('admin actions', () => {
      it('should show Approve, Reject and Mark as Reviewed buttons for pending advance', () => {
        fixture.componentRef.setInput('advance', mockAdvancePending);
        fixture.componentRef.setInput('isAdmin', true);
        fixture.detectChanges();

        const buttons = fixture.debugElement
          .queryAll(By.css('.footer-actions p-button'))
          .map((btn) => btn.attributes['label'])
          .filter(Boolean);

        expect(buttons).toContain('Approve');
        expect(buttons).toContain('Reject');
        expect(buttons).toContain('Mark as Reviewed');
      });

      it('should show Approve button for reviewed advance', () => {
        fixture.componentRef.setInput('advance', mockAdvanceReviewed);
        fixture.componentRef.setInput('isAdmin', true);
        fixture.detectChanges();

        const buttons = fixture.debugElement
          .queryAll(By.css('.footer-actions p-button'))
          .map((btn) => btn.attributes['label'])
          .filter(Boolean);

        expect(buttons).toContain('Approve');
      });

      it('should not show action buttons for rejected advance', () => {
        fixture.componentRef.setInput('advance', mockAdvanceRejected);
        fixture.componentRef.setInput('isAdmin', true);
        fixture.detectChanges();

        const buttons = fixture.debugElement
          .queryAll(By.css('.footer-actions p-button'))
          .map((btn) => btn.attributes['label'])
          .filter(Boolean);

        expect(buttons).not.toContain('Approve');
        expect(buttons).not.toContain('Reject');
        expect(buttons).not.toContain('Mark as Reviewed');
      });
    });

    describe('employee actions', () => {
      it('should show Reconcile button for approved non-reconciled advance', () => {
        fixture.componentRef.setInput('advance', mockAdvanceApproved);
        fixture.componentRef.setInput('isAdmin', false);
        fixture.detectChanges();

        const buttons = fixture.debugElement
          .queryAll(By.css('.footer-actions p-button'))
          .map((btn) => btn.attributes['label'])
          .filter(Boolean);

        expect(buttons).toContain('Reconcile');
      });

      it('should not show Reconcile button for reconciled advance', () => {
        fixture.componentRef.setInput('advance', mockAdvanceReconciled);
        fixture.componentRef.setInput('isAdmin', false);
        fixture.detectChanges();

        const buttons = fixture.debugElement
          .queryAll(By.css('.footer-actions p-button'))
          .map((btn) => btn.attributes['label'])
          .filter(Boolean);

        expect(buttons).not.toContain('Reconcile');
      });

      it('should not show admin action buttons for employee', () => {
        fixture.componentRef.setInput('advance', mockAdvancePending);
        fixture.componentRef.setInput('isAdmin', false);
        fixture.detectChanges();

        const buttons = fixture.debugElement
          .queryAll(By.css('.footer-actions p-button'))
          .map((btn) => btn.attributes['label'])
          .filter(Boolean);

        expect(buttons).not.toContain('Approve');
        expect(buttons).not.toContain('Reject');
        expect(buttons).not.toContain('Mark as Reviewed');
      });
    });

    it('should always show the Close button', () => {
      fixture.componentRef.setInput('advance', mockAdvancePending);
      fixture.detectChanges();

      const buttons = fixture.debugElement
        .queryAll(By.css('.footer-actions p-button'))
        .map((btn) => btn.attributes['label'])
        .filter(Boolean);

      expect(buttons).toContain('Close');
    });
  });
});
