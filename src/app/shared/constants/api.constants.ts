export const BASE_URL = {
  API: 'https://2ad649d5-eb1f-483c-a54a-e0a84981814e.mock.pstmn.io/api/v1',
  // API_BASE_URL: 'https://82dd37f6-b9eb-4ab1-a310-d21c4435b365.mock.pstmn.io/api/v1',
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
    DELETE: `${API_PREFIX}/expenses/:id`,
    GET_ALL: `${API_PREFIX}/expenses`,
    GET_BY_ID: `${API_PREFIX}/expenses/:id`,
    SUMMARY: `${API_PREFIX}/expenses/summary`,
  },
  ADVANCE: {
    CREATE: `${API_PREFIX}/advance-request`,
    UPDATE: `${API_PREFIX}/advance-request/:id`,
    DELETE: `${API_PREFIX}/advance-request/:id`,
    GET_ALL: `${API_PREFIX}/advance-request`,
    GET_BY_ID: `${API_PREFIX}/advance-request/:id`,
    SUMMARY: `${API_PREFIX}/advance-request/summary`,
  },
  USERS: {
    GET_ALL: `${API_PREFIX}/users`,
    GET_BY_ID: `${API_PREFIX}/users/:id`,
    UPDATE: `${API_PREFIX}/users/:id`,
    DELETE: `${API_PREFIX}/users/:id`,
    BUDGET: `${API_PREFIX}/users/budget`,
  },
  IMAGE: {
    UPLOAD: BASE_URL.IMAGE_UPLOAD,
    DELETE: BASE_URL.IMAGE_UPLOAD,
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
}
