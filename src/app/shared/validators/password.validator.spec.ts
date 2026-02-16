import { FormControl } from '@angular/forms';

import { ValidationError } from '../enums/validation-error.enum';

import { validatePassword } from './password.validator';

describe('validatePassword', () => {
  it('returns null for empty or null value', () => {
    expect(validatePassword(new FormControl(''))).toBeNull();
    expect(validatePassword(new FormControl(null))).toBeNull();
  });

  it('returns null for valid passwords', () => {
    expect(validatePassword(new FormControl('Abcdef1!'))).toBeNull();
    expect(validatePassword(new FormControl('Password1@'))).toBeNull();
    expect(validatePassword(new FormControl('MyP@ss123'))).toBeNull();
    expect(validatePassword(new FormControl('Abcd123!'))).toBeNull(); // exactly 8 chars
    expect(validatePassword(new FormControl('aA1!bcde'))).toBeNull();
    expect(validatePassword(new FormControl('XyZ9$qwert'))).toBeNull();
  });

  it('returns InvalidPassword when password is too short', () => {
    const result = validatePassword(new FormControl('Abc1!'));
    expect(result).toEqual({ [ValidationError.InvalidPassword]: true });
  });

  it('returns InvalidPassword when password has no lowercase letter', () => {
    const result = validatePassword(new FormControl('ABCDEF1!'));
    expect(result).toEqual({ [ValidationError.InvalidPassword]: true });
  });

  it('returns InvalidPassword when password has no uppercase letter', () => {
    const result = validatePassword(new FormControl('abcdef1!'));
    expect(result).toEqual({ [ValidationError.InvalidPassword]: true });
  });

  it('returns InvalidPassword when password has no digit', () => {
    const result = validatePassword(new FormControl('Abcdefgh!'));
    expect(result).toEqual({ [ValidationError.InvalidPassword]: true });
  });

  it('returns InvalidPassword when password has no special character', () => {
    const result = validatePassword(new FormControl('Abcdef12'));
    expect(result).toEqual({ [ValidationError.InvalidPassword]: true });
  });

  it('returns InvalidPassword when password uses disallowed special character', () => {
    // only @$!%*?&. are allowed
    const result = validatePassword(new FormControl('Abcdef1#'));
    expect(result).toEqual({ [ValidationError.InvalidPassword]: true });
  });
});
