import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { NewExpenseFormComponent } from './new-expense-form.component';
import { MessageService } from 'primeng/api';

describe('NewExpenseFormComponent', () => {
  let component: NewExpenseFormComponent;
  let fixture: ComponentFixture<NewExpenseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        NewExpenseFormComponent,
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewExpenseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
