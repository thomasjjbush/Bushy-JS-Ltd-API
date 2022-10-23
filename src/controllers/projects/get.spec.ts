import request from 'supertest';

import { CommentDocument, LikeDocument } from 'db/schema';

import { graphqlArgs } from 'testing/variables';

import { useGraphql } from 'utils/graphql';

import { app } from '../..';

const mock = {
  projects: {
    items: [
      {
        client: {
          logo: {
            title: 'logo-title',
            url: 'logo-url',
          },
          name: 'client-name',
          primaryColor: '#000000',
          requiresInverseLogo: false,
          secondaryColor: '#ffffff',
          slug: 'client-slug',
          url: 'client-url',
        },
        description: 'project description',
        hasLiked: false,
        name: 'project name',
        slug: 'project-slug',
        tags: [
          {
            name: 'Other tag',
            slug: 'other-tag',
          },
        ],
        thumbnail: {
          title: 'thumbnail-title',
          url: 'thumbnail-url',
        },
        year: 2022,
      },
    ],
    total: 1,
  },
};

(useGraphql as jest.Mock).mockResolvedValue(mock);

describe('GET /projects', () => {
  it('should return expected 200', async () => {
    const res = await request(app).get('/projects');

    expect(useGraphql).toHaveBeenCalledTimes(1);
    expect(useGraphql).toHaveBeenCalledWith({
      ...graphqlArgs,
      path: './../../graphql-queries/projects.graphql',
      variables: {
        skip: 0,
      },
    });

    expect(CommentDocument.countDocuments).toHaveBeenCalledTimes(1);
    expect(CommentDocument.countDocuments).toHaveBeenCalledWith({ project: 'project-slug' });
    expect(LikeDocument.countDocuments).toHaveBeenCalledTimes(1);
    expect(LikeDocument.countDocuments).toHaveBeenCalledWith({ project: 'project-slug' });

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.projects).toEqual([
      {
        ...mock.projects.items[0],
        commentCount: 20,
        description: mock.projects.items[0].description + '...',
        likeCount: 20,
      },
    ]);
  });

  it('should return 503 if "Contentful service is unavailable"', async () => {
    (useGraphql as jest.Mock).mockRejectedValueOnce('error');

    const res = await request(app).get('/projects');

    expect(res.statusCode).toBe(503);
    expect(res.body.message).toBe('Contentful service is unavailable');
    expect(res.body.status).toBe(503);
  });

  it('should return 503 if "Database service is unavailable"', async () => {
    (CommentDocument.countDocuments as jest.Mock).mockRejectedValueOnce('error');

    const res = await request(app).get('/projects');

    expect(res.statusCode).toBe(503);
    expect(res.body.message).toBe('Database service is unavailable');
    expect(res.body.status).toBe(503);
  });
});
