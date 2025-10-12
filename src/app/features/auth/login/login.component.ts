import { CardComponent } from '@/shared/components/card/card.component';
import { validatePassword } from '@/shared/validators/password-validator';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '@/shared/services/auth.serivce';
import { LoginResult } from '@/shared/types';
import { Router } from '@angular/router';
import {
  DEFAULTS,
  APP_ROUTES,
  AUTH_MESSAGES,
  TOAST_SUMMARIES,
  TOAST_TYPES,
  LOGIN_FORM_CONSTANTS,
} from '@/shared/constants';
import { FormState, LoginForm, LoginFormFields } from '@/shared/types';
import { getRouteSegments } from '@/shared/utils/routes.util';
import { getFieldValidationErrors, isFieldInvalid } from '@/shared/utils/validation.util';
import { FieldErrorMessagesComponent } from '@/shared/components/field-error-messages/field-error-messages.component';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  imports: [
    CardComponent,
    ReactiveFormsModule,
    InputTextModule,
    FloatLabel,
    ButtonModule,
    FieldErrorMessagesComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  formState = signal<FormState>(DEFAULTS.FORM_STATE);

  form: FormGroup<LoginForm> = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, validatePassword],
    }),
  });

  onSubmit() {
    if (this.form.invalid) {
      this.formState.update((prev) => ({ ...prev, submitted: true }));
      return;
    }
    this.formState.set({ submitted: true, loading: true });
    this.authService
      .login(this.form.value.email!, this.form.value.password!)
      .subscribe({
        next: (result: LoginResult) => {
          if (result.success) {
            this.messageService.add({
              severity: TOAST_TYPES.SUCCESS,
              summary: TOAST_SUMMARIES.SUCCESS,
              detail: AUTH_MESSAGES.LOGIN_SUCCESS,
            });
            this.router.navigate(getRouteSegments(APP_ROUTES.DASHBOARD));
            this.form.reset();
          } else if (result.error) {
            this.messageService.add({
              severity: TOAST_TYPES.ERROR,
              summary: TOAST_SUMMARIES.ERROR,
              detail: result.error.message,
            });
          }
          this.formState.update((prev) => ({ ...prev, loading: false }));
        },
        error: (loginResult: LoginResult) => {
          if (loginResult.error) {
            this.messageService.add({
              severity: TOAST_TYPES.ERROR,
              summary: TOAST_SUMMARIES.ERROR,
              detail: loginResult.error.message,
            });
          }
          this.formState.update((prev) => ({ ...prev, loading: false }));
        },
      });
  }

  isInvalidField(field: LoginFormFields) {
    return isFieldInvalid(this.form.controls[field]);
  }

  getFieldErrors(field: LoginFormFields): string[] {
    const control = this.form.controls[field];
    const fieldLabels: { [key: string]: string } = {
      email: LOGIN_FORM_CONSTANTS.FIELD_LABELS.EMAIL,
      password: LOGIN_FORM_CONSTANTS.FIELD_LABELS.PASSWORD
    };
    return getFieldValidationErrors(control, fieldLabels[field]);
  }
}
