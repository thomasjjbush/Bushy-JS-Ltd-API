import jwt from 'jsonwebtoken';
import { createResponse } from 'node-mocks-http';

import { saveToken, signToken, verifyToken } from './';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('new-token'),
  verify: jest.fn().mockReturnValue({ id: 'id' }),
}));

describe('token', () => {
  describe('signToken', () => {
    it('should pass correct parameters and return new token', () => {
      const subject = signToken('id');
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({ id: 'id' }, 'JWT_SECRET');
      expect(subject).toBe('new-token');
    });
  });

  describe('verifyToken', () => {
    it('should return null if no token is provided', async () => {
      expect(await verifyToken('')).toBeNull();
    });

    it('should pass correct parameters and return users id', async () => {
      const subject = await verifyToken('token');
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith('token', 'JWT_SECRET');
      expect(subject).toBe('id');
    });

    it('should return null if token cannot be verified', async () => {
      (jwt.verify as jest.Mock).mockRejectedValueOnce('invalid token');
      expect(await verifyToken('token')).toBeNull();
    });
  });

  describe('saveToken', () => {
    it('should apply the correct http only cookie to response', () => {
      const res = createResponse();

      saveToken(res, 'token');
      expect(res.cookies.token).toMatchObject({
        options: { httpOnly: true, secure: true },
        value: 'token',
      });
    });
  });
});
