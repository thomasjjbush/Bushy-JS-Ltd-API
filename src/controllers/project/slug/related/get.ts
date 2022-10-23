import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import path from 'path';

import type { ContentfulProject, ContentfulResponse } from 'types/contentful';

import { useGraphql } from 'utils/graphql';

export async function getRelated(req: Request, res: Response, next: NextFunction) {
  const { slug } = req.params;
  const { client, locale = 'en', tag } = req.query;

  if (!client || !slug || !tag) {
    return next(createHttpError(400, 'Invalid request. Client, Slug & Tag are all required'));
  }

  try {
    const { sameClient, sameTag } = await useGraphql<{
      sameClient: ContentfulResponse<ContentfulProject[]>;
      sameTag: ContentfulResponse<ContentfulProject[]>;
    }>({
      client: res.locals.graphqlClient,
      path: path.resolve(__dirname, './../../../../graphql-queries/project-related.graphql'),
      variables: {
        client,
        locale,
        slug,
        tag,
      },
    });

    return res.json({
      sameClient: sameClient.items,
      sameTag: sameTag.items,
    });
  } catch {
    return next(createHttpError(503, 'Contentful service is unavailable'));
  }
}
