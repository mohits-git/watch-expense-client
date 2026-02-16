import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { LoginComponent } from './login.component';
import { AuthService } from '@/shared/services/auth.serivce';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { LoginResult } from '@/shared/types';
import { ServiceErrorType } from '@/shared/enums';
import { APP_ROUTES, AUTH_MESSAGES } from '@/shared/constants';
import { getRouteSegments } from '@/shared/utils/routes.util';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const successLoginResult: LoginResult = {
    success: true,
  };

  const failureLoginResult: LoginResult = {
    success: false,
    error: {
      message: AUTH_MESSAGES.INVALID_CREDENTIALS,
      type: ServiceErrorType.Unauthorized,
    },
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    authServiceSpy.login.and.returnValue(of(successLoginResult));

    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form and default form state', () => {
    expect(component.form.value).toEqual({ email: '', password: '' });
    expect(component.formState()).toEqual({ submitted: false, loading: false });
  });

  describe('form validation', () => {
    it('should mark email as required when empty', () => {
      const emailControl = component.form.controls['email'];
      emailControl.setValue('');
      emailControl.markAsTouched();

      expect(emailControl.hasError('required')).toBeTrue();
    });

    it('should validate email format', () => {
      const emailControl = component.form.controls['email'];
      emailControl.setValue('invalid-email');
      emailControl.markAsTouched();

      expect(emailControl.hasError('email')).toBeTrue();
    });

    it('should accept valid email', () => {
      const emailControl = component.form.controls['email'];
      emailControl.setValue('user@example.com');

      expect(emailControl.valid).toBeTrue();
    });

    it('should enforce email max length of 50 characters', () => {
      const emailControl = component.form.controls['email'];
      emailControl.setValue('a'.repeat(40) + '@example.com'); // 53 chars

      expect(emailControl.hasError('maxlength')).toBeTrue();
    });

    it('should mark password as required when empty', () => {
      const passwordControl = component.form.controls['password'];
      passwordControl.setValue('');
      passwordControl.markAsTouched();

      expect(passwordControl.hasError('required')).toBeTrue();
    });

    it('should validate password with custom validator', () => {
      const passwordControl = component.form.controls['password'];
      passwordControl.setValue('weak');
      passwordControl.markAsTouched();

      expect(passwordControl.hasError('INVALID_PASSWORD')).toBeTrue();
    });

    it('should accept valid password', () => {
      const passwordControl = component.form.controls['password'];
      passwordControl.setValue('ValidPass123!');

      expect(passwordControl.valid).toBeTrue();
    });

    it('should enforce password max length of 72 characters', () => {
      const passwordControl = component.form.controls['password'];
      passwordControl.setValue('ValidPass123!' + 'a'.repeat(60));

      expect(passwordControl.hasError('maxlength')).toBeTrue();
    });
  });

  describe('isInvalidField', () => {
    it('should return true for invalid touched email field', () => {
      component.form.controls['email'].setValue('');
      component.form.controls['email'].markAsTouched();

      expect(component.isInvalidField('email')).toBeTrue();
    });

    it('should return false for valid email field', () => {
      component.form.controls['email'].setValue('user@example.com');

      expect(component.isInvalidField('email')).toBeFalse();
    });

    it('should return true for invalid touched password field', () => {
      component.form.controls['password'].setValue('');
      component.form.controls['password'].markAsTouched();

      expect(component.isInvalidField('password')).toBeTrue();
    });
  });

  describe('getFieldErrors', () => {
    it('should return email validation errors', () => {
      component.form.controls['email'].setValue('');
      component.form.controls['email'].markAsTouched();

      const errors = component.getFieldErrors('email');

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(err => err.includes('Email'))).toBeTrue();
    });

    it('should return password validation errors', () => {
      component.form.controls['password'].setValue('');
      component.form.controls['password'].markAsTouched();

      const errors = component.getFieldErrors('password');

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(err => err.includes('Password'))).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should not submit when form is invalid', () => {
      component.form.controls['email'].setValue('');
      component.form.controls['password'].setValue('');

      component.onSubmit();

      expect(authServiceSpy.login).not.toHaveBeenCalled();
      expect(component.formState().submitted).toBeTrue();
      expect(component.formState().loading).toBeFalse();
    });

    it('should call authService.login with form values when form is valid', () => {
      component.form.controls['email'].setValue('user@example.com');
      component.form.controls['password'].setValue('ValidPass123!');

      component.onSubmit();

      expect(authServiceSpy.login).toHaveBeenCalledWith('user@example.com', 'ValidPass123!');
    });

    it('should set loading state while login is in progress', () => {
      component.form.controls['email'].setValue('user@example.com');
      component.form.controls['password'].setValue('ValidPass123!');

      authServiceSpy.login.and.callFake(() => {
        expect(component.formState().loading).toBeTrue();
        return of(successLoginResult);
      });

      component.onSubmit();
    });

    it('should show success toast, navigate to dashboard and reset form on successful login', () => {
      component.form.controls['email'].setValue('user@example.com');
      component.form.controls['password'].setValue('ValidPass123!');

      component.onSubmit();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'success',
          detail: AUTH_MESSAGES.LOGIN_SUCCESS,
        }),
      );
      expect(routerSpy.navigate).toHaveBeenCalledWith(getRouteSegments(APP_ROUTES.DASHBOARD));
      expect(component.form.value).toEqual({ email: '', password: '' });
      expect(component.formState().loading).toBeFalse();
    });

    it('should show error toast and stop loading on failed login', () => {
      authServiceSpy.login.and.returnValue(of(failureLoginResult));
      component.form.controls['email'].setValue('user@example.com');
      component.form.controls['password'].setValue('WrongPass123!');

      component.onSubmit();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'error',
          detail: AUTH_MESSAGES.INVALID_CREDENTIALS,
        }),
      );
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(component.formState().loading).toBeFalse();
    });

    it('should handle login error from observable error path', () => {
      authServiceSpy.login.and.returnValue(throwError(() => failureLoginResult));
      component.form.controls['email'].setValue('user@example.com');
      component.form.controls['password'].setValue('ValidPass123!');

      component.onSubmit();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'error',
          detail: AUTH_MESSAGES.INVALID_CREDENTIALS,
        }),
      );
      expect(component.formState().loading).toBeFalse();
    });

    it('should not navigate or reset form when login fails', () => {
      authServiceSpy.login.and.returnValue(of(failureLoginResult));
      component.form.controls['email'].setValue('user@example.com');
      component.form.controls['password'].setValue('WrongPass123!');

      component.onSubmit();

      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(component.form.value.email).toBe('user@example.com');
      expect(component.form.value.password).toBe('WrongPass123!');
    });
  });

  describe('template rendering', () => {
    it('should render the login form', () => {
      const form = fixture.debugElement.query(By.css('form'));
      expect(form).toBeTruthy();
    });

    it('should render email input field', () => {
      const emailInput = fixture.debugElement.query(By.css('input[type="email"]'));
      expect(emailInput).toBeTruthy();
    });

    it('should render password input field', () => {
      const passwordInput = fixture.debugElement.query(By.css('input[type="password"]'));
      expect(passwordInput).toBeTruthy();
    });

    it('should render submit button', () => {
      const submitButton = fixture.debugElement.query(By.css('p-button[type="submit"]'));
      expect(submitButton).toBeTruthy();
    });

    it('should display validation errors when form is submitted with invalid data', () => {
      component.form.controls['email'].setValue('');
      component.form.controls['password'].setValue('');
      component.form.controls['email'].markAsTouched();
      component.form.controls['password'].markAsTouched();
      component.onSubmit();
      fixture.detectChanges();

      const errorMessages = fixture.debugElement.queryAll(By.css('app-field-error-messages'));
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    it('should disable submit button when loading', () => {
      component.formState.set({ submitted: true, loading: true });
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('p-button[type="submit"]'));
      expect(submitButton.attributes['ng-reflect-disabled']).toBe('true');
    });

    it('should change button label to "Signing in..." when loading', () => {
      component.formState.set({ submitted: true, loading: true });
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('p-button[type="submit"]'));
      expect(submitButton.attributes['ng-reflect-label']).toBe('Signing in...');
    });

    it('should display brand section with features', () => {
      const brandSection = fixture.debugElement.query(By.css('.brand-section'));
      expect(brandSection).toBeTruthy();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('WatchExpense');
      expect(hostText).toContain('Track expenses efficiently');
      expect(hostText).toContain('Fast reimbursement process');
    });
  });
});
