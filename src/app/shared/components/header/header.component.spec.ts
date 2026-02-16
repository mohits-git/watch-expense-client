import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { HeaderComponent } from './header.component';
import { AuthService } from '@/shared/services/auth.serivce';
import { UserRole } from '@/shared/enums';
import { APP_ROUTES } from '@/shared/constants';
import { getRouteSegments } from '@/shared/utils/routes.util';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;
  let isAuthenticatedSignal: ReturnType<typeof signal<boolean>>;
  let userSignal: ReturnType<typeof signal<Partial<{ id: string; name: string; role: UserRole; email: string }> | null>>;

  beforeEach(async () => {
    isAuthenticatedSignal = signal(false);
    userSignal = signal(null);

    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      isAuthenticated: isAuthenticatedSignal,
      user: userSignal,
    });

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('when not authenticated', () => {
    beforeEach(() => {
      isAuthenticatedSignal.set(false);
      userSignal.set(null);
      fixture.detectChanges();
    });

    it('should render dark mode toggle only', () => {
      const menubar = fixture.debugElement.query(By.css('p-menubar'));
      const toggleContainer = fixture.debugElement.query(By.css('.toggle-button'));

      expect(menubar).toBeNull();
      expect(toggleContainer).toBeTruthy();
    });

    it('should have empty menu items', () => {
      const items = component.items();
      expect(items.every(item => !item.visible)).toBe(true);
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      isAuthenticatedSignal.set(true);
      userSignal.set({ id: '1', name: 'Test User', role: UserRole.Employee, email: 'test@example.com' });
      fixture.detectChanges();
    });

    it('should render menubar with menu items', () => {
      const menubar = fixture.debugElement.query(By.css('p-menubar'));
      expect(menubar).toBeTruthy();
    });

    it('should show common menu items for authenticated users', () => {
      const items = component.items();
      const visibleItems = items.filter(item => item.visible);

      expect(visibleItems.length).toBe(3);
      expect(visibleItems.some(item => item.label === 'Dashboard')).toBe(true);
      expect(visibleItems.some(item => item.label === 'Expenses')).toBe(true);
      expect(visibleItems.some(item => item.label === 'Advance')).toBe(true);
    });

    it('should not show admin menu items for non-admin users', () => {
      const items = component.items();
      const adminItems = items.filter(item => 
        ['Users', 'Departments', 'Projects'].includes(item.label || '')
      );

      expect(adminItems.every(item => !item.visible)).toBe(true);
    });

    it('should show admin menu items for admin users', () => {
      userSignal.set({ id: '1', name: 'Admin User', role: UserRole.Admin, email: 'admin@example.com' });
      fixture.detectChanges();

      const items = component.items();
      const adminItems = items.filter(item => 
        ['Users', 'Departments', 'Projects'].includes(item.label || '')
      );

      expect(adminItems.every(item => item.visible)).toBe(true);
      expect(adminItems.length).toBe(3);
    });

    it('should have correct router links for menu items', () => {
      const items = component.items();
      
      const dashboardItem = items.find(item => item.label === 'Dashboard');
      expect(dashboardItem?.routerLink).toEqual(getRouteSegments(APP_ROUTES.DASHBOARD));

      const expensesItem = items.find(item => item.label === 'Expenses');
      expect(expensesItem?.routerLink).toEqual(getRouteSegments(APP_ROUTES.EXPENSES));
    });

    it('should call logout and navigate to login on logout', () => {
      const logoutButton = fixture.debugElement.query(By.css('.logout-button'));
      logoutButton.nativeElement.click();

      expect(authServiceSpy.logout).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith(getRouteSegments(APP_ROUTES.AUTH.LOGIN));
    });
  });
});
