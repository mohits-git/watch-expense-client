import { DEFAULTS } from '@/shared/constants';
import { InputType } from '@/shared/types/form-input.type';
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
  type = input<InputType>(DEFAULTS.INPUT_TYPE);
  label = input.required<string>();
  invalid = input<boolean>(false);
  errorMessages = input<string[]>([]);
}
