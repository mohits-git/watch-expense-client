import { ExpensesService } from '@/shared/services/expenses.service';
import { Component, inject, model, signal } from '@angular/core';
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
  ],
  templateUrl: './new-expense-form.component.html',
  styleUrl: './new-expense-form.component.scss',
})
export class NewExpenseFormComponent {
  visible = model.required<boolean>();
  private expenseService = inject(ExpensesService);
  private router = inject(Router);

  formState = signal(defaultFormState);

  formGroup = new FormGroup({
    amount: new FormControl(0, {
      validators: [Validators.required, Validators.min(0)],
    }),
    purpose: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)],
    }),
    description: new FormControl('', {
      validators: [],
    }),
    bills: new FormArray([this.addBill()], {
      validators: [Validators.minLength(1)],
    }),
  });

  addBill() {
    return new FormGroup({
      amount: new FormControl(0, {
        validators: [Validators.min(0)],
      }),
      description: new FormControl(''),
      attachmentUrl: new FormControl(''),
    });
  }

  removeBill(index: number) {
    this.formGroup.controls.bills.removeAt(index)
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
      })
      .subscribe({
        next: () => {
          this.visible.set(false);
          this.formGroup.reset();
          this.router.navigate(['/expenses'], {
            queryParamsHandling: 'preserve',
            skipLocationChange: true,
          });
          this.formState.set(defaultFormState);
        },
        error: () => {
          this.formState.update((state) => ({ ...state, loading: false }));
        },
      });
  }

  isInvalidField(field: 'amount' | 'purpose' | 'description') {
    return (
      this.formGroup.controls[field].invalid &&
      (this.formGroup.controls[field].touched ||
        this.formGroup.controls[field].dirty)
    );
  }
}
