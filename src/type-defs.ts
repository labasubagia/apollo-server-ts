import { gql } from 'apollo-server';

export default gql`
  scalar DateTime
  scalar EmailAddress
  scalar UnsignedInt

  type User @entity {
    id: ID @id
    firstName: String @column
    lastName: String @column
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
    author: User! @link
    publishedAt: DateTime! @column(overrideType: "string")
    likedBy: [User!] @link
    likeCount: UnsignedInt
  }

  type Query {
    getPosts(first: Int!, page: Int = 1): [Post!]!
    getPost(id: ID!): Post
    getUser(id: ID!): User
  }

  input PublishPostInput {
    title: String!
    content: String!
  }

  type Mutation {
    publishPost(input: PublishPostInput!): Post
    followUser(userId: ID!): User
    unFollowUser(userId: ID!): User
    likePost(postId: ID!): Post
  }
`;
