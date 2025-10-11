import {
  API_ENDPOINTS,
  API_PREFIX,
  API_QUERY_PARAMS,
  HEADERS,
  HTTP_METHODS,
} from '@/shared/constants';
import { RequestStatus } from '@/shared/types';
import { HttpInterceptorFn } from '@angular/common/http';

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(API_PREFIX)) {
    const url = req.urlWithParams;
    if (
      url.startsWith(API_ENDPOINTS.EXPENSE.GET_ALL) &&
      req.method === HTTP_METHODS.GET
    ) {
      return handleGetExpenseRoute(req, next);
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
      headers: req.headers.append(HEADERS.X_MOCK_RESPONSE_ID, responseId),
    });
  }
  return next(req);
};
