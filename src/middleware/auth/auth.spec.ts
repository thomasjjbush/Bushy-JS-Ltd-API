import type { NextFunction, Request, Response } from 'express';
import { Unauthorized } from 'http-errors';
import { createRequest, createResponse } from 'node-mocks-http';

import { UserDocument } from 'db/schema';

import { auth } from './';

jest.mock('utils/token', () => ({ verifyToken: jest.fn((t: string) => (t === 'token' ? 'id' : null)) }));

describe('auth', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = createRequest();
    res = createResponse();
    next = jest.fn();
  });

  it('should throw a PERMISSIONS error if no token is present', async () => {
    await auth(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(new Unauthorized('Insufficient permissions'));
  });

  it('should throw a PERMISSIONS error if no user is found in db', async () => {
    (UserDocument.findById as jest.Mock).mockResolvedValueOnce(null);
    req.cookies = { token: 'token' };

    await auth(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(new Unauthorized('Insufficient permissions'));
  });

  it('should add user id to locals and invoke next if valid user', async () => {
    req.cookies = { token: 'token' };

    await auth(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(res.locals.id).toBe('id');
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });
});
