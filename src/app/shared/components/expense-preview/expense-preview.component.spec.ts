import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

import { ExpensePreviewComponent } from './expense-preview.component';
import { Expense, RequestStatus } from '@/shared/types';

describe('ExpensePreviewComponent', () => {
  let component: ExpensePreviewComponent;
  let fixture: ComponentFixture<ExpensePreviewComponent>;

  const mockExpense: Expense = {
    id: 'exp-1',
    userId: 'user-1',
    amount: 1234,
    purpose: 'Client visit',
    status: RequestStatus.Pending,
    description: 'Travel and meal',
    createdAt: new Date('2026-01-01T10:30:00.000Z').getTime(),
    updatedAt: new Date('2026-01-01T10:30:00.000Z').getTime(),
    approvedBy: null,
    approvedAt: null,
    reviewedBy: null,
    reviewedAt: null,
    isReconciled: false,
    advanceId: null,
    bills: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensePreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensePreviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('expense', mockExpense);
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should render purpose, amount and created date from expense input', () => {
    fixture.componentRef.setInput('expense', mockExpense);
    fixture.detectChanges();

    const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
    const formattedDate = new DatePipe('en-US').transform(mockExpense.createdAt, 'medium');

    expect(hostText).toContain('Purpose: Client visit');
    expect(hostText).toContain('Amount:');
    expect(hostText).toContain('₹1,234.00');
    expect(hostText).toContain(`Requested on ${formattedDate}`);
  });

  it('should render preview inside shadow card container', () => {
    fixture.componentRef.setInput('expense', mockExpense);
    fixture.detectChanges();

    const cardElement = fixture.debugElement.query(By.css('div[card="shadow"]'));
    expect(cardElement).toBeTruthy();
    expect((cardElement.nativeElement as HTMLElement).classList.contains('shadow')).toBeTrue();
  });
});
