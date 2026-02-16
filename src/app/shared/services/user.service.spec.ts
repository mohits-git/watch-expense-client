import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_ENDPOINTS, API_MESSAGES } from '@/shared/constants';
import { UserRole } from '@/shared/enums';
import { User, UsersSummary } from '@/shared/types';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const users: User[] = [
    {
      id: '1',
      name: 'Alice',
      email: 'a@example.com',
      role: UserRole.Admin,
      isActive: true,
      createdAt: 1,
      updatedAt: 1,
    },
    {
      id: '2',
      name: 'Bob',
      email: 'b@example.com',
      role: UserRole.Employee,
      isActive: true,
      createdAt: 2,
      updatedAt: 2,
    },
    {
      id: '3',
      name: 'Carol',
      email: 'c@example.com',
      role: UserRole.Employee,
      isActive: false,
      createdAt: 3,
      updatedAt: 3,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getUsers returns users list', (done) => {
    service.getUsers().subscribe((result) => {
      expect(result).toEqual(users);
      done();
    });

    const req = httpMock.expectOne(API_ENDPOINTS.USERS.GET_ALL);
    expect(req.request.method).toBe('GET');
    req.flush({ data: users });
  });

  it('getUsers maps error message', (done) => {
    const errorMessage = 'fetch failed';

    service.getUsers().subscribe({
      next: () => done.fail('Expected error'),
      error: (error: Error) => {
        expect(error.message).toBe(errorMessage);
        done();
      },
    });

    const req = httpMock.expectOne(API_ENDPOINTS.USERS.GET_ALL);
    req.flush({ message: errorMessage }, { status: 500, statusText: 'Server Error' });
  });

  it('getUsersSummary returns aggregated counts', (done) => {
    const expected: UsersSummary = {
      totalUsers: 3,
      adminUsers: 1,
      employeeUsers: 2,
    };

    service.getUsersSummary().subscribe((summary) => {
      expect(summary).toEqual(expected);
      done();
    });

    const req = httpMock.expectOne(API_ENDPOINTS.USERS.GET_ALL);
    expect(req.request.method).toBe('GET');
    req.flush({ data: users });
  });

  it('getUsersSummary returns default error message on failure', (done) => {
    service.getUsersSummary().subscribe({
      next: () => done.fail('Expected error'),
      error: (error: Error) => {
        expect(error.message).toBe(API_MESSAGES.ADMIN.USER.FETCH_ERROR);
        done();
      },
    });

    const req = httpMock.expectOne(API_ENDPOINTS.USERS.GET_ALL);
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  it('getUserById fetches a single user', (done) => {
    const id = '42';
    const user = users[0];
    service.getUserById(id).subscribe((result) => {
      expect(result).toEqual(user);
      done();
    });

    const req = httpMock.expectOne('/api/users/42');
    expect(req.request.method).toBe('GET');
    req.flush({ data: user });
  });

  it('getUserById propagates error message', (done) => {
    const id = '42';
    const errorMessage = 'not found';

    service.getUserById(id).subscribe({
      next: () => done.fail('Expected error'),
      error: (error: Error) => {
        expect(error.message).toBe(errorMessage);
        done();
      },
    });

    const req = httpMock.expectOne('/api/users/42');
    req.flush({ message: errorMessage }, { status: 404, statusText: 'Not Found' });
  });

  it('createUser posts payload and returns id', (done) => {
    const payload: Partial<User> = { name: 'New', email: 'new@example.com' };

    service.createUser(payload).subscribe((id) => {
      expect(id).toBe('new-id');
      done();
    });

    const req = httpMock.expectOne(API_ENDPOINTS.USERS.CREATE);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ data: { id: 'new-id' } });
  });

  it('createUser propagates default error when message missing', (done) => {
    service.createUser({}).subscribe({
      next: () => done.fail('Expected error'),
      error: (error: Error) => {
        expect(error.message).toBe('An unexpected error occurred');
        done();
      },
    });

    const req = httpMock.expectOne(API_ENDPOINTS.USERS.CREATE);
    req.flush({}, { status: 400, statusText: 'Bad Request' });
  });

  it('updateUser sends PUT and resolves void', (done) => {
    const id = '42';
    const payload: Partial<User> = { role: UserRole.Employee };

    service.updateUser(id, payload).subscribe((result) => {
      expect(result).toBeUndefined();
      done();
    });

    const req = httpMock.expectOne('/api/users/42');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ data: undefined });
  });

  it('updateUser propagates error message', (done) => {
    const id = '42';
    const errorMessage = 'update failed';

    service.updateUser(id, {}).subscribe({
      next: () => done.fail('Expected error'),
      error: (error: Error) => {
        expect(error.message).toBe(errorMessage);
        done();
      },
    });

    const req = httpMock.expectOne('/api/users/42');
    req.flush({ message: errorMessage }, { status: 400, statusText: 'Bad Request' });
  });

  it('deleteUser sends DELETE and resolves void', (done) => {
    const id = '42';

    service.deleteUser(id).subscribe((result) => {
      expect(result).toBeUndefined();
      done();
    });

    const req = httpMock.expectOne('/api/users/42');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('deleteUser propagates error message', (done) => {
    const id = '42';
    const errorMessage = 'delete failed';

    service.deleteUser(id).subscribe({
      next: () => done.fail('Expected error'),
      error: (error: Error) => {
        expect(error.message).toBe(errorMessage);
        done();
      },
    });

    const req = httpMock.expectOne('/api/users/42');
    req.flush({ message: errorMessage }, { status: 500, statusText: 'Server Error' });
  });
});
