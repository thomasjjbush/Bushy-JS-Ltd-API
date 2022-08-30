import type { GraphQLClient } from 'graphql-request';

declare module 'express' {
  export interface Response {
    locals: {
      graphqlClient: GraphQLClient;
      id: string;
    };
  }
}
