import type { Request, Response } from 'express';

export async function signOut(req: Request, res: Response) {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'token destroyed' });
  return res;
}
