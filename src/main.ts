import { ApolloServer } from 'apollo-server';
import { DIRECTIVES } from '@graphql-codegen/typescript-mongodb';
import environment from './environment';
import resolvers from './resolvers';
import typeDefs from './type-defs';
import { addMockUserAsync, mongoDbProvider } from './mongo/provider';

(async function bootstrapAsync(): Promise<void> {
  await mongoDbProvider.connectAsync(environment.mongodb.dbName);
  await addMockUserAsync();

  const server = new ApolloServer({
    typeDefs: [DIRECTIVES, typeDefs],
    resolvers,
    introspection: environment.apollo.introspection,
    playground: environment.apollo.playground,
  });

  server
    .listen(environment.port)
    .then(({ url }) => console.log(`Server ready at ${url}`));

  // Webpack HMR
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => {
      console.log('Module disposed.');
      mongoDbProvider.closeAsync();
    });
  }
})();
