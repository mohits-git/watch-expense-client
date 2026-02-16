import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ContainerComponent } from './container.component';

@Component({
  selector: 'app-host-container',
  template: `
    <div container>
      <span class="inner-content">Projected Content</span>
    </div>
  `,
  standalone: true,
  imports: [ContainerComponent],
})
class HostContainerComponent {}

describe('ContainerComponent', () => {
  let fixture: ComponentFixture<HostContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostContainerComponent);
    fixture.detectChanges();
  });

  it('should render the container host element', () => {
    const containerDebugEl = fixture.debugElement.query(By.css('div[container]'));
    expect(containerDebugEl).toBeTruthy();
  });

  it('should project inner content', () => {
    const projected = fixture.debugElement.query(By.css('.inner-content'));
    expect(projected).toBeTruthy();
    expect(projected.nativeElement.textContent.trim()).toBe('Projected Content');
  });
});
