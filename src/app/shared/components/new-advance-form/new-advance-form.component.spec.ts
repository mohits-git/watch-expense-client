import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAdvanceFormComponent } from './new-advance-form.component';

describe('NewAdvanceFormComponent', () => {
  let component: NewAdvanceFormComponent;
  let fixture: ComponentFixture<NewAdvanceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAdvanceFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAdvanceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
