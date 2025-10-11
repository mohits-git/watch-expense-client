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
import { Router } from '@angular/router';
import { DEFAULTS, APP_ROUTES } from '@/shared/constants';
import { FormState, LoginFormFields } from '@/shared/types';
import { getRouteSegments } from '@/shared/utils/routes.util';
import { getValidationErrors } from '@/shared/utils/validation.util';
import { FieldErrorMessagesComponent } from '@/shared/components/field-error-messages/field-error-messages.component';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

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

  formState = signal<FormState>(DEFAULTS.FORM_STATE);

  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
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
        next: () => {
          this.router.navigate(getRouteSegments(APP_ROUTES.DASHBOARD));
          this.formState.update((prev) => ({ ...prev, loading: false }));
          this.form.reset();
        },
        error: () => {
          this.formState.update((prev) => ({ ...prev, loading: false }));
        },
      });
  }

  isInvalidField(field: LoginFormFields) {
    return (
      this.form.controls[field].invalid &&
      (this.form.controls[field].dirty || this.form.controls[field].touched)
    );
  }

  getFieldErrors(field: LoginFormFields): string[] {
    const errors = this.form.controls[field]?.errors;
    if (!errors) return [];
    return getValidationErrors(errors);
  }
}
