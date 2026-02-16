import { FormControl, FormGroup } from '@angular/forms';

import { VALIDATION_ERROR_MESSAGES } from '../constants';
import { ValidationError } from '../enums';

import {
  getFieldValidationErrors,
  getSpecificValidationError,
  isFieldInvalid,
  isValidationError,
  markFormGroupTouched,
} from './validation.util';

describe('validation.util', () => {
  describe('isValidationError', () => {
    it('returns true for ValidationError enum values', () => {
      expect(isValidationError(ValidationError.Required)).toBeTrue();
      expect(isValidationError(ValidationError.Email)).toBeTrue();
      expect(isValidationError(ValidationError.MinLength)).toBeTrue();
      expect(isValidationError(ValidationError.InvalidPassword)).toBeTrue();
    });

    it('returns false for arbitrary strings', () => {
      expect(isValidationError('unknown')).toBeFalse();
      expect(isValidationError('')).toBeFalse();
    });
  });

  describe('getFieldValidationErrors', () => {
    it('returns empty array when control is null', () => {
      expect(getFieldValidationErrors(null)).toEqual([]);
    });

    it('returns empty array when control has no errors', () => {
      const control = new FormControl('value');
      control.markAsTouched();
      expect(getFieldValidationErrors(control)).toEqual([]);
    });

    it('returns empty array when control is not touched', () => {
      const control = new FormControl('');
      control.setErrors({ [ValidationError.Required]: true });
      expect(getFieldValidationErrors(control)).toEqual([]);
    });

    it('returns required message for Required error', () => {
      const control = new FormControl('');
      control.setErrors({ [ValidationError.Required]: true });
      control.markAsTouched();
      expect(getFieldValidationErrors(control)).toContain(
        'This field is required.',
      );
    });

    it('uses fieldLabel for Required when provided', () => {
      const control = new FormControl('');
      control.setErrors({ [ValidationError.Required]: true });
      control.markAsTouched();
      expect(getFieldValidationErrors(control, 'Email')).toContain(
        'Email is required.',
      );
    });

    it('returns email message for Email error', () => {
      const control = new FormControl('invalid');
      control.setErrors({ [ValidationError.Email]: true });
      control.markAsTouched();
      expect(getFieldValidationErrors(control)).toContain(
        'Please enter a valid email address.',
      );
    });

    it('returns MinLength message with requiredLength and actualLength', () => {
      const control = new FormControl('ab');
      control.setErrors({
        [ValidationError.MinLength]: {
          requiredLength: 5,
          actualLength: 2,
        },
      });
      control.markAsTouched();
      const messages = getFieldValidationErrors(control, 'Name');
      expect(messages).toContain(
        'Name must be at least 5 characters long. Currently 2 characters.',
      );
    });

    it('returns MaxLength message with requiredLength and actualLength', () => {
      const control = new FormControl('abcdef');
      control.setErrors({
        [ValidationError.MaxLength]: {
          requiredLength: 5,
          actualLength: 6,
        },
      });
      control.markAsTouched();
      const messages = getFieldValidationErrors(control, 'Code');
      expect(messages).toContain(
        'Code cannot exceed 5 characters. Currently 6 characters.',
      );
    });

    it('returns Min message with min and actual', () => {
      const control = new FormControl(2);
      control.setErrors({
        [ValidationError.Min]: { min: 10, actual: 2 },
      });
      control.markAsTouched();
      const messages = getFieldValidationErrors(control, 'Amount');
      expect(messages).toContain(
        'Amount must be at least 10. Current value is 2.',
      );
    });

    it('returns Max message with max and actual', () => {
      const control = new FormControl(100);
      control.setErrors({
        [ValidationError.Max]: { max: 50, actual: 100 },
      });
      control.markAsTouched();
      const messages = getFieldValidationErrors(control, 'Count');
      expect(messages).toContain(
        'Count cannot exceed 50. Current value is 100.',
      );
    });

    it('returns Invalid format for Pattern error', () => {
      const control = new FormControl('x');
      control.setErrors({ [ValidationError.Pattern]: true });
      control.markAsTouched();
      expect(getFieldValidationErrors(control)).toContain('Invalid format.');
    });

    it('uses VALIDATION_ERROR_MESSAGES for unhandled ValidationError when no other messages', () => {
      const control = new FormControl('x');
      control.setErrors({ [ValidationError.InvalidPassword]: true });
      control.markAsTouched();
      const messages = getFieldValidationErrors(control);
      const expectedMessages = VALIDATION_ERROR_MESSAGES[ValidationError.InvalidPassword];
      expect(messages.length).toBeGreaterThan(0);
      expect(messages).toEqual(jasmine.arrayContaining([...expectedMessages]));
    });
  });

  describe('isFieldInvalid', () => {
    it('returns false when control is null', () => {
      expect(isFieldInvalid(null)).toBeFalse();
    });

    it('returns false when control is valid', () => {
      const control = new FormControl('valid');
      expect(isFieldInvalid(control)).toBeFalse();
    });

    it('returns false when control is invalid but pristine and untouched', () => {
      const control = new FormControl('');
      control.setErrors({ [ValidationError.Required]: true });
      expect(isFieldInvalid(control)).toBeFalse();
    });

    it('returns true when control is invalid and dirty', () => {
      const control = new FormControl('');
      control.setErrors({ [ValidationError.Required]: true });
      control.markAsDirty();
      expect(isFieldInvalid(control)).toBeTrue();
    });

    it('returns true when control is invalid and touched', () => {
      const control = new FormControl('');
      control.setErrors({ [ValidationError.Required]: true });
      control.markAsTouched();
      expect(isFieldInvalid(control)).toBeTrue();
    });
  });

  describe('markFormGroupTouched', () => {
    it('marks all controls in a FormGroup as touched', () => {
      const form = new FormGroup({
        name: new FormControl(''),
        email: new FormControl(''),
      });
      markFormGroupTouched(form);
      expect(form.get('name')?.touched).toBeTrue();
      expect(form.get('email')?.touched).toBeTrue();
    });

    it('recursively marks nested FormGroups as touched', () => {
      const form = new FormGroup({
        user: new FormGroup({
          name: new FormControl(''),
          address: new FormGroup({
            city: new FormControl(''),
          }),
        }),
      });
      markFormGroupTouched(form);
      expect(form.get('user')?.touched).toBeTrue();
      expect(form.get('user.name')?.touched).toBeTrue();
      expect(form.get('user.address')?.touched).toBeTrue();
      expect(form.get('user.address.city')?.touched).toBeTrue();
    });
  });

  describe('getSpecificValidationError', () => {
    it('returns required message for Required', () => {
      expect(getSpecificValidationError(ValidationError.Required)).toBe(
        'This field is required.',
      );
      expect(
        getSpecificValidationError(ValidationError.Required, undefined, 'Name'),
      ).toBe('Name is required.');
    });

    it('returns email message for Email', () => {
      expect(getSpecificValidationError(ValidationError.Email)).toBe(
        'Please enter a valid email address.',
      );
    });

    it('returns MinLength message with optional errorData and fieldLabel', () => {
      expect(
        getSpecificValidationError(ValidationError.MinLength, {
          requiredLength: 8,
        }),
      ).toBe('Must be at least 8 characters long.');
      expect(
        getSpecificValidationError(
          ValidationError.MinLength,
          { requiredLength: 8 },
          'Password',
        ),
      ).toBe('Password must be at least 8 characters long.');
    });

    it('returns MaxLength message with optional errorData and fieldLabel', () => {
      expect(
        getSpecificValidationError(ValidationError.MaxLength, {
          requiredLength: 100,
        }),
      ).toBe('Cannot exceed 100 characters.');
      expect(
        getSpecificValidationError(
          ValidationError.MaxLength,
          { requiredLength: 100 },
          'Description',
        ),
      ).toBe('Description cannot exceed 100 characters.');
    });

    it('returns Invalid format for Pattern', () => {
      expect(getSpecificValidationError(ValidationError.Pattern)).toBe(
        'Invalid format.',
      );
    });

    it('returns VALIDATION_ERROR_MESSAGES first item for known error without specific case', () => {
      expect(
        getSpecificValidationError(ValidationError.InvalidPassword),
      ).toBe(VALIDATION_ERROR_MESSAGES[ValidationError.InvalidPassword][0]);
    });

    it('returns default "Invalid input." for unknown error type', () => {
      expect(
        getSpecificValidationError('unknown' as ValidationError),
      ).toBe('Invalid input.');
    });
  });
});
