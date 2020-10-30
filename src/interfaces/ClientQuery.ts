import { DocumentNode } from 'graphql';

export interface ClientQuery<T> {
  query: DocumentNode;
  variables: T;
}
