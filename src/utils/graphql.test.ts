import { ObjectID } from 'mongodb';
import { PostDbObject } from '../codegen';
import { MOCK_MONGO_POST_ID, MOCK_MONGO_USER_ID } from '../const/mocks';
import { normalize } from './graphql';

describe('graphql util', () => {
  describe('normalizeGraphqlData', () => {
    it('should return plain javascript object', () => {
      expect.hasAssertions();
      const date = new Date().toISOString();
      const payload: PostDbObject = {
        _id: new ObjectID(MOCK_MONGO_POST_ID),
        author: new ObjectID(MOCK_MONGO_USER_ID) as ObjectID,
        publishedAt: date,
        title: 'Lorem',
        content: 'lorem',
      };
      const normalized = normalize(payload);
      expect(normalized).toStrictEqual({
        ...payload,
        _id: String(payload?._id as ObjectID),
        author: String(payload?.author),
        publishedAt: date,
      });
    });
  });
});
