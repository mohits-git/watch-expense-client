import { HTTP_HEADERS, AUTH_STRATEGY, API_PREFIX } from '@/shared/constants';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '@/shared/services/auth.serivce';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  const mockAuthService = {
    getToken: jasmine.createSpy('getToken'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    mockAuthService.getToken.calls.reset();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should not call AuthService or add Authorization header for non-API URLs', () => {
    const url = '/non-api/test';

    httpClient.get(url).subscribe();

    const req = httpTestingController.expectOne(url);

    expect(mockAuthService.getToken).not.toHaveBeenCalled();
    expect(req.request.headers.has(HTTP_HEADERS.AUTHORIZATION)).toBeFalse();

    req.flush({});
  });

  it('should add Authorization header when token is available for API URLs', () => {
    const token = 'fake-token';
    const url = `${API_PREFIX}/test`;
    mockAuthService.getToken.and.returnValue(token);

    httpClient.get(url).subscribe();

    const req = httpTestingController.expectOne(url);

    expect(mockAuthService.getToken).toHaveBeenCalledTimes(1);
    expect(req.request.headers.get(HTTP_HEADERS.AUTHORIZATION)).toBe(
      `${AUTH_STRATEGY} ${token}`,
    );

    req.flush({});
  });

  it('should not add Authorization header when token is falsy for API URLs', () => {
    const url = `${API_PREFIX}/test`;
    mockAuthService.getToken.and.returnValue(null);

    httpClient.get(url).subscribe();

    const req = httpTestingController.expectOne(url);

    expect(mockAuthService.getToken).toHaveBeenCalledTimes(1);
    expect(req.request.headers.has(HTTP_HEADERS.AUTHORIZATION)).toBeFalse();

    req.flush({});
  });
});

