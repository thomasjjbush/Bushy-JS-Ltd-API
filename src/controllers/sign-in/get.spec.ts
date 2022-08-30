import axios from 'axios';
import { Types } from 'mongoose';
import qs from 'query-string';
import request from 'supertest';

import { UserDocument } from 'db/schema';

import { token } from 'testing/variables';

import { app } from '../..';

jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({
    data: {
      id: 'linkedinid',
      localizedFirstName: 'first',
      localizedLastName: 'last',
      profilePicture: {
        'displayImage~': {
          elements: [{}, {}, { identifiers: [{ identifier: 'profile-picture' }] }],
        },
      },
    },
  }),
  post: jest.fn().mockResolvedValue({ data: { access_token: 'linkedin-access-token' } }),
}));

jest.mock('query-string', () => ({
  ...jest.requireActual('query-string'),
  parseUrl: jest.fn().mockReturnValue({ url: 'redirect-url' }),
}));

describe('GET /sign-in', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('token cookie is present', () => {
    it('should return user', async () => {
      (UserDocument.findById as jest.Mock).mockResolvedValueOnce('user');

      const res = await request(app).get('/sign-in').set('Cookie', token);

      expect(UserDocument.findById).toHaveBeenCalledTimes(1);
      expect(UserDocument.findById).toHaveBeenCalledWith('user-id');

      expect(res.body.user).toBe('user');
      expect(res.statusCode).toBe(200);
    });

    it('should clear token and return null if token is invalid', async () => {
      const res = await request(app).get('/sign-in').set('Cookie', ['token=invalid-token']);
      expect(res.body.user).toBe(null);
      expect(res.headers['set-cookie']).toEqual(['token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT']);
      expect(res.statusCode).toBe(200);
    });

    it('should clear token and return null if token is valid but user does not exist in db', async () => {
      (UserDocument.findById as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/sign-in').set('Cookie', token);
      expect(res.body.user).toBe(null);
      expect(res.headers['set-cookie']).toEqual(['token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT']);
      expect(res.statusCode).toBe(200);
    });

    it('should return 503 if "Contentful service is unavailable"', async () => {
      (UserDocument.findById as jest.Mock).mockRejectedValueOnce('error');

      const res = await request(app).get('/sign-in').set('Cookie', token);
      expect(res.body.message).toBe('Contentful service is unavailable');
      expect(res.body.status).toBe(503);
      expect(res.statusCode).toBe(503);
    });
  });

  describe('user has been redirected from linkedin auth page (code query param is present)', () => {
    it('should return user', async () => {
      (UserDocument.findById as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/sign-in?code=linkedin-code');

      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        'https://www.linkedin.com/oauth/v2/accessToken',
        qs.stringify({
          client_id: 'LINKEDIN_CLIENT_ID',
          client_secret: 'LINKEDIN_CLIENT_SECRET',
          code: 'linkedin-code',
          grant_type: 'authorization_code',
          redirect_uri: 'redirect-url',
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams))',
        { headers: { authorization: 'Bearer linkedin-access-token' } },
      );

      expect(UserDocument.findById).toHaveBeenCalledTimes(1);
      expect(UserDocument.findById).toHaveBeenCalledWith(expect.any(Types.ObjectId));

      expect(UserDocument.create).toHaveBeenCalledTimes(1);
      expect(UserDocument.create).toHaveBeenCalledWith({
        _id: expect.any(Types.ObjectId),
        initials: 'fl',
        name: 'first last',
        profilePicture: 'profile-picture',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toEqual({
        _id: expect.any(String),
        initials: 'fl',
        name: 'first last',
        profilePicture: 'profile-picture',
      });
      expect(res.headers['set-cookie'][0]).toMatch(/token=(.*); Path=\/; HttpOnly/);
    });

    it('should update existing user in db if already exists', async () => {
      (UserDocument.findById as jest.Mock).mockResolvedValueOnce({});

      await request(app).get('/sign-in?code=linkedin-code');

      expect(UserDocument.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(UserDocument.findByIdAndUpdate).toHaveBeenCalledWith(expect.any(Types.ObjectId), {
        _id: expect.any(Types.ObjectId),
        initials: 'fl',
        name: 'first last',
        profilePicture: 'profile-picture',
      });
      expect(UserDocument.create).not.toHaveBeenCalled();
    });

    it('should return 503 if "Linkedin token service in unavailable"', async () => {
      (axios.post as jest.Mock).mockRejectedValueOnce('error');

      const res = await request(app).get('/sign-in?code=linkedin-code');
      expect(res.body.message).toBe('Linkedin token service in unavailable');
      expect(res.body.status).toBe(503);
      expect(res.statusCode).toBe(503);
    });

    it('should return 503 if "Linkedin profile service in unavailable"', async () => {
      (axios.get as jest.Mock).mockRejectedValueOnce('error');

      const res = await request(app).get('/sign-in?code=linkedin-code');
      expect(res.body.message).toBe('Linkedin profile service in unavailable');
      expect(res.body.status).toBe(503);
      expect(res.statusCode).toBe(503);
    });

    it('should return 503 if "Database service is unavailable"', async () => {
      (UserDocument.findById as jest.Mock).mockRejectedValueOnce('error');

      const res = await request(app).get('/sign-in?code=linkedin-code');
      expect(res.body.message).toBe('Database service is unavailable');
      expect(res.body.status).toBe(503);
      expect(res.statusCode).toBe(503);
    });
  });

  describe('user needs to be redirected to linkedin', () => {
    it('should redirect user to linkedin auth page', async () => {
      const res = await request(app).get('/sign-in');
      expect(res.headers.location).toBe(
        'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=LINKEDIN_CLIENT_ID&redirect_uri=redirect-url&scope=r_emailaddress,r_liteprofile',
      );
    });
  });
});
