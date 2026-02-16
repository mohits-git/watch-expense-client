import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let footerEl: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    footerEl = fixture.debugElement.query(By.css('p'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display copyright text', () => {
    expect(footerEl).toBeTruthy();
    expect(footerEl.nativeElement.textContent.trim()).toBe('Copyright © 2025 WatchExpense');
  });
});
