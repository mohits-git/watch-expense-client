import { ValidationError } from '../enums';

export const AUTH_MESSAGES = {
  LOGIN_FAILED: 'Login failed. Please try again.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  SESSION_EXPIRED: 'Session expired. Please login again.',
  LOGIN_SUCCESS: 'Logged In Successfully',
  LOGOUT_SUCCESS: 'Logged Out Successfully',
  INVALID_TOKEN: 'Invalid token. Please login again.',
};

export const COMMON_MESSAGES = {
  UNKNOWN_ERROR: 'Something went wrong. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};

export const API_MESSAGES = {
  EXPENSE: {
    FETCH_ERROR: 'Failed to fetch expenses',
    FETCH_SUMMARY_ERROR: 'Failed to fetch expense summary',
    ADD_EXPENSE_SUCCESS: 'Expense added successfully',
    ADD_EXPENSE_ERROR: 'Failed to add expense',
    ADD_EXPENSE_BAD_REQUEST:
      'Invalid expense data. Please check and try again.',
  },
  ADVANCE: {
    FETCH_ERROR: 'Failed to fetch advances',
    FETCH_SUMMARY_ERROR: 'Failed to fetch advance summary',
  },
  USER: {
    FETCH_BUDGET_ERROR: 'Failed to fetch user data',
  },
};

export const VALIDATION_ERROR_MESSAGES = {
  [ValidationError.Email]: ['Enter a valid email.'] as const,
  [ValidationError.InvalidPassword]: [
    'Invalid Password. Password must have:',
    '- At least 8 characters.',
    '- At least one special character.',
    '- At least one digit.',
    '- At least one upper and lower case.',
  ] as const,
  [ValidationError.Required]: ['This field is required.'] as const,
} as const;
