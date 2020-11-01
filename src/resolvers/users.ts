import { AuthenticationError, ValidationError } from 'apollo-server';
import bcrypt from 'bcrypt';
import { ObjectID } from 'mongodb';
import {
  MutationFollowUserArgs,
  MutationLoginArgs,
  MutationRegisterArgs,
  MutationUnFollowUserArgs,
  QueryGetUserArgs,
  UserDbObject,
} from '../generated/codegen';
import { TokenPayload } from '../interfaces/TokenPayload';
import MongoDbProvider from '../mongo/provider';
import { signJwtToken } from '../utils/auth';

const usersResolver = (provider: MongoDbProvider) => ({
  Query: {
    getUser: async (_: unknown, { id }: QueryGetUserArgs) =>
      provider.usersAction.getSingleUser({ userId: id }),
  },

  Mutation: {
    register: async (
      _: unknown,
      args: MutationRegisterArgs
    ): Promise<string | null> => {
      const exist: UserDbObject | null = await provider.usersCollection.findOne(
        { username: args.input.username }
      );
      if (exist) throw new ValidationError('Username already taken');

      const user = await provider.usersAction.insertUser({
        ...args.input,
        password: await bcrypt.hash(args.input.password, 12),
      });
      if (!user) throw new AuthenticationError('Registration failed');

      const jwtObj: TokenPayload = {
        id: String(user._id),
        username: user.username as string,
        email: user.email as string,
      };
      return signJwtToken(jwtObj);
    },

    login: async (
      _: unknown,
      args: MutationLoginArgs
    ): Promise<string | null> => {
      const user:
        | (UserDbObject & { password?: string })
        | null = await provider.usersCollection.findOne({
        username: args.input.username,
      });
      if (!user) throw new ValidationError('User not found');

      const isPasswordMatch = await bcrypt.compare(
        args.input.password,
        user?.password as string
      );
      if (!isPasswordMatch)
        throw new AuthenticationError('Credentials not match');

      const jwtObj: TokenPayload = {
        id: String(user._id),
        username: user.username as string,
        email: user.email as string,
      };
      return signJwtToken(jwtObj);
    },

    followUser: async (
      _: unknown,
      { userId }: MutationFollowUserArgs,
      { user }: { user: UserDbObject }
    ) => {
      if (!user) throw new AuthenticationError('Please login');
      return provider.usersAction.followUser({
        followerId: String(user?._id),
        followingId: userId,
      });
    },

    unFollowUser: async (
      _: unknown,
      { userId }: MutationUnFollowUserArgs,
      { user }: { user: UserDbObject }
    ) => {
      if (!user) throw new AuthenticationError('Please login');
      return provider.usersAction.unFollowUser({
        followerId: String(user?._id),
        followingId: userId,
      });
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
