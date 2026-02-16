import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError, NEVER } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AccountComponent } from './account.component';
import { AuthService } from '@/shared/services/auth.serivce';
import { User } from '@/shared/types';
import { UserRole } from '@/shared/enums';

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockUser: User = {
    id: 'user-123',
    employeeId: 'EMP-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: UserRole.Employee,
    balance: 5000,
    projectId: 'proj-1',
    departmentId: 'dept-1',
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['authMe']);
    authServiceSpy.authMe.and.returnValue(of(mockUser));

    await TestBed.configureTestingModule({
      imports: [AccountComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should initialize with null userDetails', () => {
    expect(component.userDetails()).toBeNull();
  });

  it('should fetch user details on init', () => {
    fixture.detectChanges();

    expect(authServiceSpy.authMe).toHaveBeenCalledTimes(1);
    expect(component.userDetails()).toEqual(mockUser);
  });

  it('should handle authMe error gracefully', () => {
    authServiceSpy.authMe.and.returnValue(throwError(() => new Error('Unauthorized')));

    fixture.detectChanges();

    expect(authServiceSpy.authMe).toHaveBeenCalledTimes(1);
    expect(component.userDetails()).toBeNull();
  });

  describe('template rendering', () => {
    it('should show loading skeletons when userDetails is null', () => {
      // Mock authMe to return an observable that never emits
      authServiceSpy.authMe.and.returnValue(NEVER);
      fixture.detectChanges();

      const skeletons = fixture.debugElement.queryAll(By.css('p-skeleton'));
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display user details when loaded', () => {
      fixture.detectChanges();

      const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
      expect(hostText).toContain('John Doe');
      expect(hostText).toContain('john.doe@example.com');
      expect(hostText).toContain('user-123');
      expect(hostText).toContain(UserRole.Employee);
      expect(hostText).toContain('proj-1');
      expect(hostText).toContain('dept-1');
    });

    it('should render avatar when user is loaded', () => {
      fixture.detectChanges();

      const avatar = fixture.debugElement.query(By.css('p-avatar'));
      expect(avatar).toBeTruthy();
    });

    it('should not show skeletons when user is loaded', () => {
      fixture.detectChanges();

      const skeletons = fixture.debugElement.queryAll(By.css('p-skeleton'));
      expect(skeletons.length).toBe(0);
    });

    it('should render card container', () => {
      fixture.detectChanges();

      const card = fixture.debugElement.query(By.css('div[card]'));
      expect(card).toBeTruthy();
    });

    it('should display user information in list format', () => {
      fixture.detectChanges();

      const listItems = fixture.debugElement.queryAll(By.css('ul li'));
      expect(listItems.length).toBeGreaterThanOrEqual(4);
    });

    it('should show header section with name and email', () => {
      fixture.detectChanges();

      const header = fixture.debugElement.query(By.css('.header'));
      expect(header).toBeTruthy();

      const headerText = (header.nativeElement as HTMLElement).textContent || '';
      expect(headerText).toContain('John Doe');
      expect(headerText).toContain('john.doe@example.com');
    });

    it('should display all user properties in the list', () => {
      fixture.detectChanges();

      const listText = (fixture.nativeElement as HTMLElement).textContent || '';
      
      expect(listText).toContain('ID:');
      expect(listText).toContain('Role:');
      expect(listText).toContain('ProjectID:');
      expect(listText).toContain('DepartmentID:');
    });
  });
});
