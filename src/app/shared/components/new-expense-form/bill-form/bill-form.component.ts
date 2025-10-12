import {
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import {
  FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from 'primeng/fileupload';
import { FieldErrorMessagesComponent } from '../../field-error-messages/field-error-messages.component';
import { AddNewBillFormFields, FormState, NewBillForm } from '@/shared/types';
import { getFieldValidationErrors, isFieldInvalid } from '@/shared/utils/validation.util';
import { EXPENSE_FORM_CONSTANTS } from '@/shared/constants';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ImageUploadService } from '@/shared/services/image-upload.service';

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
  private imageUploadService = inject(ImageUploadService);
  private fileUploadRef = viewChild<FileUpload>('fu');
  formGroup = input.required<FormGroup<NewBillForm>>();
  index = input.required<number>();
  remove = output<void>();
  removeable = input.required<boolean>();
  formState = input.required<FormState>();

  uploadHandler(event: FileSelectEvent) {
    this.imageUploadService.uploadImage(event.files[0]).subscribe({
      next: (imageUrl) => {
        this.formGroup().patchValue({ attachmentUrl: imageUrl });
      },
      error: () => {
        this.fileUploadRef()?.clear();
      },
    });
  }

  clearFile() {
    const attachmentUrl = this.formGroup().controls['attachmentUrl'].value;
    this.formGroup().patchValue({ attachmentUrl: '' });
    this.fileUploadRef()?.clear();
    if (!attachmentUrl) return;
    this.imageUploadService.deleteImage(attachmentUrl, true).subscribe()
  }

  isInvalidField(field: AddNewBillFormFields): boolean {
    return isFieldInvalid(this.formGroup().controls[field]);
  }

  getFieldErrors(field: AddNewBillFormFields): string[] {
    const control = this.formGroup().controls[field];
    const fieldLabels: { [key: string]: string } = {
      amount: EXPENSE_FORM_CONSTANTS.FIELD_LABELS.BILL_AMOUNT,
      description: EXPENSE_FORM_CONSTANTS.FIELD_LABELS.BILL_DESCRIPTION,
      attachmentUrl: EXPENSE_FORM_CONSTANTS.FIELD_LABELS.ATTACHMENT
    };
    return getFieldValidationErrors(control, fieldLabels[field]);
  }
}
