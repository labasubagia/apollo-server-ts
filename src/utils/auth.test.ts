import { signJwtToken, verifyJwtToken } from './auth';

interface Payload {
  id: number;
  data: string | number;
}

describe('auth utils', () => {
  describe('signJwtToken', () => {
    it('should be able to generate jwt token', () => {
      expect.hasAssertions();
      const payload: Payload = { id: 1, data: 'test' };
      const token = signJwtToken(payload);
      const { id, data } = verifyJwtToken(token) as Payload;
      expect(payload).toStrictEqual({ id, data });
    });
  });
});
