import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import path from 'path';

import { CommentDocument, LikeDocument } from 'db/schema';

import type { ContentfulProject } from 'types/contentful';

import { useGraphql } from 'utils/graphql';

async function populateComments(Model: typeof CommentDocument, project: string) {
  return (await Model.find({ project }).populate('author').limit(10).sort({ date: 'asc' })) ?? [];
}

async function populateLikes(Model: typeof LikeDocument, project: string) {
  return (await Model.find({ project }).populate('author').limit(10).sort({ date: 'asc' })) ?? [];
}

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
      comments: await populateComments(CommentDocument, req.params.slug),
      likeCount: await LikeDocument.countDocuments({ project: req.params.slug }),
      likes: await populateLikes(LikeDocument, req.params.slug),
    };
    return res.json({ project });
  } catch {
    return next(createHttpError(503, 'Database service is unavailable'));
  }
}
