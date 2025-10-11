import { ExpensesService } from '@/shared/services/expenses.service';
import {
  AddNewExpenseFormFields,
  Bill,
  Expense,
  NewExpenseForm,
  ExpenseCreateResult,
} from '@/shared/types';
import { getValidationErrors } from '@/shared/utils/validation.util';
import { Component, inject, model, output, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { FieldErrorMessagesComponent } from '../field-error-messages/field-error-messages.component';
import { BillFormComponent } from './bill-form/bill-form.component';
import { SumPipe } from '@/shared/pipes/sum.pipe';
import { CurrencyPipe } from '@angular/common';
import { TOAST_SUMMARIES, TOAST_TYPES, API_MESSAGES } from '@/shared/constants';

const defaultFormState = {
  loading: false,
  submitted: false,
};

@Component({
  selector: 'app-new-expense-form',
  imports: [
    Dialog,
    InputTextModule,
    ButtonModule,
    TextareaModule,
    ReactiveFormsModule,
    FloatLabel,
    MessageModule,
    FieldErrorMessagesComponent,
    BillFormComponent,
    SumPipe,
    CurrencyPipe,
  ],
  templateUrl: './new-expense-form.component.html',
  styleUrl: './new-expense-form.component.scss',
})
export class NewExpenseFormComponent {
  visible = model.required<boolean>();
  private expenseService = inject(ExpensesService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  onAddExpense = output<Expense>();

  formState = signal(defaultFormState);

  formGroup: FormGroup<NewExpenseForm> = new FormGroup({
    amount: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    purpose: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    description: new FormControl('', {
      validators: [],
    }),
    bills: new FormArray([this.newBill()], {
      validators: [Validators.minLength(1)],
    }),
  });

  newBill() {
    return new FormGroup({
      amount: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      description: new FormControl(''),
      attachmentUrl: new FormControl(''),
    });
  }

  addBill() {
    this.formGroup.controls.bills.push(this.newBill());
  }

  removeBill(index: number) {
    this.formGroup.controls.bills.removeAt(index);
  }

  onCancel() {
    this.formGroup.reset();
    this.visible.set(false);
    this.formState.set(defaultFormState);
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      this.formState.update((state) => ({ ...state, submitted: true }));
      return;
    }
    this.formState.set({ submitted: true, loading: true });
    this.expenseService
      .addNewExpense({
        amount: this.formGroup.value.amount!,
        purpose: this.formGroup.value.purpose!,
        description: this.formGroup.value.description || '',
        bills: this.formGroup.value.bills! as Bill[],
      })
      .subscribe({
        next: (result: ExpenseCreateResult) => {
          if (result.success && result.data) {
            this.messageService.add({
              severity: TOAST_TYPES.SUCCESS,
              summary: TOAST_SUMMARIES.SUCCESS,
              detail: API_MESSAGES.EXPENSE.ADD_EXPENSE_SUCCESS,
            });

            this.visible.set(false);
            this.formGroup.reset();
            this.router.navigate(['/expenses'], {
              queryParamsHandling: 'preserve',
              skipLocationChange: true,
            });
            this.formState.set(defaultFormState);
            this.onAddExpense.emit(result.data);
          } else {
            this.messageService.add({
              severity: TOAST_TYPES.ERROR,
              summary: TOAST_SUMMARIES.ERROR,
              detail: result.message || API_MESSAGES.EXPENSE.ADD_EXPENSE_ERROR,
            });
            this.formState.update((state) => ({ ...state, loading: false }));
          }
        },
        error: (result: ExpenseCreateResult) => {
          this.formState.update((state) => ({ ...state, loading: false }));
          this.messageService.add({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: result.message || API_MESSAGES.EXPENSE.ADD_EXPENSE_ERROR,
          });
        },
      });
  }

  isInvalidField(field: AddNewExpenseFormFields) {
    return (
      this.formGroup.controls[field].invalid &&
      (this.formGroup.controls[field].touched ||
        this.formGroup.controls[field].dirty)
    );
  }

  getFieldErrors(field: AddNewExpenseFormFields): string[] {
    const errors = this.formGroup.controls[field]?.errors;
    if (!errors) return [];
    return getValidationErrors(errors);
  }
}
