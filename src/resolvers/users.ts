import { ObjectID } from 'mongodb';
import { MOCK_MONGO_USER_ID } from '../const/mocks';
import {
  MutationFollowUserArgs,
  MutationUnFollowUserArgs,
  QueryGetUserArgs,
  UserDbObject,
} from '../codegen';
import {
  followUser,
  getSingleUser,
  getUserFollowers,
  getUserFollowing,
  getUserPosts,
  unFollowUser,
} from '../mongo/actions/users';

export default {
  Query: {
    getUser: async (_: unknown, { id }: QueryGetUserArgs) =>
      getSingleUser({ userId: id }),
  },

  Mutation: {
    followUser: async (_: unknown, { userId }: MutationFollowUserArgs) => {
      try {
        return followUser({
          followerId: MOCK_MONGO_USER_ID,
          followingId: userId,
        });
      } catch (error) {
        console.error({ error });
        return null;
      }
    },

    unFollowUser: async (_: unknown, { userId }: MutationUnFollowUserArgs) => {
      try {
        return unFollowUser({
          followerId: MOCK_MONGO_USER_ID,
          followingId: userId,
        });
      } catch (error) {
        console.error({ error });
        return null;
      }
    },
  },

  User: {
    id: (obj: UserDbObject): ObjectID => obj._id,
    posts: async (obj: UserDbObject) => getUserPosts(obj),
    postCount: async (obj: UserDbObject): Promise<number> => {
      const posts = await getUserPosts(obj);
      return posts.length || 0;
    },
    following: async (obj: UserDbObject) => getUserFollowing(obj),
    followingCount: (obj: UserDbObject): number => obj.following?.length || 0,
    followers: async (obj: UserDbObject) => getUserFollowers(obj),
    followerCount: async (obj: UserDbObject): Promise<number> => {
      const posts = await getUserFollowers(obj);
      return posts.length || 0;
    },
  },
};
