export const APP_ROUTES = {
  AUTH: {
    LOGIN: 'auth/login',
    ACCOUNT: 'auth/account',
  },
  DASHBOARD: 'dashboard',
  EXPENSES: 'expenses',
}

export const NAVIGATION_OPTIONS = {
  QUERY_PARAMS_HANDLING: {
    MERGE: 'merge',
    REPLACE: 'replace',
    PRESERVE: 'preserve',
  } as const,
} as const;
