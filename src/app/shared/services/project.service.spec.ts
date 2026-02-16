import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_ENDPOINTS, API_MESSAGES } from '@/shared/constants';
import { Project, ProjectsSummary } from '@/shared/types';
import { buildAPIEndpoint } from '@/shared/utils/api.util';

import { ProjectService } from './project.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const projects: Project[] = [
    {
      id: '1',
      name: 'Alpha',
      description: 'First project',
      budget: 10_000,
      startDate: now - oneDay,
      endDate: now + oneDay,
      departmentId: 'dept-1',
      createdAt: 1,
      updatedAt: 1,
    },
    {
      id: '2',
      name: 'Beta',
      description: 'Second project',
      budget: 20_000,
      startDate: now - 2 * oneDay,
      endDate: now - oneDay,
      departmentId: 'dept-2',
      createdAt: 2,
      updatedAt: 2,
    },
    {
      id: '3',
      name: 'Gamma',
      description: 'Third project',
      budget: 15_000,
      startDate: now + oneDay,
      endDate: now + 2 * oneDay,
      departmentId: 'dept-1',
      createdAt: 3,
      updatedAt: 3,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getProjects', () => {
    it('returns projects list from API', (done) => {
      service.getProjects().subscribe((result) => {
        expect(result).toEqual(projects);
        done();
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.PROJECT.GET_ALL);
      expect(req.request.method).toBe('GET');
      req.flush({ data: projects });
    });

    it('maps error to message from response when present', (done) => {
      const errorMessage = 'fetch failed';

      service.getProjects().subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(errorMessage);
          done();
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.PROJECT.GET_ALL);
      req.flush(
        { message: errorMessage },
        { status: 500, statusText: 'Server Error' },
      );
    });

    it('uses default FETCH_ERROR when response has no message', (done) => {
      service.getProjects().subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(API_MESSAGES.ADMIN.PROJECT.FETCH_ERROR);
          done();
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.PROJECT.GET_ALL);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getProjectsSummary', () => {
    it('returns aggregated summary from projects', (done) => {
      const expected: ProjectsSummary = {
        totalProjects: 3,
        totalBudget: 45_000,
        averageBudget: 15_000,
        activeProjects: 1, // only Alpha is active (startDate <= now <= endDate)
      };

      service.getProjectsSummary().subscribe((summary) => {
        expect(summary.totalProjects).toBe(expected.totalProjects);
        expect(summary.totalBudget).toBe(expected.totalBudget);
        expect(summary.averageBudget).toBe(expected.averageBudget);
        expect(summary.activeProjects).toBe(expected.activeProjects);
        done();
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.PROJECT.GET_ALL);
      expect(req.request.method).toBe('GET');
      req.flush({ data: projects });
    });

    it('returns zero averageBudget when no projects', (done) => {
      service.getProjectsSummary().subscribe((summary) => {
        expect(summary.totalProjects).toBe(0);
        expect(summary.totalBudget).toBe(0);
        expect(summary.averageBudget).toBe(0);
        expect(summary.activeProjects).toBe(0);
        done();
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.PROJECT.GET_ALL);
      req.flush({ data: [] });
    });

    it('propagates error when getProjects fails', (done) => {
      service.getProjectsSummary().subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(API_MESSAGES.ADMIN.PROJECT.FETCH_ERROR);
          done();
        },
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.PROJECT.GET_ALL);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('createProject', () => {
    it('posts payload and returns created project id', (done) => {
      const payload: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'New Project',
        description: 'New desc',
        budget: 5_000,
        startDate: now,
        endDate: now + oneDay,
        departmentId: 'dept-1',
      };

      service.createProject(payload).subscribe((id) => {
        expect(id).toBe('new-project-id');
        done();
      });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.PROJECT.CREATE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ data: 'new-project-id' });
    });

    it('maps error to message from response when present', (done) => {
      const errorMessage = 'create failed';

      service
        .createProject({
          name: 'X',
          description: '',
          budget: 0,
          startDate: now,
          endDate: now,
          departmentId: 'dept-1',
        })
        .subscribe({
          next: () => done.fail('Expected error'),
          error: (error: Error) => {
            expect(error.message).toBe(errorMessage);
            done();
          },
        });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.PROJECT.CREATE);
      req.flush(
        { message: errorMessage },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    it('uses default CREATE_ERROR when response has no message', (done) => {
      service
        .createProject({
          name: 'X',
          description: '',
          budget: 0,
          startDate: now,
          endDate: now,
          departmentId: 'dept-1',
        })
        .subscribe({
          next: () => done.fail('Expected error'),
          error: (error: Error) => {
            expect(error.message).toBe(API_MESSAGES.ADMIN.PROJECT.CREATE_ERROR);
            done();
          },
        });

      const req = httpMock.expectOne(API_ENDPOINTS.ADMIN.PROJECT.CREATE);
      req.flush({}, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateProject', () => {
    it('sends PUT to built endpoint and resolves void', (done) => {
      const id = '42';
      const payload = { name: 'Updated Name', budget: 25_000 };
      const endpoint = buildAPIEndpoint(
        API_ENDPOINTS.ADMIN.PROJECT.UPDATE,
        { id },
      );

      service.updateProject(id, payload).subscribe((result) => {
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
        API_ENDPOINTS.ADMIN.PROJECT.UPDATE,
        { id },
      );

      service.updateProject(id, {}).subscribe({
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
        API_ENDPOINTS.ADMIN.PROJECT.UPDATE,
        { id },
      );

      service.updateProject(id, { name: 'X' }).subscribe({
        next: () => done.fail('Expected error'),
        error: (error: Error) => {
          expect(error.message).toBe(API_MESSAGES.ADMIN.PROJECT.UPDATE_ERROR);
          done();
        },
      });

      const req = httpMock.expectOne(endpoint);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });
});
