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
import { AuthService } from '../../services/auth.serivce';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

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
  private messageService = inject(MessageService);
  private router = inject(Router);
  private authService = inject(AuthService);

  formState = signal({
    loading: false,
    submitted: false,
  })
  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      validators: [Validators.required, validatePassword],
    }),
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.formState.update(prev => ({ ...prev, loading: true }))
    this.authService
      .login(this.form.value.email!, this.form.value.password!)
      .subscribe({
        next: () => {
          this.router.navigate(['dashboard']);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Logged In Successfully',
          });
          this.formState.update(prev => ({ ...prev, submitted: true }))
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message,
          });
        },
        complete: () => {
          this.formState.update(prev => ({ ...prev, loading: false }))
        }
      });
    this.form.reset();
  }

  get invalidEmail() {
    return (
      this.form.controls.email.invalid &&
      (this.form.controls.email.dirty || this.form.controls.email.touched)
    );
  }

  get invalidPassword() {
    return (
      this.form.controls.password.invalid &&
      (this.form.controls.password.dirty || this.form.controls.password.touched)
    );
  }
}
