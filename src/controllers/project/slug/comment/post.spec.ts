import request from 'supertest';

import { CommentDocument, UserDocument } from 'db/schema';

import { graphqlArgs, token } from 'testing/variables';

import { EventTypes } from 'types/types';

import EventFactory from 'utils/events/events';
import { useGraphql } from 'utils/graphql';

import { app } from '../../../..';

jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({
    data: {
      censored_content: 'This is a censored comment!',
    },
  }),
}));

(useGraphql as jest.Mock).mockResolvedValue({ projects: { items: [{ slug: 'project-slug' }] } });
(CommentDocument.create as jest.Mock).mockReturnThis();
(CommentDocument.populate as jest.Mock).mockResolvedValue({
  author: 'user-id',
  comment: 'This is a censored comment!',
  project: 'project-slug',
});

describe('POST /project/:slug/comment/:id', () => {
  it('should return 401 if no token is present', async () => {
    const res = await request(app).post('/project/project-slug/comment');

    expect(res.body.message).toBe('Insufficient permissions');
    expect(res.body.status).toBe(401);
    expect(res.statusCode).toBe(401);
  });

  describe('authorized', () => {
    (UserDocument.findById as jest.Mock).mockResolvedValue('user-exists');

    it('should return 400 if no body is provided', async () => {
      const res = await request(app).post('/project/project-slug/comment').set('Cookie', token);

      expect(res.body.message).toBe('Invalid request');
      expect(res.body.status).toBe(400);
      expect(res.statusCode).toBe(400);
    });

    it('should return correct response', async () => {
      const res = await request(app)
        .post('/project/project-slug/comment')
        .set('Cookie', token)
        .send({ comment: 'This is a comment!' });

      const expectedComment = { author: 'user-id', comment: 'This is a censored comment!', project: 'project-slug' };

      expect(useGraphql).toHaveBeenCalledTimes(1);
      expect(useGraphql).toHaveBeenCalledWith({
        ...graphqlArgs,
        path: './../../../../graphql-queries/project-slug.graphql',
        variables: { slug: 'project-slug' },
      });

      expect(CommentDocument.create).toHaveBeenCalledTimes(1);
      expect(CommentDocument.create).toHaveBeenCalledWith(expectedComment);

      expect(EventFactory.emit).toHaveBeenCalledTimes(1);
      expect(EventFactory.emit).toHaveBeenCalledWith(EventTypes.ADD_COMMENT, expectedComment);

      expect(res.statusCode).toBe(200);
      expect(res.body.comment).toEqual(expectedComment);
    });

    it('should return 503 if "Contentful service is unavailable"', async () => {
      (useGraphql as jest.Mock).mockRejectedValueOnce('error');

      const res = await request(app)
        .post('/project/project-slug/comment')
        .set('Cookie', token)
        .send({ comment: 'This is a comment!' });

      expect(res.body.message).toBe('Contentful service is unavailable');
      expect(res.body.status).toBe(503);
      expect(res.statusCode).toBe(503);
    });

    it('should return 404 if project does not exist', async () => {
      (useGraphql as jest.Mock).mockResolvedValueOnce({ projects: { items: null } });

      const res = await request(app)
        .post('/project/project-slug/comment')
        .set('Cookie', token)
        .send({ comment: 'This is a comment!' });

      expect(res.body.message).toBe('Project does not exist');
      expect(res.body.status).toBe(404);
      expect(res.statusCode).toBe(404);
    });

    it('should return 503 if "Database service is unavailable"', async () => {
      (CommentDocument.create as jest.Mock).mockRejectedValueOnce('error');

      const res = await request(app)
        .post('/project/project-slug/comment')
        .set('Cookie', token)
        .send({ comment: 'This is a comment!' });

      expect(res.body.message).toBe('Database service is unavailable');
      expect(res.body.status).toBe(503);
      expect(res.statusCode).toBe(503);
    });
  });
});
