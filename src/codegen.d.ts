export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  EmailAddress: any;
  UnsignedInt: any;
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  email?: Maybe<Scalars['EmailAddress']>;
  posts?: Maybe<Array<Post>>;
  postCount: Scalars['UnsignedInt'];
  following?: Maybe<Array<User>>;
  followingCount: Scalars['UnsignedInt'];
  followers?: Maybe<Array<User>>;
  followerCount: Scalars['UnsignedInt'];
};

export type Post = {
  __typename?: 'Post';
  id: Scalars['ID'];
  title: Scalars['String'];
  content: Scalars['String'];
  author: User;
  publishedAt: Scalars['DateTime'];
  likedBy?: Maybe<Array<User>>;
  likeCount: Scalars['UnsignedInt'];
};

export type Query = {
  __typename?: 'Query';
  getPosts: Array<Post>;
  getPost?: Maybe<Post>;
  getUser?: Maybe<User>;
};

export type QueryGetPostsArgs = {
  first: Scalars['Int'];
  page?: Maybe<Scalars['Int']>;
};

export type QueryGetPostArgs = {
  id: Scalars['ID'];
};

export type QueryGetUserArgs = {
  id: Scalars['ID'];
};

export type PublishPostInput = {
  title: Scalars['String'];
  content: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  publishPost?: Maybe<Post>;
  followUser?: Maybe<User>;
  unFollowUser?: Maybe<User>;
  likePost?: Maybe<Post>;
};

export type MutationPublishPostArgs = {
  input: PublishPostInput;
};

export type MutationFollowUserArgs = {
  userId: Scalars['ID'];
};

export type MutationUnFollowUserArgs = {
  userId: Scalars['ID'];
};

export type MutationLikePostArgs = {
  postId: Scalars['ID'];
};

export type AdditionalEntityFields = {
  path?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

import { ObjectID } from 'mongodb';
export type UserDbObject = {
  _id: ObjectID;
  firstName: string;
  lastName: string;
  email?: string;
  following?: Maybe<Array<UserDbObject['_id']>>;
};

export type PostDbObject = {
  _id: ObjectID;
  title: string;
  content: string;
  author: UserDbObject['_id'];
  publishedAt: Date;
  likedBy?: Maybe<Array<UserDbObject['_id']>>;
};
