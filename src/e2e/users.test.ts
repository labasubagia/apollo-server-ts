/* eslint-disable jest/no-hooks */
import { ApolloServerTestClient } from 'apollo-server-testing';
import { ClientMutation } from '../interfaces/ClientMutation';
import { normalize } from '../utils/graphql';
import { setupDefaultClient, setupMockClient } from './utils/setup-client';
import {
  FOLLOW_USER,
  LOGIN_USER,
  REGISTER_USER,
  UNFOLLOW_USER,
} from './queries/users';
import MongoDbProvider from '../mongo/provider';
import {
  MutationFollowUserArgs,
  MutationLoginArgs,
  MutationRegisterArgs,
  MutationUnFollowUserArgs,
  User,
  UserDbObject,
} from '../generated/codegen';
import { MOCK_GRAPHQL_STRING, MOCK_MONGO_USER_ID } from '../const/mocks';
import { expectedUserFollow } from './utils/mock-data';
import { usersDummy } from '../mongo/dummy';
import { randomIntWithLimit } from '../utils/random';
import { verifyJwtToken } from '../utils/auth';
import { mongoUri } from '../../globalConfig.json';

describe('e2e user', (): void => {
  const provider = new MongoDbProvider(mongoUri, 'e2e_user');
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

  describe('mutation register', () => {
    const index = randomIntWithLimit(usersDummy.length);
    const user: UserDbObject = usersDummy[index];
    const mutation: ClientMutation<MutationRegisterArgs> = {
      mutation: REGISTER_USER,
      variables: {
        input: {
          username: user.username as string,
          email: user.email as string,
          password: 'SECRET',
        },
      },
    };

    it('[use apollo mock] should be able to register user', async () => {
      expect.hasAssertions();
      const { data, errors } = await mockClient.mutate(mutation);
      expect(errors).toBeFalsy();
      expect(data?.token).toStrictEqual(MOCK_GRAPHQL_STRING);
    });

    it('[use mongo] should be able to register user', async () => {
      expect.hasAssertions();
      const { data, errors } = await client.mutate(mutation);
      const decoded = verifyJwtToken(data?.token) as User;
      const actual: User = {
        username: decoded.username,
        email: decoded.email,
      };
      const expected: User = {
        username: user.username,
        email: user.email,
      };
      expect(errors).toBeFalsy();
      expect(actual).toStrictEqual(expected);
    });

    it('[use mongo] should not be able to register when username already taken', async () => {
      expect.hasAssertions();
      await client.mutate(mutation);
      const { errors } = await client.mutate(mutation);
      expect(errors).toBeTruthy();
      expect(errors?.[0]?.message).toStrictEqual('Username already taken');
    });
  });

  describe('mutation login', () => {
    const index = randomIntWithLimit(usersDummy.length);
    const user = usersDummy[index];
    const password = 'SECRET';
    const wrongPassword = 'WRONG_PASSWORD';
    const mutation: ClientMutation<MutationLoginArgs> = {
      mutation: LOGIN_USER,
      variables: {
        input: {
          username: user?.username as string,
          password,
        },
      },
    };

    beforeEach(async () => {
      const mutationRegister: ClientMutation<MutationRegisterArgs> = {
        mutation: REGISTER_USER,
        variables: {
          input: {
            username: user.username as string,
            email: user.email as string,
            password,
          },
        },
      };
      await client.mutate(mutationRegister);
    });

    it('[use apollo mock] should be able to login user', async () => {
      expect.hasAssertions();
      const { data, errors } = await mockClient.mutate(mutation);
      expect(errors).toBeFalsy();
      expect(data?.token).toStrictEqual(MOCK_GRAPHQL_STRING);
    });

    it('[use mongo] should be able to login user', async () => {
      expect.hasAssertions();
      const { data, errors } = await client.mutate(mutation);
      const decoded = verifyJwtToken(data?.token) as User;
      const actual: User = {
        username: decoded.username,
        email: decoded.email,
      };
      const expected: User = {
        username: user.username,
        email: user.email,
      };
      expect(errors).toBeFalsy();
      expect(actual).toStrictEqual(expected);
    });

    it('[use mongo] should not be able to login when user not found', async () => {
      expect.hasAssertions();
      await provider.usersCollection.deleteMany({ username: user.username });
      mutation.variables.input.password = wrongPassword;
      const { errors } = await client.mutate(mutation);
      expect(errors).toBeTruthy();
      expect(errors?.[0]?.message).toStrictEqual('User not found');
    });

    it('[use mongo] should not be able to login when password false', async () => {
      expect.hasAssertions();
      mutation.variables.input.password = wrongPassword;
      const { errors } = await client.mutate(mutation);
      expect(errors).toBeTruthy();
      expect(errors?.[0]?.message).toStrictEqual('Credentials not match');
    });
  });

  describe('mutation followUser', () => {
    const followIndex = randomIntWithLimit(usersDummy.length);
    const followUser = usersDummy[followIndex];
    const mutation: ClientMutation<MutationFollowUserArgs> = {
      mutation: FOLLOW_USER,
      variables: {
        userId: String(followUser._id),
      },
    };

    beforeEach(async () => {
      await provider.usersAction.insertUser(followUser);
    });

    it('[use apollo mock] should mock follower count after follow user', async () => {
      expect.hasAssertions();
      const mockMutation: ClientMutation<MutationFollowUserArgs> = {
        mutation: FOLLOW_USER,
        variables: {
          userId: MOCK_MONGO_USER_ID,
        },
      };
      const { data, errors } = await mockClient.mutate(mockMutation);
      expect(errors).toBeFalsy();
      expect(normalize(data)).toStrictEqual({ user: expectedUserFollow });
    });

    it('[use mongo] should be able to follow user', async () => {
      expect.hasAssertions();
      const { data, errors } = await client.mutate(mutation);
      const user = await provider.usersAction.getMockAuthUser();
      const following = await provider.usersAction.getUserFollowing(
        user as UserDbObject
      );
      expect(errors).toBeFalsy();
      expect(data?.user).toBeTruthy();
      expect(data?.user?.followingCount).toStrictEqual(1);
      expect(user?.following).toStrictEqual([followUser._id]);
      expect(following).toStrictEqual([followUser]);
    });

    it('[use mongo] should not be able to follow user when not authenticated', async () => {
      expect.hasAssertions();
      await provider.usersAction.deleteMockAuthUser();
      const { data, errors } = await client.mutate(mutation);
      expect(data?.user).toBeNull();
      expect(errors).toBeTruthy();
      expect(errors?.[0]?.message).toStrictEqual('Please login');
    });
  });

  describe('mutation unFollowUser', () => {
    const unfollowIndex = randomIntWithLimit(usersDummy.length);
    const unfollowUser = usersDummy[unfollowIndex];
    const followingIds = usersDummy.map(({ _id }) => _id);
    const followingUsers = usersDummy.filter(
      (_, index) => index !== unfollowIndex
    );
    const expectedIds = followingUsers.map(({ _id }) => _id);
    const mutation: ClientMutation<MutationUnFollowUserArgs> = {
      mutation: UNFOLLOW_USER,
      variables: {
        userId: String(unfollowUser._id),
      },
    };

    beforeEach(async () => {
      await provider.usersCollection.insertMany(usersDummy);
      const loggedUser = await provider.usersAction.getMockAuthUser();
      await provider.usersCollection.updateOne(
        { _id: loggedUser?._id },
        {
          $set: {
            following: followingIds,
          },
        }
      );
    });

    it('[use apollo mock] should mock follower count after unFollow user', async () => {
      expect.hasAssertions();
      const mockMutation: ClientMutation<MutationUnFollowUserArgs> = {
        mutation: UNFOLLOW_USER,
        variables: {
          userId: MOCK_MONGO_USER_ID,
        },
      };
      const { data, errors } = await mockClient.mutate(mockMutation);
      expect(errors).toBeFalsy();
      expect(normalize(data)).toStrictEqual({ user: expectedUserFollow });
    });

    it('[use mongo] should be able to unfollow user', async () => {
      expect.hasAssertions();
      const { data, errors } = await client.mutate(mutation);
      const loggedUser = await provider.usersAction.getMockAuthUser();
      const following = await provider.usersAction.getUserFollowing(
        loggedUser as UserDbObject
      );
      expect(errors).toBeFalsy();
      expect(data?.user).toBeTruthy();
      expect(data?.user?.followingCount).toStrictEqual(expectedIds.length);
      expect(loggedUser?.following).toStrictEqual(expectedIds);
      expect(following).toStrictEqual(followingUsers);
    });

    it('[use mongo] should not be able to unfollow user when not authenticated', async () => {
      expect.hasAssertions();
      await provider.usersAction.deleteMockAuthUser();
      const { data, errors } = await client.mutate(mutation);
      expect(data?.user).toBeNull();
      expect(errors).toBeTruthy();
      expect(errors?.[0]?.message).toStrictEqual('Please login');
    });
  });
});
