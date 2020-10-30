import { ObjectID } from 'mongodb';
import { MOCK_MONGO_USER_ID } from '../const/mocks';
import {
  MutationFollowUserArgs,
  MutationUnFollowUserArgs,
  QueryGetUserArgs,
  UserDbObject,
} from '../generated/codegen';
import { MongoDbProvider } from '../mongo/provider';

const usersResolver = (provider: MongoDbProvider) => ({
  Query: {
    getUser: async (_: unknown, { id }: QueryGetUserArgs) =>
      provider.usersAction.getSingleUser({ userId: id }),
  },

  Mutation: {
    followUser: async (_: unknown, { userId }: MutationFollowUserArgs) => {
      try {
        return provider.usersAction.followUser({
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
        return provider.usersAction.unFollowUser({
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
    id: (obj: UserDbObject): ObjectID => obj?._id as ObjectID,
    posts: async (obj: UserDbObject) => provider.usersAction.getUserPosts(obj),
    postCount: async (obj: UserDbObject): Promise<number> => {
      const posts = await provider.usersAction.getUserPosts(obj);
      return posts.length || 0;
    },
    following: async (obj: UserDbObject) =>
      provider.usersAction.getUserFollowing(obj),
    followingCount: (obj: UserDbObject): number => obj.following?.length || 0,
    followers: async (obj: UserDbObject) =>
      provider.usersAction.getUserFollowers(obj),
    followerCount: async (obj: UserDbObject): Promise<number> => {
      const posts = await provider.usersAction.getUserFollowers(obj);
      return posts.length || 0;
    },
  },
});

export default usersResolver;
