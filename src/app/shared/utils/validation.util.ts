import { AbstractControl } from '@angular/forms';
import { VALIDATION_ERROR_MESSAGES } from '../constants';
import { ValidationError } from '../enums';

export function isValidationError(error: string): error is ValidationError {
  return Object.values<string>(ValidationError).includes(error);
}

export function getFieldValidationErrors(
  control: AbstractControl | null,
  fieldLabel?: string
): string[] {
  if (!control || !control.errors || !control.touched) {
    return [];
  }

  const errors = control.errors;
  const errorMessages: string[] = [];

  if (errors[ValidationError.Required]) {
    errorMessages.push(fieldLabel ? `${fieldLabel} is required.` : 'This field is required.');
  }

  if (errors[ValidationError.Email]) {
    errorMessages.push('Please enter a valid email address.');
  }

  if (errors[ValidationError.MinLength]) {
    const minLength = errors[ValidationError.MinLength].requiredLength;
    const actualLength = errors[ValidationError.MinLength].actualLength;
    errorMessages.push(
      fieldLabel
        ? `${fieldLabel} must be at least ${minLength} characters long. Currently ${actualLength} characters.`
        : `Must be at least ${minLength} characters long.`
    );
  }

  if (errors[ValidationError.MaxLength]) {
    const maxLength = errors[ValidationError.MaxLength].requiredLength;
    const actualLength = errors[ValidationError.MaxLength].actualLength;
    errorMessages.push(
      fieldLabel
        ? `${fieldLabel} cannot exceed ${maxLength} characters. Currently ${actualLength} characters.`
        : `Cannot exceed ${maxLength} characters.`
    );
  }

  if (errors[ValidationError.Min]) {
    const minValue = errors[ValidationError.Min].min;
    const actualValue = errors[ValidationError.Min].actual;
    errorMessages.push(
      fieldLabel
        ? `${fieldLabel} must be at least ${minValue}. Current value is ${actualValue}.`
        : `Must be at least ${minValue}.`
    );
  }

  if (errors[ValidationError.Max]) {
    const maxValue = errors[ValidationError.Max].max;
    const actualValue = errors[ValidationError.Max].actual;
    errorMessages.push(
      fieldLabel
        ? `${fieldLabel} cannot exceed ${maxValue}. Current value is ${actualValue}.`
        : `Cannot exceed ${maxValue}.`
    );
  }

  if (errors[ValidationError.Pattern]) {
    errorMessages.push('Invalid format.');
  }

  for (const error in errors) {
    if (isValidationError(error) && !errorMessages.length) {
      errorMessages.push(...(VALIDATION_ERROR_MESSAGES[error] ?? []));
    }
  }

  return errorMessages;
}

export function isFieldInvalid(control: AbstractControl | null): boolean {
  return !!(control && control.invalid && (control.dirty || control.touched));
}

export function markFormGroupTouched(formGroup: any): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    control?.markAsTouched();

    if (control && control.controls) {
      markFormGroupTouched(control);
    }
  });
}

export function getSpecificValidationError(
  errorType: ValidationError,
  errorData?: any,
  fieldLabel?: string
): string {
  switch (errorType) {
    case ValidationError.Required:
      return fieldLabel ? `${fieldLabel} is required.` : 'This field is required.';

    case ValidationError.Email:
      return 'Please enter a valid email address.';

    case ValidationError.MinLength:
      const minLength = errorData?.requiredLength || 0;
      return fieldLabel
        ? `${fieldLabel} must be at least ${minLength} characters long.`
        : `Must be at least ${minLength} characters long.`;

    case ValidationError.MaxLength:
      const maxLength = errorData?.requiredLength || 0;
      return fieldLabel
        ? `${fieldLabel} cannot exceed ${maxLength} characters.`
        : `Cannot exceed ${maxLength} characters.`;

    case ValidationError.Pattern:
      return 'Invalid format.';

    default:
      return VALIDATION_ERROR_MESSAGES[errorType]?.[0] || 'Invalid input.';
  }
}
