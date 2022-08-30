import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadDocuments } from '@graphql-tools/load';
import type { GraphQLClient, Variables } from 'graphql-request';

import type { ContentfulResponse } from 'types/contentful';

interface Params {
  client: GraphQLClient;
  path: string;
  variables?: Variables;
}

export async function useGraphql<T>({ client, path, variables }: Params): Promise<ContentfulResponse<T>> {
  const [{ rawSDL: query }] = await loadDocuments(path, { loaders: [new GraphQLFileLoader()] });

  if (!query) {
    throw new Error('Failed to get query document');
  }

  return client.request<ContentfulResponse<T>>(query, variables);
}
