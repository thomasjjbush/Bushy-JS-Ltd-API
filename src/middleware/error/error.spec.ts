import createHttpError from 'http-errors';
import { createRequest, createResponse } from 'node-mocks-http';

import { catchError } from './';

describe('catchError', () => {
  it('should apply correct status code and message', () => {
    const error = createHttpError(404, 'Error message');
    const req = createRequest();
    const res = createResponse();
    catchError(error, req, res, jest.fn());

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toMatchObject({ message: 'Error message', status: 404 });
  });
});
