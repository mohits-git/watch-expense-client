import {
  API_ENDPOINTS,
  API_PREFIX,
  API_QUERY_PARAMS,
  HTTP_HEADERS,
  HTTP_METHODS,
} from '@/shared/constants';
import { RequestStatus } from '@/shared/types';
import { buildAPIEndpoint } from '@/shared/utils/api.util';
import { HttpInterceptorFn } from '@angular/common/http';

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(API_PREFIX)) {
    const url = req.urlWithParams;
    if (
      url.startsWith(API_ENDPOINTS.EXPENSE.GET_ALL) &&
      req.method === HTTP_METHODS.GET
    ) {
      return handleGetExpenseRoute(req, next);
    } else if (
      url.startsWith(API_ENDPOINTS.ADVANCE.GET_ALL) &&
      req.method === HTTP_METHODS.GET
    ) {
      return handleGetAdvanceRoute(req, next);
    } else if (
      url.startsWith(API_ENDPOINTS.USERS.GET_ALL) &&
      (req.method === HTTP_METHODS.PUT || req.method === HTTP_METHODS.DELETE)
    ) {
      req = req.clone({
        url: buildAPIEndpoint(API_ENDPOINTS.USERS.GET_BY_ID, { id: 1 }),
      })
    } else if (
      url.startsWith(API_ENDPOINTS.ADMIN.DEPARTMENT.GET_ALL) &&
      (req.method === HTTP_METHODS.PUT || req.method === HTTP_METHODS.DELETE)
    ) {
      req = req.clone({
        url: buildAPIEndpoint(API_ENDPOINTS.ADMIN.DEPARTMENT.GET_BY_ID, { id: 1 }),
      })
    }
  }
  return next(req);
};

const handleGetExpenseRoute: HttpInterceptorFn = (req, next) => {
  const status = req.params.get(API_QUERY_PARAMS.EXPENSE.STATUS);
  let responseId: string = '';
  switch (status) {
    case RequestStatus.Pending:
      responseId = '30505855-e2b05e18-5a36-4f0d-b5ac-183da6dee84f';
      break;
    case RequestStatus.Approved:
      responseId = '30505855-8d4914af-d2a0-43fb-85bf-83f2ff93ffca';
      break;
    case RequestStatus.Rejected:
      responseId = '30505855-29308cb1-2557-4d7b-85e1-64edec8a8b08';
      break;
    case RequestStatus.Reviewed:
      responseId = '30505855-5d257fcd-95c6-4d52-9540-d4eb21bc9969';
      break;
  }
  if (responseId) {
    req = req.clone({
      headers: req.headers.append(HTTP_HEADERS.X_MOCK_RESPONSE_ID, responseId),
    });
  }
  return next(req);
};

const handleGetAdvanceRoute: HttpInterceptorFn = (req, next) => {
  const status = req.params.get(API_QUERY_PARAMS.ADVANCE.STATUS);
  let responseId: string = '';
  switch (status) {
    case RequestStatus.Pending:
      responseId = '30505855-922c5675-7bbc-418e-b81c-5ccaf00f5e0e';
      break;
    case RequestStatus.Approved:
      responseId = '30505855-1797fac0-7ed5-4892-bbc3-ec6954ce224d';
      break;
    case RequestStatus.Rejected:
      responseId = '30505855-9751166d-e60f-482d-9d21-ca50c261b794';
      break;
    case RequestStatus.Reviewed:
      responseId = '30505855-525503b9-1c8c-4f90-8391-2cee4301da23';
      break;
  }
  if (responseId) {
    req = req.clone({
      headers: req.headers.append(HTTP_HEADERS.X_MOCK_RESPONSE_ID, responseId),
    });
  }
  return next(req);
};
