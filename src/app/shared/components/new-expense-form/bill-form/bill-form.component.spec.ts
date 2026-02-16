import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { BillFormComponent } from './bill-form.component';
import { ImageUploadService } from '@/shared/services/image-upload.service';
import { FormState, NewBillForm } from '@/shared/types';

describe('BillFormComponent', () => {
  let component: BillFormComponent;
  let fixture: ComponentFixture<BillFormComponent>;
  let imageUploadServiceSpy: jasmine.SpyObj<ImageUploadService>;
  let billFormGroup: FormGroup<NewBillForm>;

  const defaultFormState: FormState = {
    loading: false,
    submitted: false,
  };

  beforeEach(async () => {
    imageUploadServiceSpy = jasmine.createSpyObj<ImageUploadService>('ImageUploadService', [
      'uploadImage',
      'deleteImage',
    ]);
    imageUploadServiceSpy.uploadImage.and.returnValue(of('https://img.test/bill-1.png'));
    imageUploadServiceSpy.deleteImage.and.returnValue(of(true));

    billFormGroup = new FormGroup<NewBillForm>({
      amount: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      description: new FormControl('', {
        validators: [Validators.maxLength(1000)],
      }),
      attachmentUrl: new FormControl(''),
    });

    await TestBed.configureTestingModule({
      imports: [BillFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ImageUploadService, useValue: imageUploadServiceSpy },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BillFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formGroup', billFormGroup);
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('removeable', true);
    fixture.componentRef.setInput('formState', defaultFormState);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render bill number based on index input', () => {
    fixture.componentRef.setInput('index', 1);
    fixture.detectChanges();

    const hostText = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(hostText).toContain('Bill #2');
  });

  it('should upload file and patch attachmentUrl on success', () => {
    const file = new File(['dummy'], 'bill.pdf', { type: 'application/pdf' });

    component.uploadHandler({ files: [file] } as any);

    expect(imageUploadServiceSpy.uploadImage).toHaveBeenCalledWith(file);
    expect(component.formGroup().controls['attachmentUrl'].value).toBe(
      'https://img.test/bill-1.png',
    );
    expect(component.loading()).toBeFalse();
  });

  it('should clear file upload and stop loading when upload fails', () => {
    imageUploadServiceSpy.uploadImage.and.returnValue(
      throwError(() => new Error('upload failed')),
    );
    const clearSpy = jasmine.createSpy('clear');
    (component as any).fileUploadRef = () => ({ clear: clearSpy });
    const file = new File(['dummy'], 'bill.pdf', { type: 'application/pdf' });

    component.uploadHandler({ files: [file] } as any);

    expect(clearSpy).toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });

  it('should clear attachment and call deleteImage when attachment exists', () => {
    component.formGroup().patchValue({ attachmentUrl: 'https://img.test/old.png' });
    const clearSpy = jasmine.createSpy('clear');
    (component as any).fileUploadRef = () => ({ clear: clearSpy });

    component.clearFile();

    expect(component.formGroup().controls['attachmentUrl'].value).toBe('');
    expect(clearSpy).toHaveBeenCalled();
    expect(imageUploadServiceSpy.deleteImage).toHaveBeenCalledWith(
      'https://img.test/old.png',
      true,
    );
  });

  it('should clear attachment without deleteImage when no attachment exists', () => {
    component.formGroup().patchValue({ attachmentUrl: '' });
    const clearSpy = jasmine.createSpy('clear');
    (component as any).fileUploadRef = () => ({ clear: clearSpy });

    component.clearFile();

    expect(clearSpy).toHaveBeenCalled();
    expect(imageUploadServiceSpy.deleteImage).not.toHaveBeenCalled();
  });

  it('should detect invalid amount field when touched', () => {
    const amountControl = component.formGroup().controls['amount'];
    amountControl.setValue(0);
    amountControl.markAsTouched();

    expect(component.isInvalidField('amount')).toBeTrue();
    expect(component.getFieldErrors('amount').length).toBeGreaterThan(0);
  });

  it('should return empty field errors when control is untouched', () => {
    const descriptionControl = component.formGroup().controls['description'];
    descriptionControl.setValue('Valid description');

    expect(component.getFieldErrors('description')).toEqual([]);
  });
});
