import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import path from 'path';

import { CommentDocument, LikeDocument } from 'db/schema';

import type { ContentfulProject } from 'types/contentful';

import { useGraphql } from 'utils/graphql';
import { verifyToken } from 'utils/token';

async function populateComments(Model: typeof CommentDocument, project: string) {
  return (await Model.find({ project }).populate('author').limit(5).sort({ date: 'desc' })) ?? [];
}

async function populateLikes(Model: typeof LikeDocument, project: string) {
  return (await Model.find({ project }).populate('author').limit(5).sort({ date: 'desc' })) ?? [];
}

export async function getProject(req: Request, res: Response, next: NextFunction) {
  let projects: ContentfulProject[];
  let hasLiked = false;

  try {
    ({
      projects: { items: projects },
    } = await useGraphql<ContentfulProject>({
      client: res.locals.graphqlClient,
      path: path.resolve(__dirname, './../../../graphql-queries/project.graphql'),
      variables: { locale: req.query.locale, slug: req.params.slug },
    }));
  } catch {
    return next(
      createHttpError(
        503,
        `Project "${req.params.slug}" failed to load due to an issue with Contentful (CMS provider). Sorry!`,
      ),
    );
  }

  if (!projects || !projects.length) {
    return next(
      createHttpError(
        404,
        `Project "${req.params.slug}" does not exist. Are you sure you're looking for "${req.params.slug}"?`,
      ),
    );
  }

  try {
    if (req.cookies.token) {
      const userId = await verifyToken(req.cookies.token);

      if (userId) {
        hasLiked = Boolean(await LikeDocument.exists({ author: userId, project: req.params.slug }));
      }
    }
  } catch {
    hasLiked = false;
  }

  try {
    const project = {
      ...projects[0],
      commentCount: await CommentDocument.countDocuments({ project: req.params.slug }),
      comments: await populateComments(CommentDocument, req.params.slug),
      gallery: projects[0].gallery.items,
      hasLiked,
      likeCount: await LikeDocument.countDocuments({ project: req.params.slug }),
      likes: await populateLikes(LikeDocument, req.params.slug),
      responsibilities: projects[0].responsibilities.items,
      tags: projects[0].tags.items,
    };
    return res.json({ project });
  } catch {
    return next(
      createHttpError(503, `Project "${req.params.slug}" failed to load due to an issue with our database. Sorry!`),
    );
  }
}
