import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceSummaryComponent } from './advance-summary.component';

describe('AdvanceSummaryComponent', () => {
  let component: AdvanceSummaryComponent;
  let fixture: ComponentFixture<AdvanceSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvanceSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvanceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
