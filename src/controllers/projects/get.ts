import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import path from 'path';

import { CommentDocument, LikeDocument } from 'db/schema';

import type { ContentfulProject } from 'types/contentful';

import { useGraphql } from 'utils/graphql';

export async function getProjects(req: Request, res: Response, next: NextFunction) {
  let contentfulProjects: ContentfulProject[];
  let total: number;

  try {
    ({
      projects: { items: contentfulProjects, total },
    } = await useGraphql<ContentfulProject>({
      client: res.locals.graphqlClient,
      path: path.resolve(__dirname, './../../graphql-queries/projects.graphql'),
      variables: { skip: Number(req.query.skip) || 0 },
    }));
  } catch (e) {
    return next(createHttpError(503, 'Contentful service is unavailable'));
  }

  try {
    const projects = await Promise.all(
      contentfulProjects.map(async (contentfulProject: ContentfulProject) => ({
        ...contentfulProject,
        commentCount: await CommentDocument.countDocuments({ project: contentfulProject.slug }),
        description: contentfulProject.description.substring(0, 75).trim() + '...',
        likeCount: await LikeDocument.countDocuments({ project: contentfulProject.slug }),
      })),
    );

    return res.json({ projects, total });
  } catch (e) {
    return next(createHttpError(503, 'Database service is unavailable'));
  }
}
