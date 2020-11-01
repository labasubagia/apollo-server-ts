import { ApolloServer } from 'apollo-server';
import { DIRECTIVES } from '@graphql-codegen/typescript-mongodb';
import environment from './environment';
import resolvers from './resolvers';
import typeDefs from './type-defs';
import MongoDbProvider from './mongo/provider';

(async function bootstrapAsync(): Promise<void> {
  const provider = new MongoDbProvider(
    environment.mongodb.url,
    environment.mongodb.dbName
  );
  await provider.connectAsync();

  const server = new ApolloServer({
    typeDefs: [DIRECTIVES, typeDefs],
    resolvers: resolvers(provider),
    context: async ({ req }) => {
      const authHeader = req.headers.authorization || 'Bearer ';
      const token = authHeader.split(' ')[1];
      const user = await provider.usersAction.getSingleUserByJwtToken(token);
      return { req, token, user };
    },
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
      provider.closeAsync();
    });
  }
})();
