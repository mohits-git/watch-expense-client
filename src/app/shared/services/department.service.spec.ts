import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_ENDPOINTS, API_MESSAGES } from '@/shared/constants';
import { Department, DepartmentsSummary } from '@/shared/types';
import { buildAPIEndpoint } from '@/shared/utils/api.util';

import { DepartmentService } from './department.service';

describe('DepartmentService', () => {
  let service: DepartmentService;
  let httpMock: HttpTestingController;

  const departments: Department[] = [
    {
      id: '1',
      name: 'Engineering',
      budget: 100_000,
      createdAt: 1,
      updatedAt: 1,
    },
    {
      id: '2',
      name: 'Marketing',
      budget: 50_000,
      createdAt: 2,
      updatedAt: 2,
    },
    {
      id: '3',
      name: 'Operations',
      budget: 75_000,
      createdAt: 3,
      updatedAt: 3,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DepartmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getDepartments', () => {
    it('returns departments list from API', (done) => {
      service.getDepartments().subscribe((result) => {
        expect(result).toEqual(departments);
        done();
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.DEPARTMENT.GET_ALL);
      expect(req.request.method).toBe('GET');
      req.flush({ data: departments });
    });

    it('maps error to message from response when present', (done) => {
      const errorMessage = 'fetch failed';

      service.getDepartments().subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(errorMessage);
          done();
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.DEPARTMENT.GET_ALL);
      req.flush(
        { message: errorMessage },
        { status: 500, statusText: 'Server Error' },
      );
    });

    it('uses default FETCH_ERROR when response has no message', (done) => {
      service.getDepartments().subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(
            API_MESSAGES.ADMIN.DEPARTMENT.FETCH_ERROR,
          );
          done();
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.DEPARTMENT.GET_ALL);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getDepartmentsSummary', () => {
    it('returns aggregated summary from departments', (done) => {
      const expected: DepartmentsSummary = {
        totalDepartments: 3,
        totalBudget: 225_000,
        averageBudget: 75_000,
      };

      service.getDepartmentsSummary().subscribe((summary) => {
        expect(summary.totalDepartments).toBe(expected.totalDepartments);
        expect(summary.totalBudget).toBe(expected.totalBudget);
        expect(summary.averageBudget).toBe(expected.averageBudget);
        done();
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.DEPARTMENT.GET_ALL);
      expect(req.request.method).toBe('GET');
      req.flush({ data: departments });
    });

    it('returns zero averageBudget when no departments', (done) => {
      service.getDepartmentsSummary().subscribe((summary) => {
        expect(summary.totalDepartments).toBe(0);
        expect(summary.totalBudget).toBe(0);
        expect(summary.averageBudget).toBe(0);
        done();
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.DEPARTMENT.GET_ALL);
      req.flush({ data: [] });
    });

    it('propagates error when getDepartments fails', (done) => {
      service.getDepartmentsSummary().subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(
            API_MESSAGES.ADMIN.DEPARTMENT.FETCH_ERROR,
          );
          done();
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.DEPARTMENT.GET_ALL);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('createDepartment', () => {
    it('posts payload and returns created department id', (done) => {
      const payload: Omit<Department, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Sales',
        budget: 30_000,
      };

      service.createDepartment(payload).subscribe((id) => {
        expect(id).toBe('new-dept-id');
        done();
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.DEPARTMENT.CREATE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ data: { id: 'new-dept-id' } });
    });

    it('maps error to message from response when present', (done) => {
      const errorMessage = 'create failed';

      service
        .createDepartment({ name: 'X', budget: 0 })
        .subscribe({
          next: () => done.fail('Expected error'),
          error: (error: Error) => {
            expect(error.message).toBe(errorMessage);
            done();
          },
        });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.DEPARTMENT.CREATE);
      req.flush(
        { message: errorMessage },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    it('uses default CREATE_ERROR when response has no message', (done) => {
      service.createDepartment({ name: 'X', budget: 0 }).subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(
            API_MESSAGES.ADMIN.DEPARTMENT.CREATE_ERROR,
          );
          done();
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.DEPARTMENT.CREATE);
      req.flush({}, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateDepartment', () => {
    it('sends PUT to built endpoint and resolves void', (done) => {
      const id = '42';
      const payload = { name: 'Engineering (Updated)', budget: 120_000 };
      const endpoint = buildAPIEndpoint(
        API_ENDPOINTS.ADMIN.DEPARTMENT.UPDATE,
        { id },
      );

      service.updateDepartment(id, payload).subscribe((result) => {
        expect(result).toBeUndefined();
        done();
      });

      const req = httpMock.expectOne(endpoint);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush({ data: undefined });
    });

    it('maps error to message from response when present', (done) => {
      const id = '42';
      const errorMessage = 'update failed';
      const endpoint = buildAPIEndpoint(
        API_ENDPOINTS.ADMIN.DEPARTMENT.UPDATE,
        { id },
      );

      service.updateDepartment(id, {}).subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(errorMessage);
          done();
        },
      });

      const req = httpMock.expectOne(endpoint);
      req.flush(
        { message: errorMessage },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    it('uses default UPDATE_ERROR when response has no message', (done) => {
      const id = '99';
      const endpoint = buildAPIEndpoint(
        API_ENDPOINTS.ADMIN.DEPARTMENT.UPDATE,
        { id },
      );

      service.updateDepartment(id, { name: 'X' }).subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(
            API_MESSAGES.ADMIN.DEPARTMENT.UPDATE_ERROR,
          );
          done();
        },
      });

      const req = httpMock.expectOne(endpoint);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });
});
