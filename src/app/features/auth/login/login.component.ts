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
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '@/shared/services/auth.serivce';
import { Router } from '@angular/router';
import { DEFAULTS } from '@/shared/constants/default.constants';
import { FormState } from '@/shared/types/form-state.type';
import { getRouteSegments } from '@/shared/utils/routes.util';
import { APP_ROUTES } from '@/shared/constants/routes.constants';
import { LoginFormFields } from '@/shared/types/login-form.type';

@Component({
  selector: 'app-login',
  imports: [
    CardComponent,
    ReactiveFormsModule,
    InputTextModule,
    FloatLabel,
    PasswordModule,
    ButtonModule,
    MessageModule,
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
}
