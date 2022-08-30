import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import path from 'path';

import { CommentDocument } from 'db/schema';

import type { ContentfulProject } from 'types/contentful';

import { useGraphql } from 'utils/graphql';

export async function postComment(req: Request, res: Response, next: NextFunction) {
  let projects: ContentfulProject[];

  if (!req.params.slug || !req.body.comment) {
    return next(createHttpError(400, 'Invalid request'));
  }

  try {
    ({
      projects: { items: projects },
    } = await useGraphql<ContentfulProject>({
      client: res.locals.graphqlClient,
      path: path.resolve(__dirname, './../../../../graphql-queries/project-slug.graphql'),
      variables: { slug: req.params.slug },
    }));
  } catch {
    return next(createHttpError(503, 'Contentful service is unavailable'));
  }

  if (!projects || !projects.length) {
    return next(createHttpError(404, 'Project does not exist'));
  }

  try {
    const comment = await CommentDocument.create({
      author: res.locals.id,
      comment: req.body.comment,
      project: req.params.slug,
    });
    return res.json({ comment });
  } catch {
    return next(createHttpError(503, 'Database service is unavailable'));
  }
}
