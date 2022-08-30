import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { LikeDocument } from 'db/schema';

import type { Like } from 'types/types';

export async function deleteLike(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await LikeDocument.findById<Like>(req.params.id);

    if (!comment) {
      return next(createHttpError(404, 'Like does not exist'));
    }

    if (comment.author.toString() !== res.locals.id) {
      return next(createHttpError(401, 'Insufficient permissions'));
    }

    await LikeDocument.findByIdAndDelete(req.params.id);

    return res.json({ message: 'Like deleted' });
  } catch {
    return next(createHttpError(503, 'Database service is unavailable'));
  }
}
