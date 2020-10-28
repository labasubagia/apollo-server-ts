import {
  MOCK_GRAPHQL_DATE_TIME,
  MOCK_GRAPHQL_EMAIL,
  MOCK_GRAPHQL_FLOAT,
  MOCK_GRAPHQL_INT,
  MOCK_GRAPHQL_STRING,
  MOCK_GRAPHQL_UNSIGNED_INT,
} from './const/mocks';

export default {
  // Builtin scalar
  Int: () => MOCK_GRAPHQL_INT,
  String: () => MOCK_GRAPHQL_STRING,
  Float: () => MOCK_GRAPHQL_FLOAT,

  // Custom scalar
  DateTime: () => MOCK_GRAPHQL_DATE_TIME,
  EmailAddress: () => MOCK_GRAPHQL_EMAIL,
  UnsignedInt: () => MOCK_GRAPHQL_UNSIGNED_INT,
};
