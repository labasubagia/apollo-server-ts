import { DocumentNode } from 'graphql';

export interface ClientMutation<T> {
  mutation: DocumentNode;
  variables: T;
}
