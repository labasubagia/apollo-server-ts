/* eslint-disable jest/no-hooks */
import { ObjectID } from 'mongodb';
import { postsDummy, usersDummy } from '../dummy';
import MongoDbProvider from '../provider';
import { randomIntWithLimit } from '../../utils/random';
import { UserDbObject } from '../../generated/codegen';
import { mongoUri } from '../../../globalConfig.json';

describe('mongodb: user', () => {
  const provider = new MongoDbProvider(mongoUri, 'integration_user');

  beforeAll(async () => {
    await provider.connectAsync();
  });

  afterAll(async () => {
    await provider.closeAsync();
  });

  afterEach(async () => {
    await provider.removeAllData();
  });

  describe('get single user', () => {
    it('should be able to get single user', async (): Promise<void> => {
      expect.hasAssertions();
      const userIndex = randomIntWithLimit(usersDummy.length);
      const dummyUser = usersDummy[userIndex];
      await provider.usersCollection.insertMany(usersDummy);
      const mockUser = await provider.usersAction.getSingleUser({
        userId: String(dummyUser._id),
      });
      expect(mockUser).toBeTruthy();
      expect(mockUser).toStrictEqual(dummyUser);
    });

    it('should be able to return null when no user found after get single user', async () => {
      expect.hasAssertions();
      await provider.usersCollection.insertMany(usersDummy);
      const user = await provider.usersAction.getSingleUser({
        userId: String(new ObjectID()),
      });
      expect(user).toBeFalsy();
      expect(user).toBeNull();
    });
  });

  describe(`user's posts`, () => {
    it('should be able to get user posts', async () => {
      expect.hasAssertions();
      await provider.usersCollection.insertMany(usersDummy);
      await provider.postsCollection.insertMany(postsDummy);
      const userIndex = randomIntWithLimit(usersDummy.length);
      const dummyUser = usersDummy[userIndex];
      const dummyUserPosts = postsDummy.filter((post) =>
        (post?.author as ObjectID).equals(dummyUser?._id as ObjectID)
      );
      const mockPosts = await provider.usersAction.getUserPosts(dummyUser);
      expect(mockPosts).toStrictEqual(dummyUserPosts);
    });
  });

  describe('follow', () => {
    it('should be able to follow user', async () => {
      expect.hasAssertions();
      await provider.usersCollection.insertMany(usersDummy);
      const userIndex = randomIntWithLimit(usersDummy.length);
      const dummyFollowing = usersDummy.filter(
        (_, index) => userIndex !== index
      );
      const dummyUser: UserDbObject = {
        ...usersDummy[userIndex],
        following: [],
      };

      const userFollowOperations = await Promise.all(
        dummyFollowing.map(async (user) =>
          provider.usersAction.followUser({
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

      const mockFollowing = await provider.usersAction.getUserFollowing(
        userAfterFollow
      );
      expect(mockFollowing).toStrictEqual(dummyFollowing);
    });

    it('should be able to unfollow user', async () => {
      expect.hasAssertions();
      const userIndex = randomIntWithLimit(usersDummy.length);
      const dummyFollowing = usersDummy.filter(
        (_, index) => userIndex !== index
      );
      const dummyUser: UserDbObject = {
        ...usersDummy[userIndex],
        following: dummyFollowing.map(({ _id }) => _id),
      };
      await provider.usersCollection.insertMany([...dummyFollowing, dummyUser]);

      const unfollowIndex = randomIntWithLimit(dummyFollowing.length);
      const dummyAfterUnfollow = dummyFollowing.filter(
        (_, index) => index !== unfollowIndex
      );
      const userAfterUnfollow = (await provider.usersAction.unFollowUser({
        followerId: String(dummyUser._id),
        followingId: String(dummyFollowing[unfollowIndex]._id),
      })) as UserDbObject;
      const mockFollowers = await provider.usersAction.getUserFollowing(
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
      await provider.usersCollection.insertMany([...others, dummyUser]);
      const followers = await provider.usersAction.getUserFollowing(dummyUser);
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

      await provider.usersCollection.insertMany([...dummyFollowers, dummyUser]);

      const mockFollowers = await provider.usersAction.getUserFollowers(
        dummyUser
      );
      expect(mockFollowers).toStrictEqual(dummyFollowers);
      expect(mockFollowers).toHaveLength(dummyFollowers.length);
    });
  });
});
