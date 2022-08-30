import type { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';

import { UserDocument } from 'db/schema';

import { verifyToken } from 'utils/token';

export async function auth(req: Request, res: Response, next: NextFunction) {
  const id = await verifyToken(req.cookies.token);

  if (!id) {
    return next(createHttpError(401, 'Insufficient permissions'));
  }

  const user = await UserDocument.findById(id);
  if (!user) {
    return next(createHttpError(401, 'Insufficient permissions'));
  }

  res.locals.id = id;
  next();
}
