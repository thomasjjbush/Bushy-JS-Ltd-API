import { createDbUserId } from '.';

describe('createDbUserId', () => {
  it('should return a compatible 12 digit ID', () => {
    expect(createDbUserId('mock')).toBe('mock________');
  });
});
