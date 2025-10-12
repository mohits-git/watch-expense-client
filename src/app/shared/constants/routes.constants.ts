export const APP_ROUTES = {
  AUTH: {
    BASE: 'auth',
    LOGIN: 'auth/login',
    ACCOUNT: 'auth/account',
  },
  DASHBOARD: 'dashboard',
  EXPENSES: 'expenses',
  ADVANCES: 'advances',
  USERS: 'users',
  DEPARTMENTS: 'departments',
}

export const NAVIGATION_OPTIONS = {
  QUERY_PARAMS_HANDLING: {
    MERGE: 'merge',
    REPLACE: 'replace',
    PRESERVE: 'preserve',
  } as const,
} as const;
