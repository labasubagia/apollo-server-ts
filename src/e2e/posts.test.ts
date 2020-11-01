/* eslint-disable jest/no-hooks */
import { ApolloServerTestClient } from 'apollo-server-testing';
import { ObjectId, ObjectID } from 'mongodb';
import { ClientMutation } from '../interfaces/ClientMutation';
import { ClientQuery } from '../interfaces/ClientQuery';
import { setupDefaultClient, setupMockClient } from './utils/setup-client';
import MongoDbProvider from '../mongo/provider';
import {
  MutationLikePostArgs,
  MutationPublishPostArgs,
  Post,
  PostDbObject,
  QueryGetPostArgs,
  QueryGetPostsArgs,
  UserDbObject,
} from '../generated/codegen';
import { MOCK_GRAPHQL_UNSIGNED_INT, MOCK_MONGO_POST_ID } from '../const/mocks';
import {
  MUTATION_LIKE_POST,
  MUTATION_PUBLISH_POST,
  QUERY_GET_PAGINATE_POST,
  QUERY_GET_POST,
} from './queries/posts';
import { postsDummy, usersDummy } from '../mongo/dummy';
import { randomIntWithLimit } from '../utils/random';
import { expectedPost } from './utils/mock-data';
import {
  PAGINATION_DEFAULT_SIZE,
  PAGINATION_SORT_ASC,
  PAGINATION_SORT_DESC,
} from '../const/pagination';
import { PaginationParams } from '../interfaces/PaginationParams';
import { getTotalPage } from '../utils/pagination';
import { mongoUri } from '../../globalConfig.json';
import { normalize } from '../utils/graphql';

