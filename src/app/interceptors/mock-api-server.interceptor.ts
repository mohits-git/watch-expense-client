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
    }
  }
  return next(req);
};

const handleGetExpenseRoute: HttpInterceptorFn = (req, next) => {
  const status = req.params.get(API_QUERY_PARAMS.EXPENSE.STATUS);
  let responseId: string = '';
  switch (status) {
    case RequestStatus.Pending:
      responseId = '31709050-6764df8a-006e-4a9a-b771-174374ceda80';
      break;
    case RequestStatus.Approved:
      responseId = '31709050-11fbf86b-db56-4f68-b25b-9fd4da719761';
      break;
    case RequestStatus.Rejected:
      responseId = '31709050-0750af94-5999-4854-b4c5-5771d0911776';
      break;
    case RequestStatus.Reviewed:
      responseId = '31709050-727aa39a-5879-43f2-940d-d2431c4810dc';
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
      responseId = '31709050-0156583d-2d2b-489f-bed9-9ce73d5f870a';
      break;
    case RequestStatus.Approved:
      responseId = '31709050-49696233-2748-48fe-85ff-b8950a9ca4d2';
      break;
    case RequestStatus.Rejected:
      responseId = '31709050-2da81f8b-36af-4575-bb19-872882157647';
      break;
    case RequestStatus.Reviewed:
      responseId = '31709050-4fa87047-d2f5-4729-8ea9-ede426145a1c';
      break;
  }
  if (responseId) {
    req = req.clone({
      headers: req.headers.append(HTTP_HEADERS.X_MOCK_RESPONSE_ID, responseId),
    });
  }
  return next(req);
};
