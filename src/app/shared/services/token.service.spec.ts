import { TestBed } from '@angular/core/testing';

import { TOKEN_STORAGE_KEY } from '@/shared/constants';
import { JWTClaims } from '@/shared/types';

import { TokenService } from './token.service';

describe('TokenService', () => {
  const validClaims: JWTClaims = {
    sub: 'user-1',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'Admin' as any, // role is not used in validation logic
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  let localStorageMock: {
    getItem: jasmine.Spy;
    setItem: jasmine.Spy;
    removeItem: jasmine.Spy;
  };

  const setupLocalStorage = (storedToken: string | null) => {
    localStorageMock.getItem.and.returnValue(storedToken);
  };

  const createToken = (payload: any) => {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.`;
  };

  beforeEach(() => {
    localStorageMock = {
      getItem: jasmine.createSpy('getItem'),
      setItem: jasmine.createSpy('setItem'),
      removeItem: jasmine.createSpy('removeItem'),
    };
    spyOnProperty(window, 'localStorage', 'get').and.returnValue(
      localStorageMock as unknown as Storage,
    );
  });

  it('clears storage when no token is stored on init', () => {
    setupLocalStorage(null);
    TestBed.configureTestingModule({ providers: [TokenService] });

    const service = TestBed.inject(TokenService);

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
    expect(service.token()).toBeNull();
  });

  it('loads valid stored token on init', () => {
    const token = createToken(validClaims);
    setupLocalStorage(token);

    TestBed.configureTestingModule({ providers: [TokenService] });
    const service = TestBed.inject(TokenService);

    expect(service.token()).toBe(token);
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });

  it('drops invalid stored token on init', () => {
    setupLocalStorage('bad-token');

    TestBed.configureTestingModule({ providers: [TokenService] });
    const service = TestBed.inject(TokenService);

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
    expect(service.token()).toBeNull();
  });

  it('saveToken persists and updates signal', () => {
    setupLocalStorage(null);
    TestBed.configureTestingModule({ providers: [TokenService] });
    const service = TestBed.inject(TokenService);

    service.saveToken('new-token');

    expect(localStorageMock.setItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, 'new-token');
    expect(service.token()).toBe('new-token');
  });

  it('removeToken clears storage and signal', () => {
    setupLocalStorage(null);
    TestBed.configureTestingModule({ providers: [TokenService] });
    const service = TestBed.inject(TokenService);

    service.removeToken();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
    expect(service.token()).toBeNull();
  });

  it('isValidToken returns false for null or empty', () => {
    setupLocalStorage(null);
    TestBed.configureTestingModule({ providers: [TokenService] });
    const service = TestBed.inject(TokenService);

    expect(service.isValidToken(null)).toBeFalse();
    expect(service.isValidToken('')).toBeFalse();
  });

  it('isValidToken returns false when jwtDecode throws', () => {
    setupLocalStorage(null);

    TestBed.configureTestingModule({ providers: [TokenService] });
    const service = TestBed.inject(TokenService);

    expect(service.isValidToken('bad')).toBeFalse();
  });

  it('isValidToken returns false when sub is missing', () => {
    setupLocalStorage(null);
    const noSubToken = createToken({ exp: validClaims.exp });

    TestBed.configureTestingModule({ providers: [TokenService] });
    const service = TestBed.inject(TokenService);

    expect(service.isValidToken(noSubToken)).toBeFalse();
  });

  it('isValidToken returns false when token is expired', () => {
    setupLocalStorage(null);
    const expiredToken = createToken({
      ...validClaims,
      exp: Math.floor(Date.now() / 1000) - 10,
    });

    TestBed.configureTestingModule({ providers: [TokenService] });
    const service = TestBed.inject(TokenService);

    expect(service.isValidToken(expiredToken)).toBeFalse();
  });

  it('isValidToken returns true for valid token', () => {
    setupLocalStorage(null);
    const validToken = createToken(validClaims);

    TestBed.configureTestingModule({ providers: [TokenService] });
    const service = TestBed.inject(TokenService);

    expect(service.isValidToken(validToken)).toBeTrue();
  });

  it('parseToken returns decoded claims when valid', () => {
    setupLocalStorage(null);
    const validToken = createToken(validClaims);

    TestBed.configureTestingModule({ providers: [TokenService] });
    const service = TestBed.inject(TokenService);

    expect(service.parseToken(validToken)).toEqual(validClaims);
  });

  it('parseToken returns null when decoded sub is missing', () => {
    setupLocalStorage(null);
    const noSubToken = createToken({ exp: validClaims.exp });

    TestBed.configureTestingModule({ providers: [TokenService] });
    const service = TestBed.inject(TokenService);

    expect(service.parseToken(noSubToken)).toBeNull();
  });

  it('parseToken returns null when jwtDecode throws', () => {
    setupLocalStorage(null);
    const invalidToken = 'not-a-jwt';

    TestBed.configureTestingModule({ providers: [TokenService] });
    const service = TestBed.inject(TokenService);

    expect(service.parseToken(invalidToken)).toBeNull();
  });
});