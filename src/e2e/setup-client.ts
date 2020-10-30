import { DIRECTIVES } from '@graphql-codegen/typescript-mongodb';
import { Config, ApolloServer } from 'apollo-server';
import {
  ApolloServerTestClient,
  createTestClient,
} from 'apollo-server-testing';
import resolvers from '../resolvers';
import typeDefs from '../type-defs';
import mocks from '../mocks';
import { MongoDbProvider } from '../mongo/provider';

export const setupClient = (config: Config): ApolloServerTestClient => {
  const testApolloServer = new ApolloServer(config);
  return createTestClient(testApolloServer);
};

export const setupDefaultClient = (provider: MongoDbProvider) =>
  setupClient({
    typeDefs: [DIRECTIVES, typeDefs],
    resolvers: resolvers(provider),
  });

export const setupMockClient = (provider: MongoDbProvider) =>
  setupClient({
    typeDefs: [DIRECTIVES, typeDefs],
    resolvers: resolvers(provider),
    mocks,
    mockEntireSchema: true,
  });
