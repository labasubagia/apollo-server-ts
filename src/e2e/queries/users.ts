import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';

export const FRAGMENT_USER_FOLLOW_COUNT: DocumentNode = gql`
  fragment fragmentUserFollowCount on User {
    followingCount
  }
`;

export const FOLLOW_USER: DocumentNode = gql`
  mutation followUser($userId: ID!) {
    user: followUser(userId: $userId) {
      ...fragmentUserFollowCount
    }
  }
  ${FRAGMENT_USER_FOLLOW_COUNT}
`;

export const UNFOLLOW_USER: DocumentNode = gql`
  mutation unFollowUser($userId: ID!) {
    user: unFollowUser(userId: $userId) {
      ...fragmentUserFollowCount
    }
  }
  ${FRAGMENT_USER_FOLLOW_COUNT}
`;
