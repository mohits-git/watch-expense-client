import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldErrorMessagesComponent } from './field-error-messages.component';

describe('FieldErrorMessagesComponent', () => {
  let component: FieldErrorMessagesComponent;
  let fixture: ComponentFixture<FieldErrorMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldErrorMessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldErrorMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
