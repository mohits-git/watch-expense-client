import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  API_ENDPOINTS,
  API_MESSAGES,
  HTTP_STATUS_CODES,
} from '@/shared/constants';
import {
  GetAdvanceAPIResponse,
  RequestStatus,
  AdvanceCreateResult,
} from '@/shared/types';

import { AuthService } from './auth.serivce';
import { AdvancesService } from './advances.service';

describe('AdvancesService', () => {
  let service: AdvancesService;
  let httpMock: HttpTestingController;
  let authServiceFake: { user: ReturnType<typeof signal> };

  const mockUser = { id: 'user-1' };
  const advancesResponse: GetAdvanceAPIResponse = {
    totalAdvances: 2,
    advances: [
      {
        id: 'a1',
        userId: 'user-1',
        amount: 500,
        purpose: 'Travel',
        status: RequestStatus.Pending,
        description: '',
        createdAt: 1,
        updatedAt: 1,
        approvedAt: null,
        approvedBy: null,
        reviewedAt: null,
        reviewedBy: null,
        reconciledExpenseId: null,
      },
    ],
  };

  beforeEach(() => {
    authServiceFake = { user: signal(mockUser) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceFake },
      ],
    });

    service = TestBed.inject(AdvancesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('fetchAdvances', () => {
    it('GETs with default page, limit, status and returns response data', (done) => {
      service.fetchAdvances().subscribe((result) => {
        expect(result).toEqual(advancesResponse);
        done();
      });

      const req = httpMock.expectOne(
        (r) =>
          r.method === 'GET' &&
          (r.url === API_ENDPOINTS.ADVANCE.GET_ALL ||
            r.url.startsWith(API_ENDPOINTS.ADVANCE.GET_ALL + '?')) &&
          r.params.get('page') === '1' &&
          r.params.get('limit') === '10' &&
          r.params.get('status') === '',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: advancesResponse });
    });

    it('GETs with provided status, page, limit', (done) => {
      service
        .fetchAdvances(RequestStatus.Approved, 2, 20)
        .subscribe((result) => {
          expect(result).toEqual(advancesResponse);
          done();
        });

      const req = httpMock.expectOne(
        (r) =>
          r.method === 'GET' &&
          (r.url === API_ENDPOINTS.ADVANCE.GET_ALL ||
            r.url.startsWith(API_ENDPOINTS.ADVANCE.GET_ALL + '?')) &&
          r.params.get('status') === RequestStatus.Approved &&
          r.params.get('page') === '2' &&
          r.params.get('limit') === '20',
      );
      req.flush({ data: advancesResponse });
    });

    it('maps error to message from response when present', (done) => {
      const errorMessage = 'fetch failed';

      service.fetchAdvances().subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(errorMessage);
          done();
        },
      });

      const req = httpMock.expectOne(
        (r) =>
          r.method === 'GET' &&
          (r.url === API_ENDPOINTS.ADVANCE.GET_ALL ||
            r.url.startsWith(API_ENDPOINTS.ADVANCE.GET_ALL + '?')),
      );
      req.flush(
        { message: errorMessage },
        { status: 500, statusText: 'Server Error' },
      );
    });

    it('uses default FETCH_ERROR when response has no message', (done) => {
      service.fetchAdvances().subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(API_MESSAGES.ADVANCE.FETCH_ERROR);
          done();
        },
      });

      const req = httpMock.expectOne(
        (r) =>
          r.method === 'GET' &&
          (r.url === API_ENDPOINTS.ADVANCE.GET_ALL ||
            r.url.startsWith(API_ENDPOINTS.ADVANCE.GET_ALL + '?')),
      );
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('addNewAdvance', () => {
    it('returns bad request result when amount is missing', (done) => {
      service
        .addNewAdvance({ purpose: 'Travel', description: '' })
        .subscribe({
          next: () => done.fail('Expected error'),
          error: (result: AdvanceCreateResult) => {
            expect(result.success).toBeFalse();
            expect(result.message).toBe(
              API_MESSAGES.ADVANCE.ADD_ADVANCE_BAD_REQUEST,
            );
            done();
          },
        });
    });

    it('returns bad request result when purpose is missing', (done) => {
      service.addNewAdvance({ amount: 100, description: '' }).subscribe({
        next: () => done.fail('Expected error'),
        error: (result: AdvanceCreateResult) => {
          expect(result.success).toBeFalse();
          expect(result.message).toBe(
            API_MESSAGES.ADVANCE.ADD_ADVANCE_BAD_REQUEST,
          );
          done();
        },
      });
    });

    it('POSTs advance and returns success with data when API returns id', (done) => {
      const payload = { amount: 300, purpose: 'Office', description: 'Advance' };

      service.addNewAdvance(payload).subscribe((result) => {
        expect(result.success).toBeTrue();
        expect(result.data).toBeDefined();
        expect(result.data?.id).toBe('new-advance-id');
        expect(result.data?.userId).toBe('user-1');
        expect(result.data?.amount).toBe(300);
        expect(result.data?.purpose).toBe('Office');
        expect(result.data?.status).toBe(RequestStatus.Pending);
        done();
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADVANCE.CREATE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ data: { id: 'new-advance-id' } });
    });

    it('uses BAD_REQUEST message when API returns 400 with message', (done) => {
      const payload = { amount: 300, purpose: 'Office' };
      const errorMessage = 'Invalid data';

      service.addNewAdvance(payload).subscribe({
        next: () => done.fail('Expected error'),
        error: (result: AdvanceCreateResult) => {
          expect(result.success).toBeFalse();
          expect(result.message).toBe(errorMessage);
          done();
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADVANCE.CREATE);
      req.flush(
        { message: errorMessage },
        { status: HTTP_STATUS_CODES.BAD_REQUEST, statusText: 'Bad Request' },
      );
    });

    it('uses ADD_ADVANCE_ERROR when non-400 error has no message', (done) => {
      service.addNewAdvance({ amount: 1, purpose: 'X' }).subscribe({
        next: () => done.fail('Expected error'),
        error: (result: AdvanceCreateResult) => {
          expect(result.success).toBeFalse();
          expect(result.message).toBe(API_MESSAGES.ADVANCE.ADD_ADVANCE_ERROR);
          done();
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADVANCE.CREATE);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('updateAdvanceStatus', () => {
    it('PATCHes with status and resolves void', (done) => {
      const advanceId = 'a42';
      const status = RequestStatus.Approved;
      const url = API_ENDPOINTS.ADVANCE.PATCH.replace(':id', advanceId);

      service.updateAdvanceStatus(advanceId, status).subscribe((result) => {
        expect(result).toBeUndefined();
        done();
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status });
      req.flush({ data: undefined });
    });

    it('propagates error message', (done) => {
      const advanceId = 'a42';
      const url = API_ENDPOINTS.ADVANCE.PATCH.replace(':id', advanceId);
      const errorMessage = 'update failed';

      service
        .updateAdvanceStatus(advanceId, RequestStatus.Rejected)
        .subscribe({
          next: () => done.fail('Expected error'),
          error: (error: Error) => {
            expect(error.message).toBe(errorMessage);
            done();
          },
        });

      const req = httpMock.expectOne(url);
      req.flush(
        { message: errorMessage },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    it('uses default ADVANCE_UPDATE_FAILED when response has no message', (done) => {
      const advanceId = 'a99';
      const url = API_ENDPOINTS.ADVANCE.PATCH.replace(':id', advanceId);

      service.updateAdvanceStatus(advanceId, RequestStatus.Approved).subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(
            API_MESSAGES.ADVANCE.ADVANCE_UPDATE_FAILED,
          );
          done();
        },
      });

      const req = httpMock.expectOne(url);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('fetchAdvanceById', () => {
    it('GETs by id and returns advance', (done) => {
      const advanceId = 'a1';
      const advance = advancesResponse.advances[0];
      const url = API_ENDPOINTS.ADVANCE.GET_BY_ID.replace(':id', advanceId);

      service.fetchAdvanceById(advanceId).subscribe((result) => {
        expect(result).toEqual(advance);
        done();
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush({ data: advance });
    });

    it('propagates error message', (done) => {
      const advanceId = 'a999';
      const url = API_ENDPOINTS.ADVANCE.GET_BY_ID.replace(':id', advanceId);
      const errorMessage = 'not found';

      service.fetchAdvanceById(advanceId).subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(errorMessage);
          done();
        },
      });

      const req = httpMock.expectOne(url);
      req.flush(
        { message: errorMessage },
        { status: 404, statusText: 'Not Found' },
      );
    });

    it('uses default FETCH_ERROR when response has no message', (done) => {
      const advanceId = 'a999';
      const url = API_ENDPOINTS.ADVANCE.GET_BY_ID.replace(':id', advanceId);

      service.fetchAdvanceById(advanceId).subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(API_MESSAGES.ADVANCE.FETCH_ERROR);
          done();
        },
      });

      const req = httpMock.expectOne(url);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });
});
