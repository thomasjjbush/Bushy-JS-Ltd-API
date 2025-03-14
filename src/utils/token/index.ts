import type { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export function signToken(id: string): string {
  return jwt.sign({ id }, process.env.JWT_SECRET);
}

export async function verifyToken(token: string): Promise<string | null> {
  if (!token) {
    return null;
  }
  try {
    return ((await jwt.verify(token, process.env.JWT_SECRET)) as JwtPayload).id;
  } catch {
    return null;
  }
}

export function saveToken(req: Request, res: Response, token: string): Response {
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + 365 * 24 * 60 * 60 * 1000);

  res.cookie('token', token, {
    expires: expiryDate,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });

  return res;
}
