import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidationError } from '../enums/validation-error.enum';

export const validatePassword: ValidatorFn = (
  control: AbstractControl<string>,
) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\.])[A-Za-z\d@$!%*?&\.]{8,}$/;
  if (!control.value || passwordRegex.test(control.value)) {
    return null;
  }
  return {
    [ValidationError.InvalidPassword]: true,
  };
};
