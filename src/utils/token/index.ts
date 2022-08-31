import type { Response } from 'express';
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

export function saveToken(res: Response, token: string): Response {
  res.cookie('token', token, {
    domain: 'localhost',
    httpOnly: true,
    secure: true,
  });

  return res;
}
