import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply shadow class when cardType is shadow', () => {
    fixture.componentRef.setInput('card', 'shadow');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('shadow')).toBeTrue();
    expect(host.classList.contains('summary-card')).toBeFalse();
  });

  it('should apply summary-card class when cardType is summary', () => {
    fixture.componentRef.setInput('card', 'summary');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('summary-card')).toBeTrue();
  });

  it('should apply variant class from type input', () => {
    fixture.componentRef.setInput('type', 'primary');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('primary')).toBeTrue();
  });
});
