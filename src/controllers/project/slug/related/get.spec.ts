import qs from 'query-string';
import request from 'supertest';

import { graphqlArgs } from 'testing/variables';

import { useGraphql } from 'utils/graphql';

import { app } from '../../../..';

const query = {
  client: 'mock-client',
  tag: 'mock-tag',
};

(useGraphql as jest.Mock).mockResolvedValue({
  sameClient: { items: ['same-client'] },
  sameTag: { items: ['same-tag'] },
});

describe('GET /project/:slug/related', () => {
  it.each`
    key
    ${'client'}
    ${'tag'}
  `('should return 400 if required $key is missing', async ({ key }) => {
    const res = await request(app).get('/project/mock-project/related?' + qs.stringify({ ...query, [key]: undefined }));

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid request. Client, Slug & Tag are all required');
    expect(res.body.status).toBe(400);
  });

  it('should return related projects', async () => {
    const res = await request(app).get('/project/mock-project/related?' + qs.stringify(query));

    expect(useGraphql).toHaveBeenCalledTimes(1);
    expect(useGraphql).toHaveBeenCalledWith({
      ...graphqlArgs,
      path: './../../../../graphql-queries/project-related.graphql',
      variables: {
        client: query.client,
        locale: 'en',
        slug: 'mock-project',
        tag: query.tag,
      },
    });

    expect(res.body).toEqual({
      sameClient: ['same-client'],
      sameTag: ['same-tag'],
    });
  });

  it('should return 503 if graphql request fails', async () => {
    (useGraphql as jest.Mock).mockRejectedValueOnce('e');

    const res = await request(app).get('/project/mock-project/related?' + qs.stringify(query));

    expect(res.statusCode).toBe(503);
    expect(res.body.message).toBe('Contentful service is unavailable');
    expect(res.body.status).toBe(503);
  });
});
