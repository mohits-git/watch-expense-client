import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { FieldErrorMessagesComponent } from './field-error-messages.component';

describe('FieldErrorMessagesComponent', () => {
  let component: FieldErrorMessagesComponent;
  let fixture: ComponentFixture<FieldErrorMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldErrorMessagesComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(FieldErrorMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one message per error', () => {
    const errors = ['First error', 'Second error'];
    fixture.componentRef.setInput('errors', errors);
    fixture.detectChanges();

    const messages = fixture.debugElement.queryAll(By.css('p-message'));
    expect(messages.length).toBe(errors.length);
    expect(messages[0].nativeElement.textContent).toContain('First error');
    expect(messages[1].nativeElement.textContent).toContain('Second error');
  });
});
