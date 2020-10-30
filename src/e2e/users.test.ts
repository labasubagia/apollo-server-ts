/* eslint-disable jest/no-hooks */
import { ApolloServerTestClient } from 'apollo-server-testing';
import { ClientMutation } from '../interfaces/ClientMutation';
import { normalize } from '../utils/graphql';
import { setupMockClient } from './setup-client';
import { FOLLOW_USER, UNFOLLOW_USER } from './queries/users';
import { mongoDbMockProvider } from '../mongo/provider';
import { MutationFollowUserArgs, MutationUnFollowUserArgs } from '../codegen';
import { MOCK_GRAPHQL_UNSIGNED_INT, MOCK_MONGO_USER_ID } from '../const/mocks';

describe('e2e user', (): void => {
  let mockClient: ApolloServerTestClient;

  beforeAll(async () => {
    await mongoDbMockProvider.connectAsync();
    mockClient = setupMockClient(mongoDbMockProvider);
  });

  afterAll(async () => {
    await mongoDbMockProvider.closeAsync();
  });

  afterEach(async () => {
    await mongoDbMockProvider.removeAllData();
  });

  describe('mutation followUser', () => {
    it('should mock follower count after follow user', async (): Promise<
      void
    > => {
      expect.hasAssertions();
      const mutation: ClientMutation<MutationFollowUserArgs> = {
        mutation: FOLLOW_USER,
        variables: {
          userId: MOCK_MONGO_USER_ID,
        },
      };
      const { data } = await mockClient.mutate(mutation);
      expect(normalize(data)).toStrictEqual({
        user: {
          followingCount: MOCK_GRAPHQL_UNSIGNED_INT,
        },
      });
    });
  });

  describe('mutation unFollowUser', () => {
    it('should mock follower count after unFollow user', async (): Promise<
      void
    > => {
      expect.hasAssertions();
      const mutation: ClientMutation<MutationUnFollowUserArgs> = {
        mutation: UNFOLLOW_USER,
        variables: {
          userId: MOCK_MONGO_USER_ID,
        },
      };
      const { data } = await mockClient.mutate(mutation);
      expect(normalize(data)).toStrictEqual({
        user: {
          followingCount: MOCK_GRAPHQL_UNSIGNED_INT,
        },
      });
    });
  });
});
