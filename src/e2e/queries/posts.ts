import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';

export const FRAGMENT_POST: DocumentNode = gql`
  fragment fragmentPost on Post {
    content
    title
    publishedAt
    author {
      email
      username
    }
  }
`;

export const FRAGMENT_POST_IN_LIST: DocumentNode = gql`
  fragment fragmentPostInList on Post {
    content
    title
    publishedAt
  }
`;

export const FRAGMENT_POST_CREATE: DocumentNode = gql`
  fragment fragmentPostCreate on Post {
    title
    content
  }
`;

export const QUERY_GET_PAGINATE_POST: DocumentNode = gql`
  query getPosts($first: Int!, $page: Int, $order: Int) {
    posts: getPosts(first: $first, page: $page, order: $order) {
      ...fragmentPostInList
    }
  }
  ${FRAGMENT_POST_IN_LIST}
`;

export const QUERY_GET_POST: DocumentNode = gql`
  query getPost($id: ID!) {
    post: getPost(id: $id) {
      ...fragmentPost
    }
  }
  ${FRAGMENT_POST}
`;

export const MUTATION_PUBLISH_POST: DocumentNode = gql`
  mutation publishPost($input: PublishPostInput!) {
    post: publishPost(input: $input) {
      ...fragmentPostCreate
    }
  }
  ${FRAGMENT_POST_CREATE}
`;

export const MUTATION_LIKE_POST: DocumentNode = gql`
  mutation likePost($postId: ID!) {
    post: likePost(postId: $postId) {
      likeCount
    }
  }
`;
