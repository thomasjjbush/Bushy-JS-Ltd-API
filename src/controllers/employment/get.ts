import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import path from 'path';

import type { ContentfulEmployment } from 'types/contentful';

import { useGraphql } from 'utils/graphql';

export async function getEmployment(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      employment: { items: employment, total },
    } = await useGraphql<ContentfulEmployment>({
      client: res.locals.graphqlClient,
      path: path.resolve(__dirname, './../../graphql-queries/employment.graphql'),
      variables: {
        locale: req.query.locale,
      },
    });
    return res.json({ employment, total });
  } catch (e) {
    return next(createHttpError(503, 'Contentful service is unavailable'));
  }
}
