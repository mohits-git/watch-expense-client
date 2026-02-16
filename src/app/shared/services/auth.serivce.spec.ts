import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';

import { AUTH_MESSAGES, API_ENDPOINTS, COMMON_MESSAGES, HTTP_STATUS_CODES } from '@/shared/constants';
import { ServiceErrorType, UserRole } from '@/shared/enums';
import { AuthService } from './auth.serivce';
import { TokenService } from './token.service';
import { JWTClaims, LoginResult, ServiceError, User } from '@/shared/types';
import { provideHttpClient } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenSignal: WritableSignal<string | null>;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;

  beforeEach(() => {
    tokenSignal = signal<string | null>(null);
    tokenServiceSpy = jasmine.createSpyObj(
      'TokenService',
      ['saveToken', 'removeToken', 'parseToken'],
      { token: tokenSignal },
    );

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TokenService, useValue: tokenServiceSpy }],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('returns null user when no token is present', () => {
    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('computes user details when token is valid', () => {
    const claims: JWTClaims = {
      sub: '123',
      name: 'Alice',
      email: 'alice@example.com',
      role: UserRole.Admin,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    tokenServiceSpy.parseToken.and.returnValue(claims);
    tokenSignal.set('valid-token');

    expect(service.user()).toEqual({
      id: claims.sub,
      name: claims.name,
      role: claims.role,
      email: claims.email,
    });
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('saves token and returns success on login', (done) => {
    const email = 'user@example.com';
    const password = 'secret';
    const token = 'jwt-token';

    service.login(email, password).subscribe((result) => {
      expect(result.success).toBeTrue();
      expect(tokenServiceSpy.saveToken).toHaveBeenCalledOnceWith(token);
      done();
    });

    const req = httpMock.expectOne(API_ENDPOINTS.AUTH.LOGIN);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email, password });

    req.flush({ data: { token } });
  });

  it('returns validation error when login payload lacks token', (done) => {
    service.login('a@b.com', 'pw').subscribe((result) => {
      expect(result.success).toBeFalse();
      expect((result.error as ServiceError).message).toBe(AUTH_MESSAGES.LOGIN_FAILED);
      expect(tokenServiceSpy.saveToken).not.toHaveBeenCalled();
      done();
    });

    const req = httpMock.expectOne(API_ENDPOINTS.AUTH.LOGIN);
    req.flush({ data: {} });
  });

  it('maps 401 login errors to unauthorized result', (done) => {
    service.login('a@b.com', 'pw').subscribe({
      next: () => done.fail('Expected error'),
      error: (error: LoginResult) => {
        expect(error.success).toBeFalse();
        expect(error.error?.type).toBe(ServiceErrorType.Unauthorized);
        expect(error.error?.message).toBe(AUTH_MESSAGES.INVALID_CREDENTIALS);
        expect(error.error?.statusCode).toBe(HTTP_STATUS_CODES.UNAUTHORIZED);
        done();
      },
    });

    const req = httpMock.expectOne(API_ENDPOINTS.AUTH.LOGIN);
    req.flush(
      { message: 'invalid' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED, statusText: 'Unauthorized' },
    );
  });

  it('returns user data on authMe success', (done) => {
    const user: User = {
      id: '42',
      name: 'Bob',
      email: 'bob@example.com',
      role: UserRole.Employee,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    service.authMe().subscribe((result) => {
      expect(result).toEqual(user);
      done();
    });

    const req = httpMock.expectOne(API_ENDPOINTS.AUTH.ME);
    expect(req.request.method).toBe('GET');
    req.flush({ data: user });
  });

  it('logs out and emits session expired error on authMe 401', (done) => {
    service.authMe().subscribe({
      next: () => done.fail('Expected error'),
      error: (error: ServiceError) => {
        expect(error.type).toBe(ServiceErrorType.Unauthorized);
        expect(error.message).toBe(AUTH_MESSAGES.SESSION_EXPIRED);
        expect(tokenServiceSpy.removeToken).toHaveBeenCalled();
        done();
      },
    });

    const req = httpMock.expectOne(API_ENDPOINTS.AUTH.ME);
    req.flush(
      { message: 'expired' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED, statusText: 'Unauthorized' },
    );
  });

  it('propagates network errors on authMe', (done) => {
    service.authMe().subscribe({
      next: () => done.fail('Expected error'),
      error: (error: ServiceError) => {
        expect(error.type).toBe(ServiceErrorType.Network);
        expect(error.message).toBe(COMMON_MESSAGES.UNKNOWN_ERROR);
        done();
      },
    });

    const req = httpMock.expectOne(API_ENDPOINTS.AUTH.ME);
    req.error(new ProgressEvent('NetworkError'), {
      status: HTTP_STATUS_CODES.NETWORK_ERROR,
      statusText: 'Network Error',
    });
  });
});
