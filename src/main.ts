import { ApolloServer } from 'apollo-server';

import environment from './environment';
import resolvers from './resolvers';
import typeDefs from './type-defs';
import mocks from './mocks';

const server = new ApolloServer({
  resolvers,
  typeDefs,
  introspection: environment.apollo.introspection,
  playground: environment.apollo.playground,
  mocks, // TODO: Remove in PROD
  mockEntireSchema: true, // TODO Remove in PROD
});

server
  .listen(environment.port)
  .then(({ url }) => console.log(`Server ready at ${url}`));

// Webpack HMR
if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => console.log('Module disposed.'));
}
