import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  API_ENDPOINTS,
  API_QUERY_PARAMS,
  HTTP_HEADERS,
  HTTP_METHODS,
} from '@/shared/constants';
import { RequestStatus } from '@/shared/types';
import { buildAPIEndpoint } from '@/shared/utils/api.util';
import { mockApiInterceptor } from './mock-api-server.interceptor';

describe('mockApiInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should append X-Mock-Response-ID header for expenses GET_ALL with status=PENDING', () => {
    httpClient
      .get(API_ENDPOINTS.EXPENSE.GET_ALL, {
        params: {
          [API_QUERY_PARAMS.EXPENSE.STATUS]: RequestStatus.Pending,
        },
      })
      .subscribe();

    const req = httpTestingController.expectOne(
      (r) =>
        r.url === API_ENDPOINTS.EXPENSE.GET_ALL &&
        r.method === HTTP_METHODS.GET &&
        r.params.get(API_QUERY_PARAMS.EXPENSE.STATUS) === RequestStatus.Pending,
    );

    expect(req.request.headers.get(HTTP_HEADERS.X_MOCK_RESPONSE_ID)).toBe(
      '30505855-e2b05e18-5a36-4f0d-b5ac-183da6dee84f',
    );

    req.flush({});
  });

  it('should append X-Mock-Response-ID header for advances GET_ALL with status=APPROVED', () => {
    httpClient
      .get(API_ENDPOINTS.ADVANCE.GET_ALL, {
        params: {
          [API_QUERY_PARAMS.ADVANCE.STATUS]: RequestStatus.Approved,
        },
      })
      .subscribe();

    const req = httpTestingController.expectOne(
      (r) =>
        r.url === API_ENDPOINTS.ADVANCE.GET_ALL &&
        r.method === HTTP_METHODS.GET &&
        r.params.get(API_QUERY_PARAMS.ADVANCE.STATUS) ===
          RequestStatus.Approved,
    );

    expect(req.request.headers.get(HTTP_HEADERS.X_MOCK_RESPONSE_ID)).toBe(
      '30505855-1797fac0-7ed5-4892-bbc3-ec6954ce224d',
    );

    req.flush({});
  });

  it('should not append X-Mock-Response-ID when status query param is missing', () => {
    httpClient.get(API_ENDPOINTS.EXPENSE.GET_ALL).subscribe();

    const req = httpTestingController.expectOne(
      (r) =>
        r.url === API_ENDPOINTS.EXPENSE.GET_ALL && r.method === HTTP_METHODS.GET,
    );

    expect(req.request.headers.has(HTTP_HEADERS.X_MOCK_RESPONSE_ID)).toBeFalse();

    req.flush({});
  });

  it('should rewrite USERS GET_ALL PUT to USERS GET_BY_ID with id=1', () => {
    httpClient.put(API_ENDPOINTS.USERS.GET_ALL, { name: 'x' }).subscribe();

    const expectedUrl = buildAPIEndpoint(API_ENDPOINTS.USERS.GET_BY_ID, {
      id: 1,
    });

    const req = httpTestingController.expectOne(
      (r) => r.url === expectedUrl && r.method === HTTP_METHODS.PUT,
    );

    expect(req.request.url).toBe(expectedUrl);
    req.flush({});
  });
});

