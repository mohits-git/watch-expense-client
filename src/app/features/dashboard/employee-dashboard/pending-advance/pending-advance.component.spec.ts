import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingAdvanceComponent } from './pending-advance.component';

describe('PendingAdvanceComponent', () => {
  let component: PendingAdvanceComponent;
  let fixture: ComponentFixture<PendingAdvanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingAdvanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingAdvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
