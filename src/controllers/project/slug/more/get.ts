import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { CommentDocument, LikeDocument } from 'db/schema';

export async function getMore(req: Request, res: Response, next: NextFunction) {
  const { content, slug: project } = req.params;
  const { skip = 0 } = req.query;

  try {
    switch (content) {
      case 'comments': {
        const comments = await CommentDocument.find({ project })
          .sort({ date: 'desc' })
          .skip(Number(skip))
          .limit(5)
          .populate('author');
        return res.json({ comments, skipped: Number(skip) });
      }
      case 'likes': {
        const likes = await LikeDocument.find({ project })
          .sort({ date: 'desc' })
          .skip(Number(skip))
          .limit(5)
          .populate('author');
        return res.json({ likes, skipped: Number(skip) });
      }
      default:
        return next(createHttpError(400, 'Invalid request'));
    }
  } catch (e) {
    return next(createHttpError(503, 'Database service is unavailable'));
  }
}
