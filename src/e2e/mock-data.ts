import {
  MOCK_GRAPHQL_STRING,
  MOCK_GRAPHQL_DATE_TIME,
  MOCK_GRAPHQL_EMAIL,
  MOCK_GRAPHQL_UNSIGNED_INT,
} from '../const/mocks';
import { Post, User } from '../generated/codegen';

// eslint-disable-next-line import/prefer-default-export
export const expectedPost: Post = {
  content: MOCK_GRAPHQL_STRING,
  title: MOCK_GRAPHQL_STRING,
  publishedAt: MOCK_GRAPHQL_DATE_TIME,
  author: {
    email: MOCK_GRAPHQL_EMAIL,
    username: MOCK_GRAPHQL_STRING,
  },
};

export const expectedUserFollow: User = {
  followingCount: MOCK_GRAPHQL_UNSIGNED_INT,
};
