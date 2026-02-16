import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;
  let spinnerEl: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spinnerEl = fixture.debugElement.query(By.css('.spinner'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a spinner element in the DOM', () => {
    expect(spinnerEl).toBeTruthy();
    expect(spinnerEl.nativeElement.tagName).toBe('DIV');
  });

  describe('size input', () => {
    it('should default to "medium" and apply medium class', () => {
      expect(component.size()).toBe('medium');
      expect(spinnerEl.nativeElement.classList.contains('medium')).toBe(true);
      expect(spinnerEl.nativeElement.classList.contains('spinner')).toBe(true);
    });

    it('should apply "small" class when size is set to small', () => {
      fixture.componentRef.setInput('size', 'small');
      fixture.detectChanges();

      expect(component.size()).toBe('small');
      expect(spinnerEl.nativeElement.classList.contains('small')).toBe(true);
      expect(spinnerEl.nativeElement.classList.contains('spinner')).toBe(true);
    });

    it('should apply "large" class when size is set to large', () => {
      fixture.componentRef.setInput('size', 'large');
      fixture.detectChanges();

      expect(component.size()).toBe('large');
      expect(spinnerEl.nativeElement.classList.contains('large')).toBe(true);
      expect(spinnerEl.nativeElement.classList.contains('spinner')).toBe(true);
    });

    it('should update DOM when size changes from medium to large', () => {
      expect(spinnerEl.nativeElement.classList.contains('medium')).toBe(true);

      fixture.componentRef.setInput('size', 'large');
      fixture.detectChanges();

      expect(spinnerEl.nativeElement.classList.contains('medium')).toBe(false);
      expect(spinnerEl.nativeElement.classList.contains('large')).toBe(true);
    });
  });
});
