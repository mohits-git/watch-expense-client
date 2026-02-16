import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DarkModeToggleComponent } from './dark-mode-toggle.component';

describe('DarkModeToggleComponent', () => {
  let component: DarkModeToggleComponent;
  let fixture: ComponentFixture<DarkModeToggleComponent>;

  beforeEach(async () => {
    const store: Record<string, string> = {};
    spyOn(window.localStorage, 'getItem').and.callFake(
      (key: string): string | null => store[key] ?? null,
    );
    spyOn(window.localStorage, 'setItem').and.callFake(
      (key: string, value: string): void => {
        store[key] = value;
      },
    );
    spyOn(window.localStorage, 'removeItem').and.callFake((key: string): void => {
      delete store[key];
    });
    spyOn(window.localStorage, 'clear').and.callFake((): void => {
      Object.keys(store).forEach((k) => delete store[k]);
    });

    await TestBed.configureTestingModule({
      imports: [DarkModeToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DarkModeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle darkMode signal and update html class', () => {
    const html = document.querySelector('html')!;
    const button = fixture.debugElement.query(By.css('button'));

    expect(component.darkMode()).toBeFalse();
    expect(html.classList.contains('dark')).toBeFalse();

    button.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.darkMode()).toBeTrue();
    expect(html.classList.contains('dark')).toBeTrue();

    button.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.darkMode()).toBeFalse();
    expect(html.classList.contains('dark')).toBeFalse();
  });
});
