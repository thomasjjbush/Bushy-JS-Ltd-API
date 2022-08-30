import request from 'supertest';

import { CommentDocument, LikeDocument } from 'db/schema';

import { graphqlArgs } from 'testing/variables';

import { useGraphql } from 'utils/graphql';

import { app } from '../../..';

const mock = {
  projects: {
    items: [
      {
        client: {
          logo: {
            url: 'logo-url',
          },
          name: 'client-name',
          primaryColor: 'client-primary-color',
          slug: 'client-slug',
        },
        description: 'project-description',
        gallery: [{ url: 'gallery-url' }],
        hero: {
          url: 'hero-url',
        },
        name: 'project-name',
        primaryTag: {
          name: 'primary-tag-name',
          slug: 'primary-tag-slug',
        },
        responsibilities: [
          {
            description: 'responsibility-description',
            icon: 'responsibility-icon',
            name: 'responsibility-name',
          },
        ],
        slug: 'project-slug',
        video: {
          url: 'video-url',
        },
        year: 1970,
      },
    ],
  },
};

const mockComments = [
  {
    author: {
      initials: 'AN',
      name: 'author-name',
      profilePicture: 'author-profile-picture',
    },
    comment: 'comment',
    date: 'comment-date',
    project: 'comment-project',
  },
];

(useGraphql as jest.Mock).mockResolvedValue(mock);

(CommentDocument as any).sort.mockResolvedValue(mockComments);

describe('GET /project/:slug', () => {
  it('should return correct response', async () => {
    const res = await request(app).get('/project/footle');

    expect(useGraphql).toHaveBeenCalledTimes(1);
    expect(useGraphql).toHaveBeenCalledWith({
      ...graphqlArgs,
      path: './../../../graphql-queries/project.graphql',
      variables: { slug: 'footle' },
    });

    expect(CommentDocument.countDocuments).toHaveBeenCalledTimes(1);
    expect(CommentDocument.countDocuments).toHaveBeenCalledWith({ project: 'footle' });
    expect(LikeDocument.countDocuments).toHaveBeenCalledTimes(1);
    expect(LikeDocument.countDocuments).toHaveBeenCalledWith({ project: 'footle' });

    expect(CommentDocument.find).toHaveBeenCalledTimes(1);
    expect(CommentDocument.find).toHaveBeenCalledWith({ project: 'footle' });
    expect(CommentDocument.populate).toHaveBeenCalledTimes(1);
    expect(CommentDocument.populate).toHaveBeenCalledWith('author');
    expect((CommentDocument as any).limit).toHaveBeenCalledTimes(1);
    expect((CommentDocument as any).limit).toHaveBeenCalledWith(5);
    expect((CommentDocument as any).sort).toHaveBeenCalledTimes(1);
    expect((CommentDocument as any).sort).toHaveBeenCalledWith({ date: 'asc' });

    expect(res.statusCode).toBe(200);
    expect(res.body.project).toEqual({
      ...mock.projects.items[0],
      commentCount: 20,
      comments: mockComments,
      likeCount: 20,
    });
  });

  it('should return 503 if "Contentful service is unavailable"', async () => {
    (useGraphql as jest.Mock).mockRejectedValueOnce('error');

    const res = await request(app).get('/project/footle');
    expect(res.statusCode).toBe(503);
    expect(res.body.message).toBe('Contentful service is unavailable');
    expect(res.body.status).toBe(503);
  });

  it('should return 404 if "Project does not exist"', async () => {
    (useGraphql as jest.Mock).mockResolvedValueOnce({ projects: { items: [] } });

    const res = await request(app).get('/project/footle');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Project does not exist');
    expect(res.body.status).toBe(404);
  });

  it('should return 503 if "Database service is unavailable"', async () => {
    (CommentDocument as any).sort.mockRejectedValueOnce('error');

    const res = await request(app).get('/project/footle');
    expect(res.statusCode).toBe(503);
    expect(res.body.message).toBe('Database service is unavailable');
    expect(res.body.status).toBe(503);
  });

  it('should default comments to an empty array if comment collection is nullish', async () => {
    (CommentDocument as any).sort.mockResolvedValueOnce(null);

    const res = await request(app).get('/project/footle');
    expect(res.statusCode).toBe(200);
    expect(res.body.project).toEqual({
      ...mock.projects.items[0],
      commentCount: 20,
      comments: [],
      likeCount: 20,
    });
  });
});
