import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { loggingInterceptor } from './logging.interceptor';

describe('loggingInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let originalProduction: boolean;

  beforeEach(() => {
    originalProduction = environment.production;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loggingInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    environment.production = originalProduction;
    httpTestingController.verify();
  });

  it('should not log anything when environment.production is true', () => {
    environment.production = true;
    spyOn(console, 'log');

    const url = '/api/test';
    httpClient.get(url).subscribe();

    const req = httpTestingController.expectOne(url);
    req.flush({}, { status: 200, statusText: 'OK' });

    expect(console.log).not.toHaveBeenCalled();
  });

  it('should log request and response when environment.production is false', () => {
    environment.production = false;
    const logSpy = spyOn(console, 'log');

    const url = '/api/test';
    httpClient.get(url).subscribe();

    const req = httpTestingController.expectOne(url);
    req.flush({}, { status: 200, statusText: 'OK' });

    expect(logSpy).toHaveBeenCalledWith(`HTTP Request: making request: ${url}`);

    const calls = logSpy.calls.allArgs().map((args) => String(args[0]));
    expect(
      calls.some((c) => c.startsWith('HTTP Response: got response from: ')),
    ).toBeTrue();
  });

  it('should log an error when a request fails (non-production)', () => {
    environment.production = false;
    const logSpy = spyOn(console, 'log');

    const url = '/api/test';
    httpClient.get(url).subscribe({ error: () => {} });

    const req = httpTestingController.expectOne(url);
    req.flush(
      { message: 'boom' },
      { status: 500, statusText: 'Internal Server Error' },
    );

    const calls = logSpy.calls.allArgs().map((args) => String(args[0]));
    expect(
      calls.some((c) => c.startsWith('HTTP Error: error making request to: ')),
    ).toBeTrue();
  });
});

