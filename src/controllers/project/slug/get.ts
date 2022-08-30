import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import path from 'path';

import { CommentDocument, LikeDocument } from 'db/schema';

import type { ContentfulProject } from 'types/contentful';

import { useGraphql } from 'utils/graphql';

export async function getProject(req: Request, res: Response, next: NextFunction) {
  let projects: ContentfulProject[];

  try {
    ({
      projects: { items: projects },
    } = await useGraphql<ContentfulProject>({
      client: res.locals.graphqlClient,
      path: path.resolve(__dirname, './../../../graphql-queries/project.graphql'),
      variables: { slug: req.params.slug },
    }));
  } catch {
    return next(createHttpError(503, 'Contentful service is unavailable'));
  }

  if (!projects || !projects.length) {
    return next(createHttpError(404, 'Project does not exist'));
  }

  try {
    const project = {
      ...projects[0],
      commentCount: await CommentDocument.countDocuments({ project: req.params.slug }),
      comments:
        (await CommentDocument.find({ project: req.params.slug }).populate('author').limit(5).sort({ date: 'asc' })) ??
        [],
      likeCount: await LikeDocument.countDocuments({ project: req.params.slug }),
    };

    return res.json({ project });
  } catch {
    return next(createHttpError(503, 'Database service is unavailable'));
  }
}
