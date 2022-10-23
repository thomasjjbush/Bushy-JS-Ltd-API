import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { CommentDocument } from 'db/schema';

import { Comment, EventTypes } from 'types/types';

import EventFactory from 'utils/events/events';

export async function deleteComment(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await CommentDocument.findById<Comment>(req.params.id);

    if (!comment) {
      return next(createHttpError(404, 'Comment does not exist'));
    }

    if (comment.author.toString() !== res.locals.id) {
      return next(createHttpError(401, 'Insufficient permissions'));
    }

    await CommentDocument.findByIdAndDelete(req.params.id);

    EventFactory.emit(EventTypes.DELETE_COMMENT, comment);

    return res.json({ message: 'Comment deleted' });
  } catch {
    return next(createHttpError(503, 'Database service is unavailable'));
  }
}
