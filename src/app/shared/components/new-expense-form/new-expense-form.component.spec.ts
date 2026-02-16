import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { NewExpenseFormComponent } from './new-expense-form.component';
import { ExpensesService } from '@/shared/services/expenses.service';
import { ImageUploadService } from '@/shared/services/image-upload.service';
import { MessageService } from 'primeng/api';
import { Expense, ExpenseCreateResult, RequestStatus } from '@/shared/types';

describe('NewExpenseFormComponent', () => {
  let component: NewExpenseFormComponent;
  let fixture: ComponentFixture<NewExpenseFormComponent>;
  let expensesServiceSpy: jasmine.SpyObj<ExpensesService>;
  let imageUploadServiceSpy: jasmine.SpyObj<ImageUploadService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const createdExpense: Expense = {
    id: 'exp-1',
    userId: 'user-1',
    amount: 4000,
    purpose: 'Team travel',
    status: RequestStatus.Pending,
    description: 'Travel reimbursement',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    approvedBy: null,
    approvedAt: null,
    reviewedBy: null,
    reviewedAt: null,
    isReconciled: false,
    advanceId: null,
    bills: [
      {
        id: 'bill-1',
        expenseId: 'exp-1',
        amount: 4000,
        description: 'Flight',
        attachmentUrl: '',
      },
    ],
  };

  beforeEach(async () => {
    expensesServiceSpy = jasmine.createSpyObj<ExpensesService>('ExpensesService', [
      'addNewExpense',
    ]);
    expensesServiceSpy.addNewExpense.and.returnValue(
      of({ success: true, data: createdExpense } as ExpenseCreateResult),
    );

    imageUploadServiceSpy = jasmine.createSpyObj<ImageUploadService>('ImageUploadService', [
      'uploadImage',
      'deleteImage',
    ]);
    imageUploadServiceSpy.uploadImage.and.returnValue(of('https://image.test/bill.png'));
    imageUploadServiceSpy.deleteImage.and.returnValue(of(true));

    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NewExpenseFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ExpensesService, useValue: expensesServiceSpy },
        { provide: ImageUploadService, useValue: imageUploadServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewExpenseFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
  });

  function setValidFormData() {
    component.formGroup.patchValue({
      amount: 4000,
      purpose: 'Team travel',
      description: 'Travel reimbursement',
      bills: [
        {
          amount: 4000,
          description: 'Flight',
          attachmentUrl: '',
        },
      ],
    });
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with one bill form group', () => {
    expect(component.formGroup.controls.bills.length).toBe(1);
  });

  it('should toggle reconciliation mode when advanceId is provided', () => {
    fixture.componentRef.setInput('advanceId', 'adv-123');
    fixture.detectChanges();

    expect(component.isReconciliationExpense()).toBeTrue();
    const info = fixture.debugElement.query(By.css('.reconciliation-info'));
    expect(info).toBeTruthy();
  });

  it('should add and remove bill controls', () => {
    component.addBill();
    expect(component.formGroup.controls.bills.length).toBe(2);

    component.removeBill(1);
    expect(component.formGroup.controls.bills.length).toBe(1);
  });

  it('should not submit when form is invalid', () => {
    component.formGroup.patchValue({ amount: 0, purpose: '' });

    component.onSubmit();

    expect(expensesServiceSpy.addNewExpense).not.toHaveBeenCalled();
    expect(component.formState().submitted).toBeTrue();
    expect(component.formState().loading).toBeFalse();
  });

  it('should reset form and hide dialog on cancel', () => {
    setValidFormData();
    component.formState.set({ submitted: true, loading: true });

    component.onCancel();

    expect(component.visible()).toBeFalse();
    expect(component.formState()).toEqual({ submitted: false, loading: false });
    expect(component.formGroup.controls.purpose.value).toBe('');
    expect(component.formGroup.controls.amount.value).toBe(0);
  });

  it('should submit valid non-reconciliation expense and emit on success', () => {
    setValidFormData();
    const emitSpy = spyOn(component.onAddExpense, 'emit');

    component.onSubmit();

    expect(expensesServiceSpy.addNewExpense).toHaveBeenCalledWith(
      jasmine.objectContaining({
        amount: 4000,
        purpose: 'Team travel',
        description: 'Travel reimbursement',
        isReconciled: false,
      }),
    );
    expect(messageServiceSpy.add).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/expenses'], {
      queryParamsHandling: 'preserve',
      skipLocationChange: true,
    });
    expect(component.visible()).toBeFalse();
    expect(emitSpy).toHaveBeenCalledWith(createdExpense);
  });

  it('should submit reconciliation expense with advanceId', () => {
    fixture.componentRef.setInput('advanceId', 'adv-123');
    fixture.detectChanges();
    setValidFormData();

    component.onSubmit();

    expect(expensesServiceSpy.addNewExpense).toHaveBeenCalledWith(
      jasmine.objectContaining({
        isReconciled: true,
        advanceId: 'adv-123',
      }),
    );
  });

  it('should handle unsuccessful submit response', () => {
    expensesServiceSpy.addNewExpense.and.returnValue(
      of({ success: false, message: 'Unable to create expense' } as ExpenseCreateResult),
    );
    setValidFormData();
    const emitSpy = spyOn(component.onAddExpense, 'emit');

    component.onSubmit();

    expect(messageServiceSpy.add).toHaveBeenCalled();
    expect(component.formState().loading).toBeFalse();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should handle submit error and stop loading', () => {
    expensesServiceSpy.addNewExpense.and.returnValue(
      throwError(() => ({ message: 'Network failure' } as ExpenseCreateResult)),
    );
    setValidFormData();

    component.onSubmit();

    expect(messageServiceSpy.add).toHaveBeenCalled();
    expect(component.formState().loading).toBeFalse();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
