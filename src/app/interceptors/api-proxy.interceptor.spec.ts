import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_PREFIX, BASE_URL, IMAGE_API_PREFIX } from '@/shared/constants';
import { apiProxyInterceptor } from './api-proxy.interceptor';

describe('apiProxyInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiProxyInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should replace IMAGE_API_PREFIX with BASE_URL.IMAGE_UPLOAD', () => {
    const url = `${IMAGE_API_PREFIX}/upload`;
    const expectedUrl = `${BASE_URL.IMAGE_UPLOAD}/upload`;

    httpClient.post(url, { foo: 'bar' }).subscribe();

    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.url).toBe(expectedUrl);

    req.flush({});
  });

  it('should replace API_PREFIX with BASE_URL.API', () => {
    const url = `${API_PREFIX}/expenses`;
    const expectedUrl = `${BASE_URL.API}/expenses`;

    httpClient.get(url).subscribe();

    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.url).toBe(expectedUrl);

    req.flush({});
  });

  it('should not modify absolute or non-prefixed URLs', () => {
    const url = 'https://example.com/health';

    httpClient.get(url).subscribe();

    const req = httpTestingController.expectOne(url);
    expect(req.request.url).toBe(url);

    req.flush({});
  });
});

