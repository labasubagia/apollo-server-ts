import { ApolloServer, Config, gql } from 'apollo-server';
import {
  ApolloServerTestClient,
  createTestClient,
} from 'apollo-server-testing';

import resolvers from './resolvers';
import typeDefs from './type-defs';
import mocks from './mocks';
import {
  MOCK_GRAPHQL_DATE_TIME,
  MOCK_GRAPHQL_EMAIL,
  MOCK_GRAPHQL_STRING,
  MOCK_GRAPHQL_UNSIGNED_INT,
} from './const/mocks';

const setupClient = (config: Config): ApolloServerTestClient => {
  const testApolloServer = new ApolloServer(config);
  return createTestClient(testApolloServer);
};

const setupTestClient = (): ApolloServerTestClient => {
  return setupClient({ typeDefs, resolvers });
};

const setupMockClient = (): ApolloServerTestClient => {
  return setupClient({
    resolvers,
    typeDefs,
    mocks,
    mockEntireSchema: true,
  });
};

const normalizeGraphqlData = <T>(data: T): T => {
  return JSON.parse(JSON.stringify({ ...data }));
};

describe('main', (): void => {
  describe('query: testMessage', (): void => {
    const query = gql`
      query testMessage {
        testMessage
      }
    `;
    it(`should return test message 'Hello World!'`, async (): Promise<void> => {
      expect.hasAssertions();
      const testClient = setupTestClient();
      const { data } = await testClient.query({ query });
      expect(normalizeGraphqlData(data)).toStrictEqual({
        testMessage: 'Hello World!',
      });
    });
    it('should mock message', async (): Promise<void> => {
      expect.hasAssertions();
      const mockClient = setupMockClient();
      const { data } = await mockClient.query({ query });
      expect(normalizeGraphqlData(data)).toStrictEqual({
        testMessage: MOCK_GRAPHQL_STRING,
      });
    });
  });

  describe('query: getPost', () => {
    const query = gql`
      query getPost($id: ID!) {
        getPost(id: $id) {
          content
          title
          publishedAt
          author {
            email
            firstName
          }
        }
      }
    `;
    it('should mock getPost', async (): Promise<void> => {
      expect.hasAssertions();
      const mockClient = setupMockClient();
      const expected = {
        content: MOCK_GRAPHQL_STRING,
        title: MOCK_GRAPHQL_STRING,
        publishedAt: MOCK_GRAPHQL_DATE_TIME,
        author: {
          email: MOCK_GRAPHQL_EMAIL,
          firstName: MOCK_GRAPHQL_STRING,
        },
      };
      const { data } = await mockClient.query({ query, variables: { id: 1 } });
      expect(normalizeGraphqlData(data)).toStrictEqual({ getPost: expected });
    });
  });

  describe('mutation: publishPost', () => {
    const mutation = gql`
      mutation publishPost($input: PublishPostInput!) {
        publishPost(input: $input) {
          content
          title
          publishedAt
          author {
            email
            firstName
          }
        }
      }
    `;
    it('should mock publishPost', async (): Promise<void> => {
      expect.hasAssertions();
      const mockClient = setupMockClient();
      const expected = {
        content: MOCK_GRAPHQL_STRING,
        title: MOCK_GRAPHQL_STRING,
        publishedAt: MOCK_GRAPHQL_DATE_TIME,
        author: {
          email: MOCK_GRAPHQL_EMAIL,
          firstName: MOCK_GRAPHQL_STRING,
        },
      };
      const { data } = await mockClient.mutate({
        mutation,
        variables: {
          input: {
            title: MOCK_GRAPHQL_STRING,
            content: MOCK_GRAPHQL_STRING,
          },
        },
      });
      expect(normalizeGraphqlData(data)).toStrictEqual({
        publishPost: expected,
      });
    });
  });

  describe('mutation: likePost', () => {
    const mutation = gql`
      mutation likePost($postId: ID!) {
        likePost(postId: $postId)
      }
    `;
    it('should mock likePost amount', async (): Promise<void> => {
      expect.hasAssertions();
      const mockClient = setupMockClient();
      const { data } = await mockClient.mutate({
        mutation,
        variables: { postId: 1 },
      });
      expect(normalizeGraphqlData(data)).toStrictEqual({
        likePost: MOCK_GRAPHQL_UNSIGNED_INT,
      });
    });
  });

  describe('mutation: followUser', () => {
    const mutation = gql`
      mutation followUser($userId: ID!) {
        followUser(userId: $userId)
      }
    `;
    it('should mock follower count after follow user', async (): Promise<
      void
    > => {
      expect.hasAssertions();
      const mockClient = setupMockClient();
      const { data } = await mockClient.mutate({
        mutation,
        variables: { userId: 1 },
      });
      expect(normalizeGraphqlData(data)).toStrictEqual({
        followUser: MOCK_GRAPHQL_UNSIGNED_INT,
      });
    });
  });

  describe('mutation: unFollowUser', () => {
    const mutation = gql`
      mutation unFollowUser($userId: ID!) {
        unFollowUser(userId: $userId)
      }
    `;
    it('should mock follower count after unFollow user', async (): Promise<
      void
    > => {
      expect.hasAssertions();
      const mockClient = setupMockClient();
      const { data } = await mockClient.mutate({
        mutation,
        variables: { userId: 1 },
      });
      expect(normalizeGraphqlData(data)).toStrictEqual({
        unFollowUser: MOCK_GRAPHQL_UNSIGNED_INT,
      });
    });
  });
});
