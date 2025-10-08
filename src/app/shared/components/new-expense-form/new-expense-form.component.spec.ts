import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewExpenseFormComponent } from './new-expense-form.component';

describe('NewExpenseFormComponent', () => {
  let component: NewExpenseFormComponent;
  let fixture: ComponentFixture<NewExpenseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewExpenseFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewExpenseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
