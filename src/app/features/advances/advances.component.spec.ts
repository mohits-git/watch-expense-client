import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { AdvancesComponent } from './advances.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

describe('AdvancesComponent', () => {
  let component: AdvancesComponent;
  let fixture: ComponentFixture<AdvancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
        ConfirmationService,
        MessageService,
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of() }
        }
      ]
    }).compileComponents();

    TestBed.inject(Router);
    fixture = TestBed.createComponent(AdvancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
