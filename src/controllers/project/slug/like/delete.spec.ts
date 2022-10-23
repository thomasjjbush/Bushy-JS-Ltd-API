import request from 'supertest';

import { LikeDocument } from 'db/schema';

import { token } from 'testing/variables';

import { EventTypes } from 'types/types';

import EventFactory from 'utils/events/events';

import { app } from '../../../..';

describe('DELETE /project/:slug/like/:id', () => {
  it('should return 401 if no token is present', async () => {
    const res = await request(app).delete('/project/project-slug/like');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Insufficient permissions');
    expect(res.body.status).toBe(401);
  });

  describe('authorized', () => {
    it('should return correct response', async () => {
      (LikeDocument.findOne as jest.Mock).mockResolvedValue({
        _id: 'like-id',
        author: 'author-id',
        project: 'project-slug',
      });

      const res = await request(app).delete('/project/project-slug/like').set('Cookie', token);

      expect(LikeDocument.findOne).toHaveBeenCalledTimes(1);
      expect(LikeDocument.findOne).toHaveBeenCalledWith({ author: 'user-id', project: 'project-slug' });
      expect(LikeDocument.findByIdAndDelete).toHaveBeenCalledTimes(1);
      expect(LikeDocument.findByIdAndDelete).toHaveBeenCalledWith('like-id');

      expect(EventFactory.emit).toHaveBeenCalledTimes(1);
      expect(EventFactory.emit).toBeCalledWith(EventTypes.DELETE_LIKE, {
        _id: 'like-id',
        author: 'author-id',
        project: 'project-slug',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Like deleted');
    });

    it('should return 404 if "Like does not exist"', async () => {
      (LikeDocument.findOne as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete('/project/project-slug/like').set('Cookie', token);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Like does not exist');
      expect(res.body.status).toBe(404);
    });

    it('should return 503 if "Database service is unavailable"', async () => {
      (LikeDocument.findOne as jest.Mock).mockRejectedValueOnce('error');

      const res = await request(app).delete('/project/project-slug/like').set('Cookie', token);

      expect(res.statusCode).toBe(503);
      expect(res.body.message).toBe('Database service is unavailable');
      expect(res.body.status).toBe(503);
    });
  });
});
