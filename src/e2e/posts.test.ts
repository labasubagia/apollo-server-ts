/* eslint-disable jest/no-hooks */
import { ApolloServerTestClient } from 'apollo-server-testing';
import { ObjectID } from 'mongodb';
import { ClientMutation } from '../interfaces/ClientMutation';
import { ClientQuery } from '../interfaces/ClientQuery';
import { normalize } from '../utils/graphql';
import { setupDefaultClient, setupMockClient } from './setup-client';
import { mongoDbMockProvider } from '../mongo/provider';
import {
  MutationLikePostArgs,
  MutationPublishPostArgs,
  Post,
  PostDbObject,
  QueryGetPostArgs,
  UserDbObject,
} from '../generated/codegen';
import {
  MOCK_GRAPHQL_DATE_TIME,
  MOCK_GRAPHQL_EMAIL,
  MOCK_GRAPHQL_STRING,
  MOCK_GRAPHQL_UNSIGNED_INT,
  MOCK_MONGO_POST_ID,
} from '../const/mocks';
import {
  MUTATION_LIKE_POST,
  MUTATION_PUBLISH_POST,
  QUERY_GET_POST,
} from './queries/posts';
import { postsDummy, usersDummy } from '../mongo/dummy';
import { randomIntWithLimit } from '../utils/random';

describe('e2e mock server', (): void => {
  let mockClient: ApolloServerTestClient;
  let client: ApolloServerTestClient;

  beforeAll(async () => {
    await mongoDbMockProvider.connectAsync();
    mockClient = setupMockClient(mongoDbMockProvider);
    client = setupDefaultClient(mongoDbMockProvider);
  });

  afterAll(async () => {
    await mongoDbMockProvider.closeAsync();
  });

  afterEach(async () => {
    await mongoDbMockProvider.removeAllData();
  });

  describe('query getPost', () => {
    it('[use apollo mock] should be able get post', async () => {
      expect.hasAssertions();
      const expected: Post = {
        content: MOCK_GRAPHQL_STRING,
        title: MOCK_GRAPHQL_STRING,
        publishedAt: MOCK_GRAPHQL_DATE_TIME,
        author: {
          email: MOCK_GRAPHQL_EMAIL,
          firstName: MOCK_GRAPHQL_STRING,
        },
      };
      const query: ClientQuery<QueryGetPostArgs> = {
        query: QUERY_GET_POST,
        variables: {
          id: MOCK_MONGO_POST_ID,
        },
      };
      const { data } = await mockClient.query(query);
      expect(normalize(data)).toStrictEqual({ post: expected });
    });

    it('[user mongo] should be able get post', async () => {
      expect.hasAssertions();
      const postIndex = randomIntWithLimit(postsDummy.length);
      const dummyPost = postsDummy[postIndex] as PostDbObject;
      const dummyAuthor = usersDummy.find(({ _id }) =>
        (_id as ObjectID).equals(dummyPost?.author as ObjectID)
      ) as UserDbObject;

      await mongoDbMockProvider.usersCollection.insertOne(dummyAuthor);
      const mockPost = (await mongoDbMockProvider.postsAction.insertPost(
        dummyPost
      )) as PostDbObject;

      const query: ClientQuery<QueryGetPostArgs> = {
        query: QUERY_GET_POST,
        variables: {
          id: String(mockPost._id),
        },
      };
      const { data } = await client.query(query);

      const expected: Post = {
        title: mockPost.title,
        content: mockPost.content,
        publishedAt: mockPost.publishedAt,
        author: {
          email: dummyAuthor.email,
          firstName: dummyAuthor.firstName,
        },
      };
      expect(normalize(data)).toStrictEqual({ post: expected });
    });
  });

  describe('mutation: publishPost', () => {
    it('should mock publishPost', async (): Promise<void> => {
      expect.hasAssertions();
      const expected = {
        content: MOCK_GRAPHQL_STRING,
        title: MOCK_GRAPHQL_STRING,
        publishedAt: MOCK_GRAPHQL_DATE_TIME,
        author: {
          email: MOCK_GRAPHQL_EMAIL,
          firstName: MOCK_GRAPHQL_STRING,
        },
      };
      const mutation: ClientMutation<MutationPublishPostArgs> = {
        mutation: MUTATION_PUBLISH_POST,
        variables: {
          input: {
            title: MOCK_GRAPHQL_STRING,
            content: MOCK_GRAPHQL_STRING,
          },
        },
      };
      const { data } = await mockClient.mutate(mutation);
      expect(normalize(data)).toStrictEqual({
        post: expected,
      });
    });
  });

  describe('mutation: likePost', () => {
    it('should mock likePost amount', async (): Promise<void> => {
      expect.hasAssertions();
      const mutation: ClientMutation<MutationLikePostArgs> = {
        mutation: MUTATION_LIKE_POST,
        variables: {
          postId: MOCK_MONGO_POST_ID,
        },
      };
      const { data } = await mockClient.mutate(mutation);
      expect(normalize(data)).toStrictEqual({
        post: {
          likeCount: MOCK_GRAPHQL_UNSIGNED_INT,
        },
      });
    });
  });
});
