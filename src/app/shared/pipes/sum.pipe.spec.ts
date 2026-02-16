import { SumPipe } from './sum.pipe';

describe('SumPipe', () => {
  let pipe: SumPipe;

  beforeEach(() => {
    pipe = new SumPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('returns 0 for empty array', () => {
      expect(pipe.transform([], 'id')).toBe(0);
    });

    it('sums array of numbers and returns value with 2 decimal places', () => {
      // pipe returns string from toFixed(2) at runtime
      expect(pipe.transform([1, 2, 3], '') as unknown).toEqual('6.00');
      expect(pipe.transform([10.5, 20.25, 30], '') as unknown).toEqual('60.75');
      expect(pipe.transform([100], '') as unknown).toEqual('100.00');
    });

    it('returns 0 when first element is not a number and not an object', () => {
      expect(pipe.transform(['a', 'b'], 'prop')).toBe(0);
      expect(pipe.transform([null], 'prop')).toBe(0);
    });

    it('returns 0 when value is array of objects but first object does not have the property', () => {
      expect(
        pipe.transform([{ name: 'x' }, { amount: 10 }], 'amount'),
      ).toBe(0);
      expect(pipe.transform([{}], 'amount')).toBe(0);
    });

    it('sums property from array of objects when first object has the property', () => {
      // pipe returns string from toFixed(2) at runtime
      expect(
        pipe.transform(
          [
            { amount: 10 },
            { amount: 20 },
            { amount: 15 },
          ],
          'amount',
        ) as unknown,
      ).toEqual('45.00');
      expect(
        pipe.transform([{ price: 99.5 }], 'price') as unknown,
      ).toEqual('99.50');
    });

    it('handles mixed numeric property values', () => {
      expect(
        pipe.transform(
          [{ value: 1.1 }, { value: 2.2 }, { value: 3.3 }],
          'value',
        ) as unknown,
      ).toEqual('6.60');
    });
  });
});
