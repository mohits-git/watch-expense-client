import { BASE_URL } from '../constants';

import { buildAPIEndpoint, getFullApiUrl } from './api.util';

describe('api.util', () => {
  describe('getFullApiUrl', () => {
    it('returns BASE_URL.API concatenated with endpoint', () => {
      expect(getFullApiUrl('/api/users')).toBe(`${BASE_URL.API}/api/users`);
      expect(getFullApiUrl('/api/expenses')).toBe(
        `${BASE_URL.API}/api/expenses`,
      );
      expect(getFullApiUrl('')).toBe(`${BASE_URL.API}`);
    });
  });

  describe('buildAPIEndpoint', () => {
    it('returns endpoint unchanged when params is not provided', () => {
      expect(buildAPIEndpoint('/api/users/:id')).toBe('/api/users/:id');
      expect(buildAPIEndpoint('/api/expenses')).toBe('/api/expenses');
    });

    it('returns endpoint unchanged when params is undefined', () => {
      expect(buildAPIEndpoint('/api/users/:id', undefined)).toBe(
        '/api/users/:id',
      );
    });

    it('replaces single placeholder with encoded value', () => {
      expect(buildAPIEndpoint('/api/users/:id', { id: 'user-1' })).toBe(
        '/api/users/user-1',
      );
      expect(buildAPIEndpoint('/api/users/:id', { id: 42 })).toBe(
        '/api/users/42',
      );
    });

    it('replaces multiple placeholders', () => {
      expect(
        buildAPIEndpoint('/api/users/:userId/orders/:orderId', {
          userId: 'u1',
          orderId: 'o2',
        }),
      ).toBe('/api/users/u1/orders/o2');
    });

    it('encodes special characters in param values', () => {
      expect(
        buildAPIEndpoint('/api/search/:q', { q: 'hello world' }),
      ).toBe('/api/search/hello%20world');
      expect(
        buildAPIEndpoint('/api/id/:id', { id: 'a/b' }),
      ).toBe('/api/id/a%2Fb');
    });

    it('handles boolean param values', () => {
      expect(
        buildAPIEndpoint('/api/flag/:active', { active: true }),
      ).toBe('/api/flag/true');
      expect(
        buildAPIEndpoint('/api/flag/:active', { active: false }),
      ).toBe('/api/flag/false');
    });
  });
});
