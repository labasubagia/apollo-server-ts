/* eslint-disable jest/no-hooks */
import { ObjectID } from 'mongodb';
import { postsDummy, usersDummy } from '../dummy';
import { PAGINATION_SORT_ASC } from '../../const/pagination';
import { mongoDbMockProvider } from '../provider';
import { PostDbObject, UserDbObject } from '../../codegen';
import { randomIntWithLimit } from '../../utils/random';

describe('mongodb: posts', () => {
  beforeAll(async () => {
    await mongoDbMockProvider.connectAsync();
  });

  afterAll(async () => {
    await mongoDbMockProvider.closeAsync();
  });

  afterEach(async () => {
    await mongoDbMockProvider.removeAllData();
  });

  it('should publish post', async (): Promise<void> => {
    expect.hasAssertions();
    await mongoDbMockProvider.usersCollection.insertMany(usersDummy);
    const postIndex = randomIntWithLimit(postsDummy.length);
    const inserted = await mongoDbMockProvider.postsAction.insertPost(
      postsDummy[postIndex]
    );
    expect(inserted).toStrictEqual(postsDummy[postIndex]);
  });

  it('should be able to get paginate post', async (): Promise<void> => {
    expect.hasAssertions();
    await mongoDbMockProvider.usersCollection.insertMany(usersDummy);
    await mongoDbMockProvider.postsCollection.insertMany(postsDummy);
    const firstPage = await mongoDbMockProvider.postsAction.getAllPostPaginate({
      first: 1,
      order: PAGINATION_SORT_ASC,
    });
    const secondPage = await mongoDbMockProvider.postsAction.getAllPostPaginate(
      {
        first: 1,
        page: 2,
        order: PAGINATION_SORT_ASC,
      }
    );
    expect(firstPage).toStrictEqual([postsDummy[0]]);
    expect(secondPage).toStrictEqual([postsDummy[1]]);
  });

  it('should be able to get single post', async (): Promise<void> => {
    expect.hasAssertions();
    await mongoDbMockProvider.usersCollection.insertMany(usersDummy);
    await mongoDbMockProvider.postsCollection.insertMany(postsDummy);
    const postIndex = randomIntWithLimit(postsDummy.length);
    const post = await mongoDbMockProvider.postsAction.getSinglePost(
      String({ ...postsDummy[postIndex] }._id)
    );
    expect(post).toStrictEqual(postsDummy[postIndex]);
  });

  it('should be able to return null when no post found after get single post', async () => {
    expect.hasAssertions();
    await mongoDbMockProvider.usersCollection.insertMany(usersDummy);
    await mongoDbMockProvider.postsCollection.insertMany(postsDummy);
    const post = await mongoDbMockProvider.postsAction.getSinglePost(
      String(new ObjectID())
    );
    expect(post).toBeFalsy();
    expect(post).toBeNull();
  });

  it('should be able to like post', async () => {
    expect.hasAssertions();
    const userIndex = randomIntWithLimit(usersDummy.length);
    const postIndex = randomIntWithLimit(postsDummy.length);
    await mongoDbMockProvider.usersCollection.insertMany(usersDummy);
    const post = await mongoDbMockProvider.postsAction.insertPost(
      postsDummy[postIndex]
    );
    const postAfterLike = await mongoDbMockProvider.postsAction.likePost({
      userId: String(usersDummy[userIndex]._id),
      postId: String(post?._id),
    });
    expect(postAfterLike?.likedBy).toStrictEqual([usersDummy[userIndex]._id]);
  });

  it('should be able to unlike post', async () => {
    expect.hasAssertions();
    const postIndex = randomIntWithLimit(postsDummy.length);
    const userIndex = randomIntWithLimit(usersDummy.length);
    await mongoDbMockProvider.usersCollection.insertMany(usersDummy);
    const post = await mongoDbMockProvider.postsAction.insertPost({
      ...postsDummy[postIndex],
      likedBy: usersDummy.map(({ _id }) => _id),
    });
    const postAfterLike = await mongoDbMockProvider.postsAction.likePost({
      userId: String(usersDummy[userIndex]._id),
      postId: String(post?._id),
    });
    const expected = usersDummy
      .filter((_, index) => index !== userIndex)
      .map((user) => user._id);
    expect(postAfterLike?.likedBy).toStrictEqual(expected);
  });

  it('should be able to find user who like the post', async () => {
    expect.hasAssertions();
    await mongoDbMockProvider.usersCollection.insertMany(usersDummy);
    const postIndex = randomIntWithLimit(postsDummy.length);
    const post = (await mongoDbMockProvider.postsAction.insertPost({
      ...postsDummy[postIndex],
      likedBy: [],
    })) as PostDbObject;

    const users = usersDummy
      .slice(randomIntWithLimit(usersDummy.length))
      .filter((user) => !user._id.equals(post.author));
    const userIds = users.map(({ _id }) => _id);

    const likeActions = await Promise.all(
      users.map((user) =>
        mongoDbMockProvider.postsAction.likePost({
          userId: String(user._id),
          postId: String(post._id),
        })
      )
    );
    const postAfterLike = likeActions.reduce((prev, current) => {
      return {
        ...((prev as PostDbObject) || {}),
        likedBy: [
          ...((prev as PostDbObject).likedBy || []),
          ...((current as PostDbObject).likedBy || []),
        ],
      };
    }, post) as PostDbObject;
    const likeUsers = await mongoDbMockProvider.postsAction.findLikeUsers(
      postAfterLike
    );
    expect(postAfterLike.likedBy).toStrictEqual(userIds);
    expect(likeUsers).toStrictEqual(users);
  });

  it('should be able to find author of a post', async () => {
    expect.hasAssertions();
    await mongoDbMockProvider.usersCollection.insertMany(usersDummy);
    const postIndex = randomIntWithLimit(postsDummy.length);
    const post = (await mongoDbMockProvider.postsAction.insertPost(
      postsDummy[postIndex]
    )) as PostDbObject;
    const mockAuthor = await mongoDbMockProvider.postsAction.findAuthor(post);
    const dummyAuthor = usersDummy.find(({ _id }) => _id.equals(post.author));
    expect(post.author.equals((dummyAuthor as UserDbObject)._id)).toBeTruthy();
    expect(mockAuthor).toStrictEqual(dummyAuthor);
  });
});
