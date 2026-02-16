import { getRouteSegments, joinRouteSegments } from './routes.util';

describe('routes.util', () => {
  describe('getRouteSegments', () => {
    it('splits route by slash into segments', () => {
      expect(getRouteSegments('dashboard')).toEqual(['dashboard']);
      expect(getRouteSegments('dashboard/users')).toEqual([
        'dashboard',
        'users',
      ]);
      expect(getRouteSegments('admin/projects/42')).toEqual([
        'admin',
        'projects',
        '42',
      ]);
    });

    it('returns empty string segment for leading/trailing slashes', () => {
      expect(getRouteSegments('/dashboard')).toEqual(['', 'dashboard']);
      expect(getRouteSegments('dashboard/')).toEqual(['dashboard', '']);
      expect(getRouteSegments('/dashboard/users/')).toEqual([
        '',
        'dashboard',
        'users',
        '',
      ]);
    });

    it('returns single empty string for empty route', () => {
      expect(getRouteSegments('')).toEqual(['']);
    });
  });

  describe('joinRouteSegments', () => {
    it('joins segments with slash', () => {
      expect(joinRouteSegments(['dashboard'])).toBe('dashboard');
      expect(joinRouteSegments(['dashboard', 'users'])).toBe('dashboard/users');
      expect(joinRouteSegments(['admin', 'projects', '42'])).toBe(
        'admin/projects/42',
      );
    });

    it('returns empty string for empty array', () => {
      expect(joinRouteSegments([])).toBe('');
    });

    it('round-trips with getRouteSegments', () => {
      const route = 'admin/projects/42';
      expect(joinRouteSegments(getRouteSegments(route))).toBe(route);
    });
  });
});
