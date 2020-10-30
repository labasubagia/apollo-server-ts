/* eslint-disable jest/no-hooks */
import { ObjectID } from 'mongodb';
import { postsDummy, usersDummy } from '../dummy';
import { mongoDbMockProvider } from '../provider';
import { randomIntWithLimit } from '../../utils/random';
import { UserDbObject } from '../../codegen';

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

  it('should be able to get single user', async (): Promise<void> => {
    expect.hasAssertions();
    const userIndex = randomIntWithLimit(usersDummy.length);
    const dummyUser = usersDummy[userIndex];
    await mongoDbMockProvider.usersCollection.insertMany(usersDummy);
    const mockUser = await mongoDbMockProvider.usersAction.getSingleUser({
      userId: String(dummyUser._id),
    });
    expect(mockUser).toBeTruthy();
    expect(mockUser).toStrictEqual(dummyUser);
  });

  it('should be able to return null when no post found after get single user', async () => {
    expect.hasAssertions();
    await mongoDbMockProvider.usersCollection.insertMany(usersDummy);
    const user = await mongoDbMockProvider.usersAction.getSingleUser({
      userId: String(new ObjectID()),
    });
    expect(user).toBeFalsy();
    expect(user).toBeNull();
  });

  it('should be able to get user posts', async () => {
    expect.hasAssertions();
    await mongoDbMockProvider.usersCollection.insertMany(usersDummy);
    await mongoDbMockProvider.postsCollection.insertMany(postsDummy);
    const userIndex = randomIntWithLimit(usersDummy.length);
    const dummyUser = usersDummy[userIndex];
    const dummyUserPosts = postsDummy.filter((post) =>
      (post?.author as ObjectID).equals(dummyUser?._id as ObjectID)
    );
    const mockPosts = await mongoDbMockProvider.usersAction.getUserPosts(
      dummyUser
    );
    expect(mockPosts).toStrictEqual(dummyUserPosts);
  });

  it('should be able to follow user', async () => {
    expect.hasAssertions();
    await mongoDbMockProvider.usersCollection.insertMany(usersDummy);
    const userIndex = randomIntWithLimit(usersDummy.length);
    const dummyFollowing = usersDummy.filter((_, index) => userIndex !== index);
    const dummyUser: UserDbObject = { ...usersDummy[userIndex], following: [] };

    const userFollowOperations = await Promise.all(
      dummyFollowing.map(async (user) =>
        mongoDbMockProvider.usersAction.followUser({
          followerId: String(dummyUser._id),
          followingId: String(user._id),
        })
      )
    );
    const userAfterFollow = userFollowOperations.reduce(
      (prev, current) => ({
        ...(prev as UserDbObject),
        following: [
          ...((prev as UserDbObject).following || []),
          ...((current as UserDbObject).following || []),
        ],
      }),
      dummyUser
    ) as UserDbObject;

    const mockFollowing = await mongoDbMockProvider.usersAction.getUserFollowing(
      userAfterFollow
    );
    expect(mockFollowing).toStrictEqual(dummyFollowing);
  });

  it('should be able to unfollow user', async () => {
    expect.hasAssertions();
    const userIndex = randomIntWithLimit(usersDummy.length);
    const dummyFollowing = usersDummy.filter((_, index) => userIndex !== index);
    const dummyUser: UserDbObject = {
      ...usersDummy[userIndex],
      following: dummyFollowing.map(({ _id }) => _id),
    };
    await mongoDbMockProvider.usersCollection.insertMany([
      ...dummyFollowing,
      dummyUser,
    ]);

    const unfollowIndex = randomIntWithLimit(dummyFollowing.length);
    const dummyAfterUnfollow = dummyFollowing.filter(
      (_, index) => index !== unfollowIndex
    );
    const userAfterUnfollow = (await mongoDbMockProvider.usersAction.unFollowUser(
      {
        followerId: String(dummyUser._id),
        followingId: String(dummyFollowing[unfollowIndex]._id),
      }
    )) as UserDbObject;
    const mockFollowers = await mongoDbMockProvider.usersAction.getUserFollowing(
      userAfterUnfollow
    );
    expect(mockFollowers).toStrictEqual(dummyAfterUnfollow);
    expect(mockFollowers).toHaveLength(dummyAfterUnfollow.length);
  });

  it('should be able to get user following', async () => {
    expect.hasAssertions();
    const userIndex = randomIntWithLimit(usersDummy.length);
    const others = usersDummy.filter((_, index) => index !== userIndex);
    const dummyUser: UserDbObject = {
      ...usersDummy[userIndex],
      following: others.map(({ _id }) => _id),
    };
    await mongoDbMockProvider.usersCollection.insertMany([
      ...others,
      dummyUser,
    ]);
    const followers = await mongoDbMockProvider.usersAction.getUserFollowing(
      dummyUser
    );
    expect(followers).toStrictEqual(others);
    expect(followers).toHaveLength(others.length);
  });

  it('should be able to get user followers', async () => {
    expect.hasAssertions();
    const userIndex = randomIntWithLimit(usersDummy.length);
    const dummyUser = usersDummy[userIndex];

    const dummyFollowers = usersDummy
      .filter((_, index) => index !== userIndex)
      .map((user) => ({
        ...user,
        following: [dummyUser._id],
      }));

    await mongoDbMockProvider.usersCollection.insertMany([
      ...dummyFollowers,
      dummyUser,
    ]);

    const mockFollowers = await mongoDbMockProvider.usersAction.getUserFollowers(
      dummyUser
    );
    expect(mockFollowers).toStrictEqual(dummyFollowers);
    expect(mockFollowers).toHaveLength(dummyFollowers.length);
  });
});
