import { ObjectID } from 'mongodb';
import { PostDbObject } from '../codegen';
import { MOCK_MONGO_POST_ID, MOCK_MONGO_USER_ID } from '../const/mocks';
import { normalize } from './graphql';

describe('graphql util', () => {
  describe('normalizeGraphqlData', () => {
    it('should return plain javascript object', () => {
      expect.hasAssertions();
      const date = new Date();
      const payload: PostDbObject = {
        _id: new ObjectID(MOCK_MONGO_POST_ID),
        author: new ObjectID(MOCK_MONGO_USER_ID),
        publishedAt: date,
        title: 'Lorem',
        content: 'lorem',
      };
      const normalized = normalize(payload);
      expect(normalized).toStrictEqual({
        ...payload,
        _id: String(payload._id),
        author: String(payload.author),
        // INFO: JSON.stringify use Date.prototype.tiISOString behind the scene
        publishedAt: date.toISOString(),
      });
    });
  });
});
