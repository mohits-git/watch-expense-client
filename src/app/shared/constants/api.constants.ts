export const BASE_URL = {
  // API: 'https://82dd37f6-b9eb-4ab1-a310-d21c4435b365.mock.pstmn.io/api/v1',
  API: 'https://130e7b99-5bc9-49c6-89e5-5e4585d6035a.mock.pstmn.io/api/v1',
  IMAGE_UPLOAD: 'http://localhost:8080/api/images',
} as const;

export const API_PREFIX = '/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_PREFIX}/auth/login`,
    LOGOUT: `${API_PREFIX}/auth/logout`,
    ME: `${API_PREFIX}/auth/me`,
  },
  EXPENSE: {
    CREATE: `${API_PREFIX}/expenses`,
    UPDATE: `${API_PREFIX}/expenses/:id`,
    PATCH: `${API_PREFIX}/expenses/:id`,
    DELETE: `${API_PREFIX}/expenses/:id`,
    GET_ALL: `${API_PREFIX}/expenses`,
    GET_BY_ID: `${API_PREFIX}/expenses/:id`,
    SUMMARY: `${API_PREFIX}/expenses/summary`,
    USER_EXPENSES: `${API_PREFIX}/user/:id/expenses`,
  },
  ADVANCE: {
    CREATE: `${API_PREFIX}/advance-request`,
    UPDATE: `${API_PREFIX}/advance-request/:id`,
    PATCH: `${API_PREFIX}/advance-request/:id`,
    DELETE: `${API_PREFIX}/advance-request/:id`,
    GET_ALL: `${API_PREFIX}/advance-request`,
    GET_BY_ID: `${API_PREFIX}/advance-request/:id`,
    SUMMARY: `${API_PREFIX}/advance-request/summary`,
    USER_ADVANCES: `${API_PREFIX}/user/:id/advance-requests`,
  },
  USERS: {
    GET_ALL: `${API_PREFIX}/users`,
    GET_BY_ID: `${API_PREFIX}/users/:id`,
    CREATE: `${API_PREFIX}/users`,
    UPDATE: `${API_PREFIX}/users/:id`,
    DELETE: `${API_PREFIX}/users/:id`,
    GET_BY_ROLE: `${API_PREFIX}/users/role`,
    GET_BY_DEPARTMENT: `${API_PREFIX}/users/department`,
    GET_BY_PROJECT: `${API_PREFIX}/users/project`,
    CHECK_EMPLOYEE_ID: `${API_PREFIX}/users/check-employee-id`,
    BUDGET: `${API_PREFIX}/users/budget`,
  },
  ADMIN: {
    PROJECT: {
      GET_ALL: `${API_PREFIX}/admin/projects`,
      GET_BY_ID: `${API_PREFIX}/admin/projects/:id`,
      CREATE: `${API_PREFIX}/admin/projects`,
      UPDATE: `${API_PREFIX}/admin/projects/:id`,
      DELETE: `${API_PREFIX}/admin/projects/:id`,
    },
    DEPARTMENT: {
      GET_ALL: `${API_PREFIX}/admin/departments`,
      GET_BY_ID: `${API_PREFIX}/admin/departments/:id`,
      CREATE: `${API_PREFIX}/admin/departments`,
      UPDATE: `${API_PREFIX}/admin/departments/:id`,
      DELETE: `${API_PREFIX}/admin/departments/:id`,
    },
  },
  IMAGE: {
    UPLOAD: '/images',
    DELETE: '/images',
  },
} as const;

export const API_QUERY_PARAMS = {
  EXPENSE: {
    STATUS: 'status',
    PAGE: 'page',
    LIMIT: 'limit',
  },
  ADVANCE: {
    STATUS: 'status',
    PAGE: 'page',
    LIMIT: 'limit',
  },
};
