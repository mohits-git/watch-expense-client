import { Component, input } from '@angular/core';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-field-error-messages',
  imports: [MessageModule],
  templateUrl: './field-error-messages.component.html',
  styleUrl: './field-error-messages.component.scss',
  host: {
    class: "error-container"
  }
})
export class FieldErrorMessagesComponent {
  errors = input<string[]>([]);
}
