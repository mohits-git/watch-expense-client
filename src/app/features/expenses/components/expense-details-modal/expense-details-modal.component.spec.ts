import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ExpenseDetailsModalComponent } from './expense-details-modal.component';
import { MessageService } from 'primeng/api';
import { ExpensesService } from '@/shared/services/expenses.service';
import { AdvancesService } from '@/shared/services/advances.service';
import { ImageUploadService } from '@/shared/services/image-upload.service';
import { Expense, Advance, RequestStatus, Bill } from '@/shared/types';
import { API_MESSAGES } from '@/shared/constants';

describe('ExpenseDetailsModalComponent', () => {
  let component: ExpenseDetailsModalComponent;
  let fixture: ComponentFixture<ExpenseDetailsModalComponent>;
  let expensesServiceSpy: jasmine.SpyObj<ExpensesService>;
  let advancesServiceSpy: jasmine.SpyObj<AdvancesService>;
  let imageServiceSpy: jasmine.SpyObj<ImageUploadService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const mockBills: Bill[] = [
    {
      id: 'bill-1',
      expenseId: 'exp-1',
      amount: 2000,
      description: 'Hotel bill',
      attachmentUrl: 'https://example.com/bill1.pdf',
    },
    {
      id: 'bill-2',
      expenseId: 'exp-1',
      amount: 1500,
      description: 'Flight ticket',
      attachmentUrl: 'https://example.com/bill2.pdf',
    },
  ];

  const mockExpensePending: Expense = {
    id: 'exp-1',
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
    isReconciled: false,
    advanceId: null,
    bills: mockBills,
  };

  const mockExpenseApproved: Expense = {
    ...mockExpensePending,
    id: 'exp-2',
    status: RequestStatus.Approved,
    approvedBy: 'admin-1',
    approvedAt: new Date('2026-01-16T10:00:00Z').getTime(),
  };

  const mockExpenseReconciliation: Expense = {
    ...mockExpensePending,
    id: 'exp-3',
    status: RequestStatus.Approved,
    isReconciled: true,
    advanceId: 'adv-1',
  };

  const mockExpenseReviewed: Expense = {
    ...mockExpensePending,
    id: 'exp-4',
    status: RequestStatus.Reviewed,
    reviewedBy: 'admin-1',
    reviewedAt: new Date('2026-01-17T10:00:00Z').getTime(),
  };

  const mockExpenseRejected: Expense = {
    ...mockExpensePending,
    id: 'exp-5',
    status: RequestStatus.Rejected,
  };

  const mockAdvance: Advance = {
    id: 'adv-1',
    userId: 'user-1',
    amount: 4000,
    purpose: 'Project advance',
    status: RequestStatus.Approved,
    description: 'Pre-approved budget',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    approvedBy: 'admin-1',
    approvedAt: Date.now(),
    reviewedBy: null,
    reviewedAt: null,
    reconciledExpenseId: 'exp-3',
  };

  beforeEach(async () => {
    expensesServiceSpy = jasmine.createSpyObj<ExpensesService>('ExpensesService', [
      'updateExpenseStatus',
    ]);
    expensesServiceSpy.updateExpenseStatus.and.returnValue(of(undefined));

    advancesServiceSpy = jasmine.createSpyObj<AdvancesService>('AdvancesService', [
      'fetchAdvanceById',
    ]);
    advancesServiceSpy.fetchAdvanceById.and.returnValue(of(mockAdvance));

    imageServiceSpy = jasmine.createSpyObj<ImageUploadService>('ImageUploadService', [
      'getImageDownloadUrl',
    ]);
    imageServiceSpy.getImageDownloadUrl.and.returnValue(
      of('https://example.com/download-url'),
    );

    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [ExpenseDetailsModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: ExpensesService, useValue: expensesServiceSpy },
        { provide: AdvancesService, useValue: advancesServiceSpy },
        { provide: ImageUploadService, useValue: imageServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('expense', null);
    fixture.componentRef.setInput('isAdmin', false);
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('computed properties', () => {
    describe('canApprove', () => {
      it('should return true when expense is Pending', () => {
        fixture.componentRef.setInput('expense', mockExpensePending);
        fixture.detectChanges();

        expect(component.canApprove()).toBeTrue();
      });

      it('should return true when expense is Reviewed', () => {
        fixture.componentRef.setInput('expense', mockExpenseReviewed);
        fixture.detectChanges();

        expect(component.canApprove()).toBeTrue();
      });

      it('should return false when expense is Approved', () => {
        fixture.componentRef.setInput('expense', mockExpenseApproved);
        fixture.detectChanges();

        expect(component.canApprove()).toBeFalse();
      });

      it('should return false when expense is Rejected', () => {
        fixture.componentRef.setInput('expense', mockExpenseRejected);
        fixture.detectChanges();

        expect(component.canApprove()).toBeFalse();
      });
    });

    describe('canReject', () => {
      it('should return true when expense is Pending', () => {
        fixture.componentRef.setInput('expense', mockExpensePending);
        fixture.detectChanges();

        expect(component.canReject()).toBeTrue();
      });

      it('should return false when expense is Approved', () => {
        fixture.componentRef.setInput('expense', mockExpenseApproved);
        fixture.detectChanges();

        expect(component.canReject()).toBeFalse();
      });

      it('should return false when expense is Reviewed', () => {
        fixture.componentRef.setInput('expense', mockExpenseReviewed);
        fixture.detectChanges();

        expect(component.canReject()).toBeFalse();
      });
    });

    describe('canMarkReviewed', () => {
      it('should return true when expense is Pending', () => {
        fixture.componentRef.setInput('expense', mockExpensePending);
        fixture.detectChanges();

        expect(component.canMarkReviewed()).toBeTrue();
      });

      it('should return false when expense is Approved', () => {
        fixture.componentRef.setInput('expense', mockExpenseApproved);
        fixture.detectChanges();

        expect(component.canMarkReviewed()).toBeFalse();
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

  describe('approveExpense', () => {
    it('should call updateExpenseStatus with Approved, show success toast, emit and close', () => {
      fixture.componentRef.setInput('expense', mockExpensePending);
      fixture.componentRef.setInput('isAdmin', true);
      fixture.detectChanges();

      const statusChangeSpy = spyOn(component.onStatusChange, 'emit');

      component.approveExpense();

      expect(expensesServiceSpy.updateExpenseStatus).toHaveBeenCalledWith(
        'exp-1',
        RequestStatus.Approved,
      );
      expect(component.isProcessing()).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'success',
          detail: API_MESSAGES.EXPENSE.EXPENSE_APPROVED,
        }),
      );
      expect(statusChangeSpy).toHaveBeenCalledWith(RequestStatus.Approved);
      expect(component.visible()).toBeFalse();
    });

    it('should do nothing when expense is null', () => {
      fixture.componentRef.setInput('expense', null);
      fixture.detectChanges();

      component.approveExpense();

      expect(expensesServiceSpy.updateExpenseStatus).not.toHaveBeenCalled();
    });

    it('should show error toast and stop processing on error', () => {
      expensesServiceSpy.updateExpenseStatus.and.returnValue(
        throwError(() => ({ error: { message: 'Approval failed' } })),
      );
      fixture.componentRef.setInput('expense', mockExpensePending);
      fixture.detectChanges();

      component.approveExpense();

      expect(component.isProcessing()).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    });

    it('should set isProcessing to true while request is in flight', () => {
      fixture.componentRef.setInput('expense', mockExpensePending);
      fixture.detectChanges();

      component.isProcessing.set(false);
      expensesServiceSpy.updateExpenseStatus.and.callFake(() => {
        expect(component.isProcessing()).toBeTrue();
        return of(undefined);
      });

      component.approveExpense();
    });
  });

  describe('rejectExpense', () => {
    it('should call updateExpenseStatus with Rejected, show success toast, emit and close', () => {
      fixture.componentRef.setInput('expense', mockExpensePending);
      fixture.componentRef.setInput('isAdmin', true);
      fixture.detectChanges();

      const statusChangeSpy = spyOn(component.onStatusChange, 'emit');

      component.rejectExpense();

      expect(expensesServiceSpy.updateExpenseStatus).toHaveBeenCalledWith(
        'exp-1',
        RequestStatus.Rejected,
      );
      expect(component.isProcessing()).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'success',
          detail: API_MESSAGES.EXPENSE.EXPENSE_REJECTED,
        }),
      );
      expect(statusChangeSpy).toHaveBeenCalledWith(RequestStatus.Rejected);
      expect(component.visible()).toBeFalse();
    });

    it('should do nothing when expense is null', () => {
      fixture.componentRef.setInput('expense', null);
      fixture.detectChanges();

      component.rejectExpense();

      expect(expensesServiceSpy.updateExpenseStatus).not.toHaveBeenCalled();
    });

    it('should show error toast on failure', () => {
      expensesServiceSpy.updateExpenseStatus.and.returnValue(
        throwError(() => ({ error: { message: 'Rejection failed' } })),
      );
      fixture.componentRef.setInput('expense', mockExpensePending);
      fixture.detectChanges();

      component.rejectExpense();

      expect(component.isProcessing()).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    });
  });

  describe('markAsReviewed', () => {
    it('should call updateExpenseStatus with Reviewed, show success toast, emit and close', () => {
      fixture.componentRef.setInput('expense', mockExpensePending);
      fixture.componentRef.setInput('isAdmin', true);
      fixture.detectChanges();

      const statusChangeSpy = spyOn(component.onStatusChange, 'emit');

      component.markAsReviewed();

      expect(expensesServiceSpy.updateExpenseStatus).toHaveBeenCalledWith(
        'exp-1',
        RequestStatus.Reviewed,
      );
      expect(component.isProcessing()).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'success',
          detail: API_MESSAGES.EXPENSE.EXPENSE_REVIEWED,
        }),
      );
      expect(statusChangeSpy).toHaveBeenCalledWith(RequestStatus.Reviewed);
      expect(component.visible()).toBeFalse();
    });

    it('should do nothing when expense is null', () => {
      fixture.componentRef.setInput('expense', null);
      fixture.detectChanges();

      component.markAsReviewed();

      expect(expensesServiceSpy.updateExpenseStatus).not.toHaveBeenCalled();
    });

    it('should show error toast on failure', () => {
      expensesServiceSpy.updateExpenseStatus.and.returnValue(
        throwError(() => ({ error: { message: 'Review failed' } })),
      );
      fixture.componentRef.setInput('expense', mockExpensePending);
      fixture.detectChanges();

      component.markAsReviewed();

      expect(component.isProcessing()).toBeFalse();
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    });
  });

  describe('fetchRelatedAdvance', () => {
    it('should fetch and set the related advance', () => {
      fixture.detectChanges();

      component.fetchRelatedAdvance('adv-1');

      expect(advancesServiceSpy.fetchAdvanceById).toHaveBeenCalledWith('adv-1');
      expect(component.relatedAdvance()).toEqual(mockAdvance);
      expect(component.loadingAdvance()).toBeFalse();
    });

    it('should stop loading on error', () => {
      advancesServiceSpy.fetchAdvanceById.and.returnValue(
        throwError(() => new Error('Not found')),
      );
      fixture.detectChanges();

      component.fetchRelatedAdvance('adv-1');

      expect(component.loadingAdvance()).toBeFalse();
      expect(component.relatedAdvance()).toBeNull();
    });
  });

  describe('effect: auto-fetch related advance', () => {
    it('should fetch related advance when expense has advanceId', () => {
      fixture.componentRef.setInput('expense', mockExpenseReconciliation);
      fixture.detectChanges();

      expect(advancesServiceSpy.fetchAdvanceById).toHaveBeenCalledWith('adv-1');
      expect(component.relatedAdvance()).toEqual(mockAdvance);
    });

    it('should clear related advance when expense has no advanceId', () => {
      fixture.componentRef.setInput('expense', mockExpensePending);
      fixture.detectChanges();

      expect(component.relatedAdvance()).toBeNull();
    });

    it('should clear related advance when expense is null', () => {
      fixture.componentRef.setInput('expense', null);
      fixture.detectChanges();

      expect(component.relatedAdvance()).toBeNull();
    });
  });

  describe('downloadAttachment', () => {
    it('should get download URL and trigger download', () => {
      fixture.detectChanges();

      // Create a mock anchor element that prevents actual navigation
      const mockLink = {
        href: '',
        download: '',
        click: jasmine.createSpy('click'),
      } as any;

      const createElementSpy = spyOn(document, 'createElement').and.returnValue(mockLink);
      const appendChildSpy = spyOn(document.body, 'appendChild').and.stub();
      const removeChildSpy = spyOn(document.body, 'removeChild').and.stub();

      component.downloadAttachment('https://example.com/bill1.pdf');

      expect(imageServiceSpy.getImageDownloadUrl).toHaveBeenCalledWith(
        'https://example.com/bill1.pdf',
      );
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('https://example.com/download-url');
      expect(mockLink.download).toBe('bill1.pdf');
      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
    });

    it('should show error toast when download URL fetch fails', () => {
      imageServiceSpy.getImageDownloadUrl.and.returnValue(
        throwError(() => ({ message: 'Download failed' })),
      );
      fixture.detectChanges();

      component.downloadAttachment('https://example.com/bill1.pdf');

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    });
  });

  describe('template rendering', () => {
    it('should render the dialog', () => {
      fixture.componentRef.setInput('expense', mockExpensePending);
      fixture.detectChanges();

      const dialog = fixture.debugElement.query(By.css('p-dialog'));
      expect(dialog).toBeTruthy();
    });

    it('should display expense details when expense is provided', () => {
      fixture.componentRef.setInput('expense', mockExpensePending);
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Travel expenses');
      expect(hostText).toContain('5000');
      expect(hostText).toContain('Business trip to Mumbai');
    });

    it('should show approved by details when expense has approvedBy', () => {
      fixture.componentRef.setInput('expense', mockExpenseApproved);
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Approved By');
      expect(hostText).toContain('admin-1');
    });

    it('should show reviewed by details when expense has reviewedBy', () => {
      fixture.componentRef.setInput('expense', mockExpenseReviewed);
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Reviewed By');
      expect(hostText).toContain('admin-1');
    });

    it('should show reconciliation badge when expense is reconciliation', () => {
      fixture.componentRef.setInput('expense', mockExpenseReconciliation);
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('reconciling an advance');
    });

    it('should show bills section when expense has bills', () => {
      fixture.componentRef.setInput('expense', mockExpensePending);
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Bills');
      expect(hostText).toContain('Hotel bill');
      expect(hostText).toContain('Flight ticket');
    });

    it('should show related advance details when expense is reconciliation and advance is loaded', () => {
      fixture.componentRef.setInput('expense', mockExpenseReconciliation);
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('Related Advance Details');
      expect(hostText).toContain('Project advance');
    });

    describe('admin actions', () => {
      it('should show Approve, Reject and Mark as Reviewed buttons for pending expense', () => {
        fixture.componentRef.setInput('expense', mockExpensePending);
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

      it('should show Approve button for reviewed expense', () => {
        fixture.componentRef.setInput('expense', mockExpenseReviewed);
        fixture.componentRef.setInput('isAdmin', true);
        fixture.detectChanges();

        const buttons = fixture.debugElement
          .queryAll(By.css('.footer-actions p-button'))
          .map((btn) => btn.attributes['label'])
          .filter(Boolean);

        expect(buttons).toContain('Approve');
      });

      it('should not show action buttons for rejected expense', () => {
        fixture.componentRef.setInput('expense', mockExpenseRejected);
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

    describe('employee view', () => {
      it('should not show admin action buttons for employee', () => {
        fixture.componentRef.setInput('expense', mockExpensePending);
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
      fixture.componentRef.setInput('expense', mockExpensePending);
      fixture.detectChanges();

      const buttons = fixture.debugElement
        .queryAll(By.css('.footer-actions p-button'))
        .map((btn) => btn.attributes['label'])
        .filter(Boolean);

      expect(buttons).toContain('Close');
    });
  });
});
