import { randomIntWithLimit } from './random';

describe('utils: random', () => {
  describe('randomIntWithLimit', () => {
    it('should return a number that equal or below than limit', () => {
      expect.hasAssertions();
      const limit = 3;
      const actual = randomIntWithLimit(limit);
      expect(actual).toBeLessThanOrEqual(limit);
    });

    it('should minimal 0', () => {
      expect.hasAssertions();
      const actual = randomIntWithLimit(0);
      expect(actual).toStrictEqual(0);
    });

    it('should throw error when limit lower than 0', () => {
      expect.hasAssertions();
      expect(() => {
        randomIntWithLimit(-1);
      }).toThrow('Limit minimal 0');
    });

    it('should return an integer', () => {
      expect.hasAssertions();
      const actual = randomIntWithLimit(10);
      expect(Number.isInteger(actual)).toBeTruthy();
    });
  });
});
