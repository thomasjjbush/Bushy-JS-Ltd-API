import type { Request, Response, NextFunction } from 'express';
import { GraphQLClient } from 'graphql-request';

import { ContentfulEndpoints } from 'types/contentful';

const graphqlClient = new GraphQLClient(ContentfulEndpoints.GRAPHQL, {
  headers: {
    Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
  },
});

export function graphqlMiddleware(req: Request, res: Response, next: NextFunction) {
  res.locals.graphqlClient = graphqlClient;
  next();
}
