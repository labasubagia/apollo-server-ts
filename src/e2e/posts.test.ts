/* eslint-disable jest/no-hooks */
import { ApolloServerTestClient } from 'apollo-server-testing';
import { ObjectID } from 'mongodb';
import { ClientMutation } from '../interfaces/ClientMutation';
import { ClientQuery } from '../interfaces/ClientQuery';
import { normalize } from '../utils/graphql';
import { setupDefaultClient, setupMockClient } from './setup-client';
import { mongoDbMockProvider, MongoDbProvider } from '../mongo/provider';
import {
  MutationLikePostArgs,
  MutationPublishPostArgs,
  Post,
  PostDbObject,
  QueryGetPostArgs,
  QueryGetPostsArgs,
  UserDbObject,
} from '../generated/codegen';
import {
  MOCK_GRAPHQL_STRING,
  MOCK_GRAPHQL_UNSIGNED_INT,
  MOCK_MONGO_POST_ID,
} from '../const/mocks';
import {
  MUTATION_LIKE_POST,
  MUTATION_PUBLISH_POST,
  QUERY_GET_PAGINATE_POST,
  QUERY_GET_POST,
} from './queries/posts';
import { postsDummy, usersDummy } from '../mongo/dummy';
import { randomIntWithLimit } from '../utils/random';
import { expectedPost } from './mock-data';
import {
  PAGINATION_DEFAULT_SIZE,
  PAGINATION_SORT_ASC,
  PAGINATION_SORT_DESC,
} from '../const/pagination';
import { PaginationParams } from '../interfaces/PaginationParams';
import { getTotalPage } from '../utils/pagination';

describe('e2e mock server', (): void => {
  const provider: MongoDbProvider = mongoDbMockProvider;
  let mockClient: ApolloServerTestClient;
  let client: ApolloServerTestClient;

  beforeAll(async () => {
    await provider.connectAsync();
    mockClient = setupMockClient(provider);
    client = setupDefaultClient(provider);
  });

  afterAll(async () => {
    await provider.closeAsync();
  });

  afterEach(async () => {
    await provider.removeAllData();
  });

  describe('query getPosts', () => {
    it('[user apollo mock] should be able to get posts', async () => {
      expect.hasAssertions();
      const query: ClientQuery<QueryGetPostsArgs> = {
        query: QUERY_GET_PAGINATE_POST,
        variables: { first: PAGINATION_DEFAULT_SIZE },
      };
      const { data } = await mockClient.query(query);
      const expected = [...Array(PAGINATION_DEFAULT_SIZE)].map(() => ({
        title: expectedPost?.content,
        content: expectedPost?.content,
        publishedAt: expectedPost?.publishedAt,
      }));
      expect(normalize(data)).toStrictEqual({ posts: expected });
    });

    it('[use mongo] should be able to get posts', async () => {
      expect.hasAssertions();

      const itemTotal = postsDummy.length;
      let pageSize: number = randomIntWithLimit(itemTotal);
      pageSize = pageSize > 0 ? pageSize : 1;
      const totalPage = getTotalPage({ itemTotal, pageSize });

      await provider.usersCollection.insertMany(usersDummy);
      await provider.postsCollection.insertMany(postsDummy);

      await Promise.all(
        [...Array(totalPage)].map(async (_, index) => {
          const orders = [PAGINATION_SORT_ASC, PAGINATION_SORT_DESC];
          const query: ClientQuery<QueryGetPostsArgs> = {
            query: QUERY_GET_PAGINATE_POST,
            variables: {
              first: pageSize,
              page: index + 1,
              order: orders[randomIntWithLimit(orders.length)],
            },
          };
          const posts: Post[] = (
            await provider.postsAction.getAllPostPaginate(
              query.variables as PaginationParams
            )
          ).map(({ title, content, publishedAt }) => ({
            title,
            content,
            publishedAt,
          }));
          const { data } = await client.query(query);
          expect(normalize(data)).toStrictEqual({ posts });
        })
      );
    });
  });

  describe('query getPost', () => {
    it('[use apollo mock] should be able get post', async () => {
      expect.hasAssertions();
      const query: ClientQuery<QueryGetPostArgs> = {
        query: QUERY_GET_POST,
        variables: {
          id: MOCK_MONGO_POST_ID,
        },
      };
      const { data } = await mockClient.query(query);
      expect(normalize(data)).toStrictEqual({ post: expectedPost });
    });

    it('[use mongo] should be able get post', async () => {
      expect.hasAssertions();
      const postIndex = randomIntWithLimit(postsDummy.length);
      const dummyPost = postsDummy[postIndex] as PostDbObject;
      const dummyAuthor = usersDummy.find(({ _id }) =>
        (_id as ObjectID).equals(dummyPost?.author as ObjectID)
      ) as UserDbObject;

      await provider.usersCollection.insertOne(dummyAuthor);
      const mockPost = (await provider.postsAction.insertPost(
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
    it('[use apollo mock] should mock publish a post', async (): Promise<
      void
    > => {
      expect.hasAssertions();
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
      const expected = {
        title: expectedPost.title,
        content: expectedPost.content,
      };
      expect(normalize(data)).toStrictEqual({ post: expected });
    });

    it('[use mongo] should mock publish a post', async () => {
      // TODO: add user authentication
      expect.hasAssertions();
      await provider.usersCollection.insertMany(usersDummy);
      const postIndex = randomIntWithLimit(postsDummy.length);
      const dummyPost = postsDummy[postIndex];
      const mutation: ClientMutation<MutationPublishPostArgs> = {
        mutation: MUTATION_PUBLISH_POST,
        variables: {
          input: {
            title: dummyPost?.title as string,
            content: dummyPost?.content as string,
          },
        },
      };
      const { data } = await client.mutate(mutation);
      const expected = {
        title: dummyPost?.title,
        content: dummyPost?.content,
      };
      expect(normalize(data)).toStrictEqual({ post: expected });
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
