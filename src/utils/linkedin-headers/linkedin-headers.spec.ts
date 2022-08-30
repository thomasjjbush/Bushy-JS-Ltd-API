import { linkedinHeaders } from './';

describe('linkedinHeaders', () => {
  it('should only return authorization header if token is provided', () => {
    const subject = linkedinHeaders('access-token');
    expect(subject).toMatchObject({ headers: { authorization: 'Bearer access-token' } });
  });

  it('should only return content type header if token is not provided', () => {
    const subject = linkedinHeaders();
    expect(subject).toMatchObject({ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  });
});
