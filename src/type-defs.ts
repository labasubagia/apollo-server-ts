import { gql } from 'apollo-server';

export default gql`
  scalar DateTime
  scalar EmailAddress
  scalar UnsignedInt

  type User @entity {
    id: ID @id
    username: String @column
    email: EmailAddress @column(overrideType: "string")
    posts: [Post!]
    postCount: UnsignedInt
    following: [User!] @link
    followingCount: UnsignedInt
    followers: [User!]
    followerCount: UnsignedInt
  }

  type Post @entity {
    id: ID @id
    title: String @column
    content: String @column
    author: User @link
    publishedAt: DateTime @column(overrideType: "string")
    likedBy: [User!] @link
    likeCount: UnsignedInt
  }

  type Query {
    getPosts(first: Int!, page: Int = 1, order: Int = 1): [Post!]!
    getPost(id: ID!): Post
    getUser(id: ID!): User
  }

  type Mutation {
    publishPost(input: PublishPostInput!): Post
    likePost(postId: ID!): Post
    register(input: RegisterInput!): String
    login(input: LoginInput!): String
    followUser(userId: ID!): User
    unFollowUser(userId: ID!): User
  }

  input PublishPostInput {
    title: String!
    content: String!
  }

  input RegisterInput {
    username: String!
    password: String!
    email: String!
  }

  input LoginInput {
    username: String!
    password: String!
  }
`;
