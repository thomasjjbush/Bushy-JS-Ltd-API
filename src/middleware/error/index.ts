import type { Request, Response, NextFunction } from 'express';
import type { HttpError } from 'http-errors';

export async function catchError(error: HttpError, req: Request, res: Response, next: NextFunction) {
  return res.status(error.status).json({ message: error.message, status: error.status });
}
