import type { Request, Response } from 'express';

export async function signOut(req: Request, res: Response) {
  return res.clearCookie('token').json({ message: 'token destroyed' });
}
