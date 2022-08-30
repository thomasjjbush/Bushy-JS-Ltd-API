import request from 'supertest';

import { LikeDocument, UserDocument } from 'db/schema';

import { graphqlArgs, token } from 'testing/variables';

import { useGraphql } from 'utils/graphql';

import { app } from '../../../..';

(useGraphql as jest.Mock).mockResolvedValue({ projects: { items: [{ slug: 'project-slug' }] } });

describe('POST /project/:slug/like/:id', () => {
  it('should return 401 if no token is present', async () => {
    const res = await request(app).post('/project/project-slug/like');

    expect(res.body.message).toBe('Insufficient permissions');
    expect(res.body.status).toBe(401);
    expect(res.statusCode).toBe(401);
  });

  describe('authorized', () => {
    (UserDocument.findById as jest.Mock).mockResolvedValue('user-exists');
    (LikeDocument.findOne as jest.Mock).mockResolvedValue(null);

    it('should return correct response', async () => {
      const res = await request(app).post('/project/project-slug/like').set('Cookie', token);

      const expectedLike = { author: 'user-id', project: 'project-slug' };

      expect(useGraphql).toHaveBeenCalledTimes(1);
      expect(useGraphql).toHaveBeenCalledWith({
        ...graphqlArgs,
        path: './../../../../graphql-queries/project-slug.graphql',
        variables: { slug: 'project-slug' },
      });

      expect(LikeDocument.create).toHaveBeenCalledTimes(1);
      expect(LikeDocument.create).toHaveBeenCalledWith(expectedLike);

      expect(res.statusCode).toBe(200);
      expect(res.body.like).toEqual(expectedLike);
    });

    it('should return 403 if "User has already liked project"', async () => {
      (LikeDocument.findOne as jest.Mock).mockResolvedValueOnce('already-liked');

      const res = await request(app).post('/project/project-slug/like').set('Cookie', token);

      expect(res.body.message).toBe('User has already liked project');
      expect(res.body.status).toBe(403);
      expect(res.statusCode).toBe(403);
    });

    it('should return 503 if "Contentful service is unavailable"', async () => {
      (useGraphql as jest.Mock).mockRejectedValueOnce('error');

      const res = await request(app).post('/project/project-slug/like').set('Cookie', token);

      expect(res.body.message).toBe('Contentful service is unavailable');
      expect(res.body.status).toBe(503);
      expect(res.statusCode).toBe(503);
    });

    it('should return 404 if project does not exist', async () => {
      (useGraphql as jest.Mock).mockResolvedValueOnce({ projects: { items: null } });

      const res = await request(app).post('/project/project-slug/like').set('Cookie', token);

      expect(res.body.message).toBe('Project does not exist');
      expect(res.body.status).toBe(404);
      expect(res.statusCode).toBe(404);
    });

    it('should return 503 if "Database service is unavailable"', async () => {
      (LikeDocument.findOne as jest.Mock).mockRejectedValueOnce('error');

      const res = await request(app).post('/project/project-slug/like').set('Cookie', token);

      expect(res.body.message).toBe('Database service is unavailable');
      expect(res.body.status).toBe(503);
      expect(res.statusCode).toBe(503);
    });

    it('should return 503 if "Database service is unavailable"', async () => {
      (LikeDocument.create as jest.Mock).mockRejectedValueOnce('error');

      const res = await request(app).post('/project/project-slug/like').set('Cookie', token);

      expect(res.body.message).toBe('Database service is unavailable');
      expect(res.body.status).toBe(503);
      expect(res.statusCode).toBe(503);
    });
  });
});
