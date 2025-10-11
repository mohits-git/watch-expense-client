import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { FieldErrorMessagesComponent } from '../../field-error-messages/field-error-messages.component';
import { AddNewBillFormFields, FormState, NewBillForm } from '@/shared/types';
import { getValidationErrors } from '@/shared/utils/validation.util';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-bill-form',
  imports: [
    ReactiveFormsModule,
    FloatLabel,
    InputTextModule,
    TextareaModule,
    FileUploadModule,
    FieldErrorMessagesComponent,
    ButtonModule,
    MessageModule,
  ],
  templateUrl: './bill-form.component.html',
  styleUrl: './bill-form.component.scss',
})
export class BillFormComponent {
  formGroup = input.required<FormGroup<NewBillForm>>();
  index = input.required<number>();
  remove = output<void>();
  removeable = input.required<boolean>();
  formState = input.required<FormState>();

  uploadHandler(event: FileSelectEvent) {
    // TODO: image upload service -> upload image -> get url -> update form
    this.formGroup().patchValue({ attachmentUrl: event.currentFiles[0].name });
  }

  isInvalidField(field: AddNewBillFormFields): boolean {
    return (
      this.formGroup().controls[field].invalid &&
      (this.formGroup().controls[field].touched ||
        this.formGroup().controls[field].dirty)
    );
  }

  getFieldErrors(field: AddNewBillFormFields): string[] {
    const errors = this.formGroup().controls[field]?.errors;
    if (!errors) return [];
    return getValidationErrors(errors);
  }
}
