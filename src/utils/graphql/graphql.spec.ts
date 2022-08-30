import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadDocuments } from '@graphql-tools/load';

import { useGraphql } from './';

jest.unmock('./');
jest.unmock('path');
jest.mock('@graphql-tools/load', () => ({ loadDocuments: jest.fn().mockResolvedValue([{ rawSDL: 'rawSDL' }]) }));

describe('useGraphql', () => {
  let client: any;

  beforeEach(() => {
    client = { request: jest.fn() };
  });

  it('should invoke loadDocuments and client.request with correct args', async () => {
    await useGraphql({ client, path: 'path', variables: { variable: true } });

    expect(loadDocuments).toHaveBeenCalledTimes(1);
    expect(loadDocuments).toHaveBeenCalledWith('path', { loaders: [new GraphQLFileLoader()] });
    expect(client.request).toHaveBeenCalledTimes(1);
    expect(client.request).toHaveBeenCalledWith('rawSDL', { variable: true });
  });

  it('should throw an error if no query document is found', async () => {
    (loadDocuments as jest.Mock).mockResolvedValueOnce([{ rawSDL: null }]);

    expect.assertions(2);
    try {
      await useGraphql({ client, path: 'path' });
    } catch (e: any) {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toBe('Failed to get query document');
    }
  });
});
