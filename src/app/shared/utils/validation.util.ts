import { ValidationErrors } from '@angular/forms';
import { VALIDATION_ERROR_MESSAGES } from '../constants';
import { ValidationError } from '../enums';

export function isValidationError(error: string): error is ValidationError {
  return Object.values<string>(ValidationError).includes(error);
}

export function getValidationErrors(errors: ValidationErrors): string[] {
  const errorMessages: string[] = [];
  for (const error in errors) {
    if (isValidationError(error)) {
      errorMessages.push(...(VALIDATION_ERROR_MESSAGES[error] ?? []));
    }
  }
  return errorMessages;
}
