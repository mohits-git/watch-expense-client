import { AdvancesService } from '@/shared/services/advances.service';
import {
  AddNewAdvanceFormFields,
  Advance,
  NewAdvanceForm,
} from '@/shared/types';
import { getValidationErrors } from '@/shared/utils/validation.util';
import { Component, inject, model, output, signal } from '@angular/core';
import {
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
import { FieldErrorMessagesComponent } from '../field-error-messages/field-error-messages.component';

const defaultFormState = {
  loading: false,
  submitted: false,
};

@Component({
  selector: 'app-new-advance-form',
  imports: [
    Dialog,
    InputTextModule,
    ButtonModule,
    TextareaModule,
    ReactiveFormsModule,
    FloatLabel,
    MessageModule,
    FieldErrorMessagesComponent,
  ],
  templateUrl: './new-advance-form.component.html',
  styleUrl: './new-advance-form.component.scss',
})
export class NewAdvanceFormComponent {
  visible = model.required<boolean>();
  private advanceService = inject(AdvancesService);
  private router = inject(Router);
  onAddAdvance = output<Advance>();

  formState = signal(defaultFormState);

  formGroup: FormGroup<NewAdvanceForm> = new FormGroup({
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
  });

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
    this.advanceService
      .addNewAdvance({
        amount: this.formGroup.value.amount!,
        purpose: this.formGroup.value.purpose!,
        description: this.formGroup.value.description || '',
      })
      .subscribe({
        next: (advance: Advance) => {
          this.visible.set(false);
          this.formGroup.reset();
          this.router.navigate(['/advances'], {
            queryParamsHandling: 'preserve',
            skipLocationChange: true,
          });
          this.formState.set(defaultFormState);
          this.onAddAdvance.emit(advance);
        },
        error: () => {
          this.formState.update((state) => ({ ...state, loading: false }));
        },
      });
  }

  isInvalidField(field: AddNewAdvanceFormFields) {
    return (
      this.formGroup.controls[field].invalid &&
      (this.formGroup.controls[field].touched ||
        this.formGroup.controls[field].dirty)
    );
  }

  getFieldErrors(field: AddNewAdvanceFormFields): string[] {
    const errors = this.formGroup.controls[field]?.errors;
    if (!errors) return [];
    return getValidationErrors(errors);
  }
}
