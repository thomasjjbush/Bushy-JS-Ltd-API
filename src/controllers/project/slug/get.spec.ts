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
        gallery: { items: [{ url: 'gallery-url' }] },
        hero: {
          url: 'hero-url',
        },
        name: 'project-name',
        primaryTag: {
          name: 'primary-tag-name',
          slug: 'primary-tag-slug',
        },
        responsibilities: {
          items: [
            {
              description: 'responsibility-description',
              icon: 'responsibility-icon',
              name: 'responsibility-name',
            },
          ],
        },
        slug: 'project-slug',
        tags: {
          items: [],
        },
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

const mockLikes = [
  {
    author: {
      initials: 'AN',
      name: 'author-name',
      profilePicture: 'author-profile-picture',
    },
    date: 'like-date',
    project: 'like-project',
  },
];

(useGraphql as jest.Mock).mockResolvedValue(mock);

(CommentDocument as any).sort.mockResolvedValue(mockComments);
(LikeDocument as any).sort.mockResolvedValue(mockLikes);

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
    expect((CommentDocument as any).sort).toHaveBeenCalledWith({ date: 'desc' });

    expect(LikeDocument.find).toHaveBeenCalledTimes(1);
    expect(LikeDocument.find).toHaveBeenCalledWith({ project: 'footle' });
    expect(LikeDocument.populate).toHaveBeenCalledTimes(1);
    expect(LikeDocument.populate).toHaveBeenCalledWith('author');
    expect((LikeDocument as any).limit).toHaveBeenCalledTimes(1);
    expect((LikeDocument as any).limit).toHaveBeenCalledWith(5);
    expect((LikeDocument as any).sort).toHaveBeenCalledTimes(1);
    expect((LikeDocument as any).sort).toHaveBeenCalledWith({ date: 'desc' });

    expect(res.statusCode).toBe(200);
    expect(res.body.project).toEqual({
      ...mock.projects.items[0],
      commentCount: 20,
      comments: mockComments,
      gallery: mock.projects.items[0].gallery.items,
      likeCount: 20,
      likes: mockLikes,
      responsibilities: mock.projects.items[0].responsibilities.items,
      tags: mock.projects.items[0].tags.items,
    });
  });

  it('should return 503 if "Contentful service is unavailable"', async () => {
    (useGraphql as jest.Mock).mockRejectedValueOnce('error');

    const res = await request(app).get('/project/footle');
    expect(res.statusCode).toBe(503);
    expect(res.body.message).toBe(
      'Project "footle" failed to load due to an issue with Contentful (CMS provider). Sorry!',
    );
    expect(res.body.status).toBe(503);
  });

  it('should return 404 if "Project does not exist"', async () => {
    (useGraphql as jest.Mock).mockResolvedValueOnce({ projects: { items: [] } });

    const res = await request(app).get('/project/footle');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Project "footle" does not exist. Are you sure you\'re looking for "footle"?');
    expect(res.body.status).toBe(404);
  });

  it('should return 503 if "Database service is unavailable"', async () => {
    (CommentDocument as any).sort.mockRejectedValueOnce('error');

    const res = await request(app).get('/project/footle');
    expect(res.statusCode).toBe(503);
    expect(res.body.message).toBe('Project "footle" failed to load due to an issue with our database. Sorry!');
    expect(res.body.status).toBe(503);
  });

  it('should default comments and likes to an empty array if comment/likes collection is nullish', async () => {
    (CommentDocument as any).sort.mockResolvedValueOnce(null);
    (LikeDocument as any).sort.mockResolvedValueOnce(null);

    const res = await request(app).get('/project/footle');
    expect(res.statusCode).toBe(200);
    expect(res.body.project).toEqual({
      ...mock.projects.items[0],
      commentCount: 20,
      comments: [],
      gallery: mock.projects.items[0].gallery.items,
      likeCount: 20,
      likes: [],
      responsibilities: mock.projects.items[0].responsibilities.items,
      tags: mock.projects.items[0].tags.items,
    });
  });
});
