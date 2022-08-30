import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import path from 'path';

import { LikeDocument } from 'db/schema';

import type { ContentfulProject } from 'types/contentful';

import { useGraphql } from 'utils/graphql';

export async function postLike(req: Request, res: Response, next: NextFunction) {
  let projects: ContentfulProject[];

  try {
    ({
      projects: { items: projects },
    } = await useGraphql<ContentfulProject>({
      client: res.locals.graphqlClient,
      path: path.resolve(__dirname, './../../../../graphql-queries/project-slug.graphql'),
      variables: { slug: req.params.slug },
    }));
  } catch (e) {
    return next(createHttpError(503, 'Contentful service is unavailable'));
  }

  if (!projects || !projects.length) {
    return next(createHttpError(404, 'Project does not exist'));
  }

  try {
    const alreadyLiked = await LikeDocument.findOne({ author: res.locals.id, project: req.params.slug });

    if (alreadyLiked) {
      return next(createHttpError(403, 'User has already liked project'));
    }
  } catch {
    return next(createHttpError(503, 'Database service is unavailable'));
  }

  try {
    const like = await LikeDocument.create({
      author: res.locals.id,
      project: req.params.slug,
    });
    return res.json({ like });
  } catch {
    return next(createHttpError(503, 'Database service is unavailable'));
  }
}
