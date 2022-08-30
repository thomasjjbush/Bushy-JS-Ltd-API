import request from 'supertest';

import { CommentDocument, UserDocument } from 'db/schema';

import { token } from 'testing/variables';

import { app } from '../../../../..';

describe('DELETE /project/:slug/comment/:id', () => {
  it('should return 401 if no token is present', async () => {
    const res = await request(app).delete('/project/project-slug/comment/comment-id');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Insufficient permissions');
    expect(res.body.status).toBe(401);
  });

  describe('authorized', () => {
    (UserDocument.findById as jest.Mock).mockResolvedValue('user-exists');

    it('should return correct response', async () => {
      (CommentDocument.findById as jest.Mock).mockResolvedValue({
        author: {
          toString: jest.fn().mockReturnValue('user-id'),
        },
      });

      const res = await request(app).delete('/project/project-slug/comment/comment-id').set('Cookie', token);

      expect(CommentDocument.findById).toHaveBeenCalledTimes(1);
      expect(CommentDocument.findById).toHaveBeenCalledWith('comment-id');
      expect(CommentDocument.findByIdAndDelete).toHaveBeenCalledTimes(1);
      expect(CommentDocument.findByIdAndDelete).toHaveBeenCalledWith('comment-id');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Comment deleted');
    });

    it('should return 404 if "Comment does not exist"', async () => {
      (CommentDocument.findById as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete('/project/project-slug/comment/comment-id').set('Cookie', token);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Comment does not exist');
      expect(res.body.status).toBe(404);
    });

    it('should return 401 if user is not comment author', async () => {
      (CommentDocument.findById as jest.Mock).mockResolvedValueOnce({
        author: {
          toString: jest.fn().mockReturnValue('incorrect-user-id'),
        },
      });

      const res = await request(app).delete('/project/project-slug/comment/comment-id').set('Cookie', token);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Insufficient permissions');
      expect(res.body.status).toBe(401);
    });

    it('should return 503 if "Database service is unavailable"', async () => {
      (CommentDocument.findById as jest.Mock).mockRejectedValueOnce('error');

      const res = await request(app).delete('/project/project-slug/comment/comment-id').set('Cookie', token);

      expect(res.statusCode).toBe(503);
      expect(res.body.message).toBe('Database service is unavailable');
      expect(res.body.status).toBe(503);
    });
  });
});
