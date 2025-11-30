import { UserRole } from '../enums';

export const USER_CONSTANTS = {
  PAGE_TITLE: 'User Management',
  ROLE_OPTIONS: [
    { label: 'All', value: 'ALL' },
    { label: 'Admin', value: UserRole.Admin },
    { label: 'Employee', value: UserRole.Employee },
  ],
  FORM_LABELS: {
    EMPLOYEE_ID: 'Employee ID',
    NAME: 'Name',
    EMAIL: 'Email',
    PASSWORD: 'Password',
    ROLE: 'Role',
    DEPARTMENT: 'Department',
    PROJECT: 'Project',
  },
  TABLE_HEADERS: {
    EMPLOYEE_ID: 'Employee ID',
    NAME: 'Name',
    EMAIL: 'Email',
    ROLE: 'Role',
    PROJECT: 'Project',
    DEPARTMENT: 'Department',
    ACTIONS: 'Actions',
  },
  ACTIONS: {
    ADD_USER: 'Add User',
    EDIT_USER: 'Edit User',
    DELETE: 'Delete',
    EDIT: 'Edit',
    CANCEL: 'Cancel',
    CREATE: 'Create User',
    UPDATE: 'Update User',
  },
  PLACEHOLDERS: {
    SEARCH: 'Search users...',
    SELECT_DEPARTMENT: 'Select Department',
    SELECT_PROJECT: 'Select Project',
    SELECT_ROLE: 'Select Role',
    EMPLOYEE_ID: 'Enter employee ID (e.g., EMP001)',
    NAME: 'Enter full name',
    EMAIL: 'Enter email address',
    PASSWORD: 'Enter password',
    ROLE: 'Select user role',
    DEPARTMENT: 'Select department',
    PROJECT: 'Select project (optional)',
  },
} as const;

export const USER_FILTER_OPTIONS = {
  ALL: 'ALL',
} as const;
