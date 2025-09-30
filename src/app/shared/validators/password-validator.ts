import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidationErrors } from '../types/enums/validation-errors';

export const validatePassword: ValidatorFn = (control: AbstractControl<string>) => {
  const passwordRegex = new RegExp(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@\(!\)!%*?&]{8,}$',
  );
  if (passwordRegex.exec(control.value)) {
    return {
      [ValidationErrors.InvalidPassword]: true,
    };
  }
  return null;
};
