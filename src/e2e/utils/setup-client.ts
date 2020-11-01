import { DIRECTIVES } from '@graphql-codegen/typescript-mongodb';
import { ApolloServer } from 'apollo-server';
import { createTestClient } from 'apollo-server-testing';
import resolvers from '../../resolvers';
import typeDefs from '../../type-defs';
import mocks from '../../mocks';
import MongoDbProvider from '../../mongo/provider';
import { loginMockUserForAuth } from '../../mongo/dummy';

export const setupDefaultClient = (provider: MongoDbProvider) =>
  createTestClient(
    new ApolloServer({
      typeDefs: [DIRECTIVES, typeDefs],
      resolvers: resolvers(provider),
      context: ({ req }) => {
        /*
        ! NOTE: insert the auth user in beforeEach
        ! Reason: to make sure owner of token exist
        - Need to run insertMockAuthUser() in each e2e file
          Run in beforeEach() hook
          Because database reset in afterEach() hook
        - This is for authentication purpose

        ? Other way
        - Apparently createTestClient doesn't support sending http header yet
          So need to do it in manual way

        * Hope for better way
        */
        const token = loginMockUserForAuth();
        return { req, token };
      },
    })
  );

export const setupMockClient = () =>
  createTestClient(
    new ApolloServer({
      typeDefs: [DIRECTIVES, typeDefs],
      mocks,
      mockEntireSchema: true,
    })
  );
