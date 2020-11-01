import { TokenPayload } from '../interfaces/TokenPayload';
import { mockUserForAuth } from '../mongo/dummy';
import { signJwtToken, verifyJwtToken } from './auth';

describe('auth utils', () => {
  describe('signJwtToken', () => {
    it('should be able to generate jwt token', () => {
      expect.hasAssertions();
      const payload: TokenPayload = {
        id: String(mockUserForAuth._id),
        username: mockUserForAuth.username as string,
        email: mockUserForAuth.email as string,
      };
      const token = signJwtToken(payload);
      const { id, username, email } = verifyJwtToken(token) as TokenPayload;
      expect(payload).toStrictEqual({ id, username, email });
    });
  });
});
