import { DefaultFormState } from '@/shared/constants/defaults/default-form-state';
import { FormState } from '@/shared/types/form-state.type';
import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-input-form-control',
  imports: [FloatLabel, InputTextModule, MessageModule, ReactiveFormsModule],
  templateUrl: './input-form-control.component.html',
  styleUrl: './input-form-control.component.scss',
  host: {
    class: 'form-control',
  },
})
export class InputFormControlComponent {
  name = input.required<string>();
  type = input<string>('text');
  label = input.required<string>();
  formState = input<FormState>(DefaultFormState);
  invalid = input<boolean>(false);
  errorMessages = input<string[]>([]);
}
