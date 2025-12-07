import { environment } from '../../../environments/environment';

export const BASE_URL = {
  API: environment.apiBaseUrl,
  IMAGE_UPLOAD: environment.apiImageUploadBaseUrl
} as const;

export const API_PREFIX = '/api';
export const IMAGE_API_PREFIX = '/api/images';

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
    GET_ALL: `${API_PREFIX}/expenses`,
    GET_BY_ID: `${API_PREFIX}/expenses/:id`,
    SUMMARY: `${API_PREFIX}/expenses/summary`,
  },
  ADVANCE: {
    CREATE: `${API_PREFIX}/advance-request`,
    UPDATE: `${API_PREFIX}/advance-request/:id`,
    PATCH: `${API_PREFIX}/advance-request/:id`,
    GET_ALL: `${API_PREFIX}/advance-request`,
    GET_BY_ID: `${API_PREFIX}/advance-request/:id`,
    SUMMARY: `${API_PREFIX}/advance-request/summary`,
  },
  USERS: {
    GET_ALL: `${API_PREFIX}/users`,
    GET_BY_ID: `${API_PREFIX}/users/:id`,
    CREATE: `${API_PREFIX}/users`,
    UPDATE: `${API_PREFIX}/users/:id`,
    DELETE: `${API_PREFIX}/users/:id`,
    BUDGET: `${API_PREFIX}/users/budget`,
  },
  ADMIN: {
    PROJECT: {
      GET_ALL: `${API_PREFIX}/admin/projects`,
      GET_BY_ID: `${API_PREFIX}/admin/projects/:id`,
      CREATE: `${API_PREFIX}/admin/projects`,
      UPDATE: `${API_PREFIX}/admin/projects/:id`,
    },
    DEPARTMENT: {
      GET_ALL: `${API_PREFIX}/admin/departments`,
      GET_BY_ID: `${API_PREFIX}/admin/departments/:id`,
      CREATE: `${API_PREFIX}/admin/departments`,
      UPDATE: `${API_PREFIX}/admin/departments/:id`,
    },
  },
  IMAGE: {
    UPLOAD: `${IMAGE_API_PREFIX}/`,
    DELETE: `${IMAGE_API_PREFIX}/`,
    DOWNLOAD_URL: `${IMAGE_API_PREFIX}/download-url`,
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
