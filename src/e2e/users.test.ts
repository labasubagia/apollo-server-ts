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
import { mongoDbMockProvider, MongoDbProvider } from '../mongo/provider';
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

describe('e2e user', (): void => {
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
    it('[use apollo mock] should mock follower count after follow user', async () => {
      expect.hasAssertions();
      const mutation: ClientMutation<MutationFollowUserArgs> = {
        mutation: FOLLOW_USER,
        variables: {
          userId: MOCK_MONGO_USER_ID,
        },
      };
      const { data, errors } = await mockClient.mutate(mutation);
      expect(errors).toBeFalsy();
      expect(normalize(data)).toStrictEqual({ user: expectedUserFollow });
    });

    // TODO: add db mock (mongo) test
  });

  describe('mutation unFollowUser', () => {
    it('[use apollo mock] should mock follower count after unFollow user', async () => {
      expect.hasAssertions();
      const mutation: ClientMutation<MutationUnFollowUserArgs> = {
        mutation: UNFOLLOW_USER,
        variables: {
          userId: MOCK_MONGO_USER_ID,
        },
      };
      const { data, errors } = await mockClient.mutate(mutation);
      expect(errors).toBeFalsy();
      expect(normalize(data)).toStrictEqual({ user: expectedUserFollow });
    });
  });

  // TODO: add db mock (mongo) test
});
