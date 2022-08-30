import { GraphQLClient } from 'graphql-request';
import { createRequest, createResponse } from 'node-mocks-http';

import { graphqlMiddleware } from './';

jest.mock('graphql-request', () => ({ GraphQLClient: jest.fn() }));

describe('graphql', () => {
  it('should attach graphql client to req.locals and invoke next', () => {
    const res = createResponse();
    const next = jest.fn();

    graphqlMiddleware(createRequest(), res, next);

    expect(GraphQLClient).toHaveBeenCalledTimes(1);
    expect(GraphQLClient).toHaveBeenCalledWith(
      'https://graphql.contentful.com/content/v1/spaces/e85zpqq4b2pc/environments/master',
      { headers: { Authorization: 'Bearer CONTENTFUL_ACCESS_TOKEN' } },
    );

    expect(res.locals.graphqlClient).toEqual({});
    expect(next).toHaveBeenCalledTimes(1);
  });
});
