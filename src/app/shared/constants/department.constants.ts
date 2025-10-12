export const DEPARTMENT_CONSTANTS = {
  PAGE_TITLE: 'Department Management',
  FORM_LABELS: {
    NAME: 'Department Name',
    BUDGET: 'Budget',
    MANAGER: 'Department Manager',
  },
  TABLE_HEADERS: {
    NAME: 'Department Name',
    BUDGET: 'Budget',
    MANAGER: 'Manager',
    ACTIONS: 'Actions',
  },
  ACTIONS: {
    ADD_DEPARTMENT: 'Add Department',
    EDIT_DEPARTMENT: 'Edit Department',
    DELETE: 'Delete',
    EDIT: 'Edit',
    CANCEL: 'Cancel',
    CREATE: 'Create Department',
    UPDATE: 'Update Department',
  },
  PLACEHOLDERS: {
    SEARCH: 'Search departments...',
    NAME: 'Enter department name',
    BUDGET: 'Enter budget amount',
    MANAGER: 'Select department manager',
  },
} as const;
