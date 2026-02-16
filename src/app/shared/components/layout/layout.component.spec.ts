import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { LayoutComponent } from './layout.component';
import { AuthService } from '@/shared/services/auth.serivce';
import { UserRole } from '@/shared/enums';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
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
      imports: [LayoutComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render header component', () => {
    const header = fixture.debugElement.query(By.css('app-header'));
    expect(header).toBeTruthy();
  });

  it('should render page container structure', () => {
    const pageContainer = fixture.debugElement.query(By.css('.page-container'));
    const mainContainer = fixture.debugElement.query(By.css('.main-container'));

    expect(pageContainer).toBeTruthy();
    expect(mainContainer).toBeTruthy();
  });

  it('should have main container for content projection', () => {
    const mainContainer = fixture.debugElement.query(By.css('.main-container'));
    expect(mainContainer).toBeTruthy();
    // Verify ng-content is present by checking the template structure
    expect(mainContainer.nativeElement.tagName).toBe('MAIN');
  });
});
