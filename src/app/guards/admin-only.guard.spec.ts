import { TestBed } from '@angular/core/testing';
import { Route, UrlSegment } from '@angular/router';
import { AuthService } from '@/shared/services/auth.serivce';
import { UserRole } from '@/shared/enums/user-role.enum';
import { adminOnly } from './admin-only.guard';

describe('adminOnly (guard)', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;

  const route = {} as Route;
  const segments = [] as UrlSegment[];

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', ['user']);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    });
  });

  it('returns true when user is an admin', () => {
    authServiceMock.user.and.returnValue({ role: UserRole.Admin } as any);

    const result = TestBed.runInInjectionContext(() => adminOnly(route, segments));

    expect(result).toBe(true);
  });

  it('returns false when user is not an admin', () => {
    authServiceMock.user.and.returnValue({ role: UserRole.Employee } as any);

    const result = TestBed.runInInjectionContext(() => adminOnly(route, segments));

    expect(result).toBe(false);
  });

  it('returns false when user is not available', () => {
    authServiceMock.user.and.returnValue(null);

    const result = TestBed.runInInjectionContext(() => adminOnly(route, segments));

    expect(result).toBe(false);
  });
});
