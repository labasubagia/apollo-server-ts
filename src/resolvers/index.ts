import {
  DateTimeResolver,
  EmailAddressResolver,
  UnsignedIntResolver,
} from 'graphql-scalars';
import MongoDbProvider from '../mongo/provider';
import postsResolver from './posts';
import usersResolver from './users';

const resolver = (provider: MongoDbProvider) => {
  const postResolver = postsResolver(provider);
  const userResolver = usersResolver(provider);

  return {
    // Custom Scalar
    DateTime: DateTimeResolver,
    EmailAddress: EmailAddressResolver,
    UnsignedInt: UnsignedIntResolver,

    // Type
    Post: postResolver.Post,
    User: userResolver.User,

    Query: {
      ...postResolver.Query,
      ...userResolver.Query,
    },

    Mutation: {
      ...postResolver.Mutation,
      ...userResolver.Mutation,
    },
  };
};

export default resolver;
