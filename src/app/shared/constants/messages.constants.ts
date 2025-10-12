import { ValidationError } from '../enums';

export const AUTH_MESSAGES = {
  LOGIN_FAILED: 'Login failed. Please try again.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  SESSION_EXPIRED: 'Session expired. Please login again.',
  LOGIN_SUCCESS: 'Logged In Successfully',
  LOGOUT_SUCCESS: 'Logged Out Successfully',
  INVALID_TOKEN: 'Invalid token. Please login again.',
  UNAUTHORIZED_ACTION: 'You are not authorized to perform this action.',
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
    EXPENSE_APPROVED: 'Expense approved successfully',
    EXPENSE_REJECTED: 'Expense rejected successfully',
    EXPENSE_REVIEWED: 'Expense marked as reviewed successfully',
    EXPENSE_UPDATE_FAILED: 'Failed to update expense status',
  },
  ADVANCE: {
    FETCH_ERROR: 'Failed to fetch advances',
    FETCH_SUMMARY_ERROR: 'Failed to fetch advance summary',
    ADD_ADVANCE_SUCCESS: 'Advance request submitted successfully',
    ADD_ADVANCE_ERROR: 'Failed to submit advance request',
    ADD_ADVANCE_BAD_REQUEST:
      'Invalid advance request data. Please check and try again.',
  },
  USER: {
    FETCH_BUDGET_ERROR: 'Failed to fetch user data',
  },
  IMAGE: {
    UPLOAD_SUCCESS: 'Image uploaded successfully',
    UPLOAD_ERROR: 'Failed to upload image',
    DELETE_SUCCESS: 'Image deleted successfully',
    DELETE_ERROR: 'Failed to delete image',
  },
  ADMIN: {
    USER: {
      FETCH_ERROR: 'Failed to fetch users',
      FETCH_SUMMARY_ERROR: 'Failed to fetch users summary',
      CREATE_SUCCESS: 'User created successfully',
      CREATE_ERROR: 'Failed to create user',
      UPDATE_SUCCESS: 'User updated successfully',
      UPDATE_ERROR: 'Failed to update user',
      DELETE_SUCCESS: 'User deleted successfully',
      DELETE_ERROR: 'Failed to delete user',
      DELETE_CONFIRMATION: 'Are you sure you want to delete this user?',
    },
    DEPARTMENT: {
      FETCH_ERROR: 'Failed to fetch departments',
      FETCH_SUMMARY_ERROR: 'Failed to fetch departments summary',
      CREATE_SUCCESS: 'Department created successfully',
      CREATE_ERROR: 'Failed to create department',
      UPDATE_SUCCESS: 'Department updated successfully',
      UPDATE_ERROR: 'Failed to update department',
      DELETE_SUCCESS: 'Department deleted successfully',
      DELETE_ERROR: 'Failed to delete department',
      DELETE_CONFIRMATION: 'Are you sure you want to delete this department?',
    },
    PROJECT: {
      FETCH_ERROR: 'Failed to fetch projects',
      FETCH_SUMMARY_ERROR: 'Failed to fetch projects summary',
      CREATE_SUCCESS: 'Project created successfully',
      CREATE_ERROR: 'Failed to create project',
      UPDATE_SUCCESS: 'Project updated successfully',
      UPDATE_ERROR: 'Failed to update project',
      DELETE_SUCCESS: 'Project deleted successfully',
      DELETE_ERROR: 'Failed to delete project',
      DELETE_CONFIRMATION: 'Are you sure you want to delete this project?',
    },
  },
};

export const VALIDATION_ERROR_MESSAGES = {
  [ValidationError.Email]: ['Enter a valid email address.'] as const,
  [ValidationError.InvalidPassword]: [
    'Invalid Password. Password must have:',
    '- At least 8 characters.',
    '- At least one special character.',
    '- At least one digit.',
    '- At least one upper and lower case.',
  ] as const,
  [ValidationError.Required]: ['This field is required.'] as const,
  [ValidationError.Min]: ['Value is too small.'] as const,
  [ValidationError.Max]: ['Value is too large.'] as const,
  [ValidationError.MinLength]: ['Value is too short.'] as const,
  [ValidationError.MaxLength]: ['Value is too long.'] as const,
  [ValidationError.Pattern]: ['Invalid format.'] as const,
} as const;
