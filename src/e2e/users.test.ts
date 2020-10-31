/* eslint-disable jest/no-hooks */
import { ApolloServerTestClient } from 'apollo-server-testing';
import { ClientMutation } from '../interfaces/ClientMutation';
import { normalize } from '../utils/graphql';
import { setupMockClient } from './setup-client';
import { FOLLOW_USER, UNFOLLOW_USER } from './queries/users';
import { mongoDbMockProvider, MongoDbProvider } from '../mongo/provider';
import {
  MutationFollowUserArgs,
  MutationUnFollowUserArgs,
} from '../generated/codegen';
import { MOCK_MONGO_USER_ID } from '../const/mocks';
import { expectedUserFollow } from './mock-data';

describe('e2e user', (): void => {
  const provider: MongoDbProvider = mongoDbMockProvider;
  let mockClient: ApolloServerTestClient;

  beforeAll(async () => {
    await provider.connectAsync();
    mockClient = setupMockClient(provider);
  });

  afterAll(async () => {
    await provider.closeAsync();
  });

  afterEach(async () => {
    await provider.removeAllData();
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
      expect(normalize(data)).toStrictEqual({ user: expectedUserFollow });
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
      expect(normalize(data)).toStrictEqual({ user: expectedUserFollow });
    });
  });
});
