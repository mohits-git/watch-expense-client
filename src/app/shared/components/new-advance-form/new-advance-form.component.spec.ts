import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { NewAdvanceFormComponent } from './new-advance-form.component';
import { AdvancesService } from '@/shared/services/advances.service';
import { Advance, AdvanceCreateResult, RequestStatus } from '@/shared/types';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('NewAdvanceFormComponent', () => {
  let component: NewAdvanceFormComponent;
  let fixture: ComponentFixture<NewAdvanceFormComponent>;
  let advancesServiceSpy: jasmine.SpyObj<AdvancesService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const createdAdvance: Advance = {
    id: 'adv-1',
    userId: 'user-1',
    amount: 3000,
    purpose: 'Project purchase',
    status: RequestStatus.Pending,
    description: 'Need pre-approved budget support',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    approvedBy: null,
    approvedAt: null,
    reviewedBy: null,
    reviewedAt: null,
    reconciledExpenseId: null,
  };

  beforeEach(async () => {
    advancesServiceSpy = jasmine.createSpyObj<AdvancesService>('AdvancesService', [
      'addNewAdvance',
    ]);
    advancesServiceSpy.addNewAdvance.and.returnValue(
      of({ success: true, data: createdAdvance } as AdvanceCreateResult),
    );

    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NewAdvanceFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AdvancesService, useValue: advancesServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewAdvanceFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
  });

  function setValidFormData() {
    component.formGroup.patchValue({
      amount: 3000,
      purpose: 'Project purchase',
      description: 'Need pre-approved budget support',
    });
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with visible input set to true', () => {
    expect(component.visible()).toBeTrue();
  });

  it('should not submit when form is invalid', () => {
    component.formGroup.patchValue({ amount: 0, purpose: '' });

    component.onSubmit();

    expect(advancesServiceSpy.addNewAdvance).not.toHaveBeenCalled();
    expect(component.formState().submitted).toBeTrue();
    expect(component.formState().loading).toBeFalse();
  });

  it('should reset form and hide dialog on cancel', () => {
    setValidFormData();
    component.formState.set({ submitted: true, loading: true });

    component.onCancel();

    expect(component.visible()).toBeFalse();
    expect(component.formState()).toEqual({ submitted: false, loading: false });
    expect(component.formGroup.controls['purpose'].value).toBe('');
    expect(component.formGroup.controls['amount'].value).toBe(0);
  });

  it('should submit valid form, navigate and emit on success', () => {
    setValidFormData();
    const emitSpy = spyOn(component.onAddAdvance, 'emit');

    component.onSubmit();

    expect(advancesServiceSpy.addNewAdvance).toHaveBeenCalledWith({
      amount: 3000,
      purpose: 'Project purchase',
      description: 'Need pre-approved budget support',
    });
    expect(messageServiceSpy.add).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/advances'], {
      queryParamsHandling: 'preserve',
      skipLocationChange: true,
    });
    expect(component.visible()).toBeFalse();
    expect(component.formState()).toEqual({ submitted: false, loading: false });
    expect(emitSpy).toHaveBeenCalledWith(createdAdvance);
  });

  it('should handle unsuccessful submit response', () => {
    advancesServiceSpy.addNewAdvance.and.returnValue(
      of({ success: false, message: 'Unable to create advance' } as AdvanceCreateResult),
    );
    setValidFormData();
    const emitSpy = spyOn(component.onAddAdvance, 'emit');

    component.onSubmit();

    expect(messageServiceSpy.add).toHaveBeenCalled();
    expect(component.formState().loading).toBeFalse();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should handle submit error and stop loading', () => {
    advancesServiceSpy.addNewAdvance.and.returnValue(
      throwError(() => ({ message: 'Network failure' } as AdvanceCreateResult)),
    );
    setValidFormData();

    component.onSubmit();

    expect(messageServiceSpy.add).toHaveBeenCalled();
    expect(component.formState().loading).toBeFalse();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
