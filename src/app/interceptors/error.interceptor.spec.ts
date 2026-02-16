import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import {
  API_ENDPOINTS,
  APP_ROUTES,
  AUTH_MESSAGES,
  COMMON_MESSAGES,
  HTTP_STATUS_CODES,
  TOAST_SUMMARIES,
  TOAST_TYPES,
} from '@/shared/constants';
import { getRouteSegments } from '@/shared/utils/routes.util';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  let messageService: { add: jasmine.Spy };
  let router: { navigate: jasmine.Spy };

  beforeEach(() => {
    messageService = {
      add: jasmine.createSpy('add'),
    };
    router = {
      navigate: jasmine.createSpy('navigate').and.resolveTo(true),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: MessageService, useValue: messageService },
        { provide: Router, useValue: router },
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should bypass error handling for login endpoint requests', () => {
    httpClient.get(API_ENDPOINTS.AUTH.LOGIN).subscribe({ error: () => {} });

    const req = httpTestingController.expectOne(API_ENDPOINTS.AUTH.LOGIN);
    req.flush(
      { message: 'unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED, statusText: 'Unauthorized' },
    );

    expect(messageService.add).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should show a network error toast when error.status is 0', () => {
    const url = '/api/some-endpoint';
    httpClient.get(url).subscribe({ error: () => {} });

    const req = httpTestingController.expectOne(url);
    req.error(new ProgressEvent('error'));

    expect(messageService.add).toHaveBeenCalledTimes(1);
    expect(messageService.add).toHaveBeenCalledWith({
      severity: TOAST_TYPES.ERROR,
      summary: TOAST_SUMMARIES.ERROR,
      detail: COMMON_MESSAGES.NETWORK_ERROR,
    });
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should show unauthorized toast and navigate to login on 401', () => {
    const url = '/api/protected';
    httpClient.get(url).subscribe({ error: () => {} });

    const req = httpTestingController.expectOne(url);
    req.flush(
      { message: 'unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED, statusText: 'Unauthorized' },
    );

    expect(messageService.add).toHaveBeenCalledTimes(1);
    expect(messageService.add).toHaveBeenCalledWith({
      severity: TOAST_TYPES.ERROR,
      summary: TOAST_SUMMARIES.ERROR,
      detail: AUTH_MESSAGES.UNAUTHORIZED_ACTION,
    });
    expect(router.navigate).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(
      getRouteSegments(APP_ROUTES.AUTH.LOGIN),
    );
  });
});

