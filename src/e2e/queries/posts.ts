import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';

export const FRAGMENT_POST: DocumentNode = gql`
  fragment fragmentPost on Post {
    content
    title
    publishedAt
    author {
      email
      firstName
    }
  }
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
      ...fragmentPost
    }
  }
  ${FRAGMENT_POST}
`;

export const MUTATION_LIKE_POST: DocumentNode = gql`
  mutation likePost($postId: ID!) {
    post: likePost(postId: $postId) {
      likeCount
    }
  }
`;
