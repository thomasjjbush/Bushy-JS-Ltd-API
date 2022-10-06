import request from 'supertest';

import { CommentDocument, LikeDocument } from 'db/schema';

import { app } from '../../../..';

describe('getMore', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each`
    content       | model
    ${'comments'} | ${CommentDocument}
    ${'likes'}    | ${LikeDocument}
  `('should return correct data for more $content', async ({ content, model }) => {
    model.populate.mockResolvedValue(content);

    const res = await request(app).get(`/project/footle/more/${content}?skip=10`);

    expect(model.find).toHaveBeenCalledTimes(1);
    expect(model.find).toHaveBeenCalledWith({ project: 'footle' });
    expect(model.sort).toHaveBeenCalledTimes(1);
    expect(model.sort).toHaveBeenCalledWith({ date: 'desc' });
    expect(model.skip).toHaveBeenCalledTimes(1);
    expect(model.skip).toHaveBeenCalledWith(10);
    expect(model.limit).toHaveBeenCalledTimes(1);
    expect(model.limit).toHaveBeenCalledWith(5);

    expect(res.body[content]).toBe(content);
    expect(res.body.skipped).toBe(10);
  });

  it('should default skip to 0', async () => {
    await request(app).get(`/project/footle/more/comments`);

    expect((CommentDocument as any).skip).toHaveBeenCalledTimes(1);
    expect((CommentDocument as any).skip).toHaveBeenCalledWith(0);
  });

  it('should return 400 if "Invalid request"', async () => {
    const res = await request(app).get(`/project/footle/more/invalid?skip=10`);

    expect(res.body.message).toBe('Invalid request');
    expect(res.body.status).toBe(400);
    expect(res.statusCode).toBe(400);
  });

  it('should return 503 if "Database service is unavailable"', async () => {
    (LikeDocument as any).populate.mockRejectedValueOnce('e');

    const res = await request(app).get(`/project/footle/more/likes`);
    expect(res.body.message).toBe('Database service is unavailable');
    expect(res.body.status).toBe(503);
    expect(res.statusCode).toBe(503);
  });
});
