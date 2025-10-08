import { RequestStatus } from '@/shared/types/expense.type';
import { HttpInterceptorFn } from '@angular/common/http';

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/api/')) {
    const url = req.urlWithParams;
    if (url.startsWith('/api/expenses') && req.method === 'GET') {
      return handleGetExpenseRoute(req, next);
    }
  }
  return next(req);
};

const handleGetExpenseRoute: HttpInterceptorFn = (req, next) => {
  const status = req.params.get('status');
  switch (status) {
    case RequestStatus.Pending:
      req = req.clone({
        headers: req.headers.append(
          'x-mock-response-id',
          '31709050-6764df8a-006e-4a9a-b771-174374ceda80',
        ),
      });
      break;
    case RequestStatus.Approved:
      req = req.clone({
        headers: req.headers.append(
          'x-mock-response-id',
          '31709050-11fbf86b-db56-4f68-b25b-9fd4da719761',
        ),
      });
      break;
    case RequestStatus.Rejected:
      req = req.clone({
        headers: req.headers.append(
          'x-mock-response-id',
          '31709050-0750af94-5999-4854-b4c5-5771d0911776',
        ),
      });
      break;
    case RequestStatus.Reviewed:
      req = req.clone({
        headers: req.headers.append(
          'x-mock-response-id',
          '31709050-727aa39a-5879-43f2-940d-d2431c4810dc',
        ),
      });
      break;
  }

  return next(req);
};
