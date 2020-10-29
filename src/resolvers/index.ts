import {
  DateTimeResolver,
  EmailAddressResolver,
  UnsignedIntResolver,
} from 'graphql-scalars';
import postResolver from './posts';
import userResolver from './users';

export default {
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
