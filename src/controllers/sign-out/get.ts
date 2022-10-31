import type { Request, Response } from 'express';

export async function signOut(req: Request, res: Response) {
  res.clearCookie('token', { httpOnly: true, path: '/', secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'token destroyed' });
  return res;
}
