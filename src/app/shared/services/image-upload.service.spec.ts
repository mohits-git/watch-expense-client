import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';

import {
  API_ENDPOINTS,
  API_MESSAGES,
  TOAST_SUMMARIES,
  TOAST_TYPES,
} from '@/shared/constants';

import { ImageUploadService } from './image-upload.service';

describe('ImageUploadService', () => {
  let service: ImageUploadService;
  let httpMock: HttpTestingController;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', [
      'add',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    });

    service = TestBed.inject(ImageUploadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('uploadImage', () => {
    it('posts FormData and returns image_url on success', (done) => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      const imageUrl = 'https://example.com/image.png';

      service.uploadImage(file).subscribe((url) => {
        expect(url).toBe(imageUrl);
        expect(messageServiceSpy.add).toHaveBeenCalledWith({
          severity: TOAST_TYPES.SUCCESS,
          summary: TOAST_SUMMARIES.SUCCESS,
          detail: API_MESSAGES.IMAGE.UPLOAD_SUCCESS,
        });
        done();
      });

      const req = httpMock.expectOne(API_ENDPOINTS.IMAGE.UPLOAD);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTrue();
      const appendedFile = req.request.body.get('file') as File;
      expect(appendedFile).toBeInstanceOf(File);
      expect(appendedFile.name).toBe(file.name);
      expect(appendedFile.size).toBe(file.size);
      req.flush({ data: { image_url: imageUrl } });
    });

    it('shows error toast and throws on upload failure', (done) => {
      const file = new File(['x'], 'a.png', { type: 'image/png' });

      service.uploadImage(file).subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(API_MESSAGES.IMAGE.UPLOAD_ERROR);
          expect(messageServiceSpy.add).toHaveBeenCalledWith({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: API_MESSAGES.IMAGE.UPLOAD_ERROR,
          });
          done();
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.IMAGE.UPLOAD);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('deleteImage', () => {
    it('sends DELETE with body and returns true, shows success toast by default', (done) => {
      const imageUrl = 'https://example.com/img.png';

      service.deleteImage(imageUrl).subscribe((result) => {
        expect(result).toBeTrue();
        expect(messageServiceSpy.add).toHaveBeenCalledWith({
          severity: TOAST_TYPES.SUCCESS,
          summary: TOAST_SUMMARIES.SUCCESS,
          detail: API_MESSAGES.IMAGE.DELETE_SUCCESS,
        });
        done();
      });

      const req = httpMock.expectOne(API_ENDPOINTS.IMAGE.DELETE);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual({ image_url: imageUrl });
      req.flush(null);
    });

    it('does not show success toast when suppressMessage is true', (done) => {
      messageServiceSpy.add.calls.reset();

      service.deleteImage('https://x.com/y.png', true).subscribe((result) => {
        expect(result).toBeTrue();
        expect(messageServiceSpy.add).not.toHaveBeenCalled();
        done();
      });

      const req = httpMock.expectOne(API_ENDPOINTS.IMAGE.DELETE);
      req.flush(null);
    });

    it('shows error toast and throws on delete failure when not suppressed', (done) => {
      service.deleteImage('https://x.com/y.png').subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(API_MESSAGES.IMAGE.DELETE_ERROR);
          expect(messageServiceSpy.add).toHaveBeenCalledWith({
            severity: TOAST_TYPES.ERROR,
            summary: TOAST_SUMMARIES.ERROR,
            detail: API_MESSAGES.IMAGE.DELETE_ERROR,
          });
          done();
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.IMAGE.DELETE);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });

    it('does not show error toast when suppressMessage is true and delete fails', (done) => {
      messageServiceSpy.add.calls.reset();

      service.deleteImage('https://x.com/y.png', true).subscribe({
        next: () => done.fail('Expected error'),
        error: () => {
          expect(messageServiceSpy.add).not.toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.IMAGE.DELETE);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getImageDownloadUrl', () => {
    it('GETs with url param and returns download_url', (done) => {
      const imageUrl = 'https://example.com/img.png';
      const downloadUrl = 'https://cdn.example.com/signed/img.png';

      service.getImageDownloadUrl(imageUrl).subscribe((url) => {
        expect(url).toBe(downloadUrl);
        done();
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === API_ENDPOINTS.IMAGE.DOWNLOAD_URL &&
          r.params.get('url') === imageUrl,
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: { download_url: downloadUrl } });
    });

    it('throws with DOWNLOAD_URL_ERROR on failure', (done) => {
      service.getImageDownloadUrl('https://x.com/y.png').subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(API_MESSAGES.IMAGE.DOWNLOAD_URL_ERROR);
          done();
        },
      });

      const req = httpMock.expectOne(
        (r) => r.url === API_ENDPOINTS.IMAGE.DOWNLOAD_URL,
      );
      req.flush({}, { status: 404, statusText: 'Not Found' });
    });
  });
});