describe('e2e post', (): void => {
  const provider = new MongoDbProvider(mongoUri, 'e2e_post');
  let mockClient: ApolloServerTestClient;
  let client: ApolloServerTestClient;

  beforeAll(async () => {
    await provider.connectAsync();
    client = setupDefaultClient(provider);
    mockClient = setupMockClient();
  });

  afterAll(async () => {
    await provider.closeAsync();
  });

  beforeEach(async () => {
    // Token of this user already set in apollo setup
    await provider.usersAction.insertMockAuthUser();
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
      const { data, errors } = await mockClient.query(query);
      const expected = [...Array(PAGINATION_DEFAULT_SIZE)].map(() => ({
        title: expectedPost?.content,
        content: expectedPost?.content,
        publishedAt: expectedPost?.publishedAt,
      }));
      expect(errors).toBeFalsy();
      expect(data?.posts).toBeTruthy();
      expect(data?.posts).toHaveLength(PAGINATION_DEFAULT_SIZE);
      expect(normalize(data)?.posts).toStrictEqual(expected);
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
          const { data, errors } = await client.query(query);
          expect(errors).toBeFalsy();
          expect(data?.posts).toBeTruthy();
          expect(data?.posts).toHaveLength(posts.length);
          expect(normalize(data)?.posts).toStrictEqual(posts);
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
      const { data, errors } = await mockClient.query(query);
      expect(errors).toBeFalsy();
      expect(data?.post).toBeTruthy();
      expect(normalize(data)?.post).toStrictEqual(expectedPost);
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
      const { data, errors } = await client.query(query);

      const expected: Post = {
        title: mockPost.title,
        content: mockPost.content,
        publishedAt: mockPost.publishedAt,
        author: {
          email: dummyAuthor.email,
          username: dummyAuthor.username,
        },
      };
      expect(errors).toBeFalsy();
      expect(data?.post).toBeTruthy();
      expect(normalize(data)?.post).toStrictEqual(expected);
    });

    it('[use mongo] should not be able to get post when post not found', async () => {
      expect.hasAssertions();
      const query: ClientQuery<QueryGetPostArgs> = {
        query: QUERY_GET_POST,
        variables: {
          id: String(new ObjectId()),
        },
      };
      const { data, errors } = await client.query(query);
      expect(data?.post).toBeFalsy();
      expect(data?.post).toBeNull();
      expect(errors).toBeFalsy();
    });
  });

  describe('mutation: publishPost', () => {
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

    it('[use apollo mock] should be able to publish a post', async () => {
      expect.hasAssertions();
      const mockMutation: ClientMutation<MutationPublishPostArgs> = {
        ...mutation,
        variables: {
          input: {
            title: expectedPost?.title as string,
            content: expectedPost?.content as string,
          },
        },
      };
      const { data, errors } = await mockClient.mutate(mockMutation);
      const expected: Post = {
        title: expectedPost.title,
        content: expectedPost.content,
      };
      expect(errors).toBeFalsy();
      expect(data?.post).toBeTruthy();
      expect(normalize(data)?.post).toStrictEqual(expected);
    });

    it('[use mongo] should be able to publish a post', async () => {
      expect.hasAssertions();
      const { data, errors } = await client.mutate(mutation);
      const expected: Post = {
        title: dummyPost?.title,
        content: dummyPost?.content,
      };
      expect(errors).toBeFalsy();
      expect(data?.post).toBeTruthy();
      expect(normalize(data)?.post).toStrictEqual(expected);
    });

    it('[use mongo] should not be able to publish post because user not found', async () => {
      expect.hasAssertions();
      await provider.usersAction.deleteMockAuthUser();
      const { data, errors } = await client.mutate(mutation);
      expect(data?.post).toBeFalsy();
      expect(errors).toBeTruthy();
      expect(errors?.[0]?.message).toStrictEqual('Please login');
    });
  });

  describe('mutation: likePost', () => {
    const index = randomIntWithLimit(postsDummy.length);
    const dummyPost = postsDummy[index];
    const dummyAuthor = usersDummy.find(({ _id }) =>
      _id?.equals(dummyPost?.author as ObjectID)
    ) as UserDbObject;
    let mockPost: PostDbObject;
    let mutation: ClientMutation<MutationLikePostArgs>;

    beforeEach(async () => {
      await provider.usersAction.insertUser(dummyAuthor);
      mockPost = (await provider.postsAction.insertPost(
        dummyPost
      )) as PostDbObject;
      mutation = {
        mutation: MUTATION_LIKE_POST,
        variables: {
          postId: String(mockPost?._id),
        },
      };
    });

    it('[use apollo mock] should mock likePost amount', async () => {
      expect.hasAssertions();
      const mutationMock: ClientMutation<MutationLikePostArgs> = {
        mutation: MUTATION_LIKE_POST,
        variables: {
          postId: MOCK_MONGO_POST_ID,
        },
      };
      const { data, errors } = await mockClient.mutate(mutationMock);
      expect(errors).toBeFalsy();
      expect(data?.post).toBeTruthy();
      expect(data?.post.likeCount).toStrictEqual(MOCK_GRAPHQL_UNSIGNED_INT);
    });

    it('[use mongo] should be able to like post', async () => {
      expect.hasAssertions();

      const { data, errors } = await client.mutate(mutation);
      const postAfterLiked = await provider.postsAction.getSinglePost(
        String(mockPost._id)
      );
      const loggedInUser = await provider.usersAction.getMockAuthUser();

      expect(errors).toBeFalsy();
      expect(data?.post).toBeTruthy();
      expect(data?.post?.likeCount).toStrictEqual(1);
      expect(postAfterLiked?.likedBy).toStrictEqual([loggedInUser?._id]);
    });

    it('[use mongo] should not be able like post when user not logged in', async () => {
      expect.hasAssertions();
      await provider.usersAction.deleteMockAuthUser();
      const { data, errors } = await client.mutate(mutation);
      expect(data?.post).toBeFalsy();
      expect(errors).toBeTruthy();
      expect(errors?.[0]?.message).toStrictEqual('Please login');
    });

    it('[use mongo] should not be able to like post when post not exist', async () => {
      expect.hasAssertions();
      await provider.postsCollection.deleteOne({ _id: mockPost?._id });
      const { data, errors } = await client.mutate(mutation);
      expect(data?.post).toBeFalsy();
      expect(errors).toBeTruthy();
      expect(errors?.[0]?.message).toStrictEqual('Post not found');
    });
  });
});
