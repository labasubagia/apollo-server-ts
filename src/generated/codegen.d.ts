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
  id?: Maybe<Scalars['ID']>;
  username?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['EmailAddress']>;
  posts?: Maybe<Array<Post>>;
  postCount?: Maybe<Scalars['UnsignedInt']>;
  following?: Maybe<Array<User>>;
  followingCount?: Maybe<Scalars['UnsignedInt']>;
  followers?: Maybe<Array<User>>;
  followerCount?: Maybe<Scalars['UnsignedInt']>;
};

export type Post = {
  __typename?: 'Post';
  id?: Maybe<Scalars['ID']>;
  title?: Maybe<Scalars['String']>;
  content?: Maybe<Scalars['String']>;
  author?: Maybe<User>;
  publishedAt?: Maybe<Scalars['DateTime']>;
  likedBy?: Maybe<Array<User>>;
  likeCount?: Maybe<Scalars['UnsignedInt']>;
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
  order?: Maybe<Scalars['Int']>;
};

export type QueryGetPostArgs = {
  id: Scalars['ID'];
};

export type QueryGetUserArgs = {
  id: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  publishPost?: Maybe<Post>;
  likePost?: Maybe<Post>;
  register?: Maybe<Scalars['String']>;
  login?: Maybe<Scalars['String']>;
  followUser?: Maybe<User>;
  unFollowUser?: Maybe<User>;
};

export type MutationPublishPostArgs = {
  input: PublishPostInput;
};

export type MutationLikePostArgs = {
  postId: Scalars['ID'];
};

export type MutationRegisterArgs = {
  input: RegisterInput;
};

export type MutationLoginArgs = {
  input: LoginInput;
};

export type MutationFollowUserArgs = {
  userId: Scalars['ID'];
};

export type MutationUnFollowUserArgs = {
  userId: Scalars['ID'];
};

export type PublishPostInput = {
  title: Scalars['String'];
  content: Scalars['String'];
};

export type RegisterInput = {
  username: Scalars['String'];
  password: Scalars['String'];
  email: Scalars['String'];
};

export type LoginInput = {
  username: Scalars['String'];
  password: Scalars['String'];
};

export type AdditionalEntityFields = {
  path?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

import { ObjectID } from 'mongodb';
export type UserDbObject = {
  _id?: Maybe<ObjectID>;
  username?: Maybe<string>;
  email?: string;
  following?: Maybe<Array<UserDbObject['_id']>>;
};

export type PostDbObject = {
  _id?: Maybe<ObjectID>;
  title?: Maybe<string>;
  content?: Maybe<string>;
  author?: Maybe<UserDbObject['_id']>;
  publishedAt?: string;
  likedBy?: Maybe<Array<UserDbObject['_id']>>;
};
