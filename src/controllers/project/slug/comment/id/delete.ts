import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { CommentDocument } from 'db/schema';

import type { Comment } from 'types/types';

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

    return res.json({ message: 'Comment deleted' });
  } catch {
    return next(createHttpError(503, 'Database service is unavailable'));
  }
}
