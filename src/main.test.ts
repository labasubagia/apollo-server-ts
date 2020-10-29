import { ApolloServer, Config, gql } from 'apollo-server';
import {
  ApolloServerTestClient,
  createTestClient,
} from 'apollo-server-testing';
import { DIRECTIVES } from '@graphql-codegen/typescript-mongodb';

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

const setupMockClient = (): ApolloServerTestClient => {
  return setupClient({
    typeDefs: [DIRECTIVES, typeDefs],
    resolvers,
    mocks,
    mockEntireSchema: true,
  });
};

const normalizeGraphqlData = <T>(data: T): T => {
  return JSON.parse(JSON.stringify({ ...data }));
};

describe('main', (): void => {
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
        likePost(postId: $postId) {
          likeCount
        }
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
        likePost: {
          likeCount: MOCK_GRAPHQL_UNSIGNED_INT,
        },
      });
    });
  });

  describe('mutation: followUser', () => {
    const mutation = gql`
      mutation followUser($userId: ID!) {
        followUser(userId: $userId) {
          followingCount
        }
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
        followUser: {
          followingCount: MOCK_GRAPHQL_UNSIGNED_INT,
        },
      });
    });
  });

  describe('mutation: unFollowUser', () => {
    const mutation = gql`
      mutation unFollowUser($userId: ID!) {
        unFollowUser(userId: $userId) {
          followingCount
        }
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
        unFollowUser: {
          followingCount: MOCK_GRAPHQL_UNSIGNED_INT,
        },
      });
    });
  });
});
