import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { LikeDocument } from 'db/schema';

import { EventTypes, Like } from 'types/types';

import EventFactory from 'utils/events/events';

export async function deleteLike(req: Request, res: Response, next: NextFunction) {
  try {
    const like = await LikeDocument.findOne<Like>({ author: res.locals.id, project: req.params.slug });

    if (!like) {
      return next(createHttpError(404, 'Like does not exist'));
    }

    await LikeDocument.findByIdAndDelete(like._id);

    EventFactory.emit(EventTypes.DELETE_LIKE, like);

    return res.json({ message: 'Like deleted' });
  } catch {
    return next(createHttpError(503, 'Database service is unavailable'));
  }
}
