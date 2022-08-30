import request from 'supertest';

import { graphqlArgs } from 'testing/variables';

import { useGraphql } from 'utils/graphql';

import { app } from '../..';

const mock = {
  employment: {
    items: [
      {
        companyName: 'employment name',
        endDate: 'employment-end-date',
        location: {
          lat: 'lat',
          long: 'long',
        },
        responsibilities: 'employment responsibilities',
        startDate: 'employment-start-date',
        title: 'employment title',
        url: 'employment-url',
      },
    ],
    total: 1,
  },
};
(useGraphql as jest.Mock).mockResolvedValue(mock);

describe('GET /employment', () => {
  it('should return correct repsonse', async () => {
    const res = await request(app).get('/employment');

    expect(useGraphql).toHaveBeenCalledTimes(1);
    expect(useGraphql).toHaveBeenCalledWith({ ...graphqlArgs, path: './../../graphql-queries/employment.graphql' });

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.employment).toEqual(mock.employment.items);
  });

  it('should return 503 if "Contentful service is unavailable"', async () => {
    (useGraphql as jest.Mock).mockRejectedValueOnce('error');

    const res = await request(app).get('/employment');

    expect(res.statusCode).toBe(503);
    expect(res.body.message).toBe('Contentful service is unavailable');
    expect(res.body.status).toBe(503);
  });
});
