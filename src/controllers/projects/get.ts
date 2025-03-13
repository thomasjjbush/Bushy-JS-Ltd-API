import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import path from 'path';

import { CommentDocument, LikeDocument } from 'db/schema';

import type { ContentfulProject } from 'types/contentful';

import { useGraphql } from 'utils/graphql';
import { verifyToken } from 'utils/token';

export async function getProjects(req: Request, res: Response, next: NextFunction) {
  let contentfulProjects: ContentfulProject[];
  let total: number;
  let id: string | null;

  try {
    ({
      projects: { items: contentfulProjects, total },
    } = await useGraphql<ContentfulProject>({
      client: res.locals.graphqlClient,
      path: path.resolve(__dirname, './../../graphql-queries/projects.graphql'),
      variables: { locale: req.query.locale, searchTerm: req.query.searchTerm, skip: Number(req.query.skip) || 0 },
    }));
  } catch (e) {
    return next(createHttpError(503, 'Contentful service is unavailable'));
  }

  try {
    if (req.cookies.token) {
      id = await verifyToken(req.cookies.token);
    }
  } catch {
    id = null;
  }

  try {
    const projects = await Promise.all(
      contentfulProjects.map(async (contentfulProject: ContentfulProject) => ({
        ...contentfulProject,
        commentCount: await CommentDocument.countDocuments({ project: contentfulProject.slug }),
        description: contentfulProject.description.substring(0, 75).trim() + '...',
        hasLiked: Boolean(id) && Boolean(await LikeDocument.exists({ author: id, project: contentfulProject.slug })),
        likeCount: await LikeDocument.countDocuments({ project: contentfulProject.slug }),
      })),
    );

    return res.json({ projects, total });
  } catch (e) {
    return next(createHttpError(503, 'Database service is unavailable'));
  }
}
