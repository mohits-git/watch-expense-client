import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '@/shared/services/auth.serivce';
import { authorizedOnly } from './authorized-only.guard';

describe('authorizedOnly (guard)', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', [
      'isAuthenticated',
    ]);
    routerMock = jasmine.createSpyObj<Router>('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('returns true when user is authenticated', () => {
    authServiceMock.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authorizedOnly(route, state),
    );

    expect(result).toBe(true);
    expect(routerMock.parseUrl).not.toHaveBeenCalled();
  });

  it('redirects to /auth/login when user is not authenticated', () => {
    authServiceMock.isAuthenticated.and.returnValue(false);

    const loginTree = {} as UrlTree;
    routerMock.parseUrl.and.returnValue(loginTree);

    const result = TestBed.runInInjectionContext(() =>
      authorizedOnly(route, state),
    );

    expect(routerMock.parseUrl).toHaveBeenCalledTimes(1);
    expect(routerMock.parseUrl).toHaveBeenCalledWith('/auth/login');
    expect(result instanceof RedirectCommand).toBeTrue();

    const redirect = result as RedirectCommand;
    expect((redirect as any).redirectTo).toBe(loginTree);
    expect((redirect as any).navigationBehaviorOptions).toEqual(
      jasmine.objectContaining({ skipLocationChange: true }),
    );
  });
});

