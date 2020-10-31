import { DIRECTIVES } from '@graphql-codegen/typescript-mongodb';
import { ApolloServer } from 'apollo-server';
import {
  ApolloServerTestClient,
  createTestClient,
} from 'apollo-server-testing';
import resolvers from '../resolvers';
import typeDefs from '../type-defs';
import mocks from '../mocks';
import { MongoDbProvider } from '../mongo/provider';

export const setupDefaultClient = (
  provider: MongoDbProvider
): ApolloServerTestClient =>
  createTestClient(
    new ApolloServer({
      typeDefs: [DIRECTIVES, typeDefs],
      resolvers: resolvers(provider),
      context: ({ req }) => {
        const authHeader = req?.headers?.authorization || 'Bearer ';
        const token = authHeader.split(' ')[1];
        return { req, token };
      },
    })
  );

export const setupMockClient = (
  provider: MongoDbProvider
): ApolloServerTestClient =>
  createTestClient(
    new ApolloServer({
      typeDefs: [DIRECTIVES, typeDefs],
      resolvers: resolvers(provider),
      mocks,
      mockEntireSchema: true,
    })
  );
