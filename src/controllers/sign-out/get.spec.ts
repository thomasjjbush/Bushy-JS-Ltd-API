import request from 'supertest';

import { app } from '../..';

describe('GET /sign-out', () => {
  it('should return correct response', async () => {
    const res = await request(app).get('/sign-out');

    expect(res.statusCode).toBe(200);
    expect(res.headers['set-cookie']).toEqual(['token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly']);
    expect(res.body.message).toBe('token destroyed');
  });
});
