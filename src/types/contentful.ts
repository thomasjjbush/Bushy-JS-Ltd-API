interface ContentfulAsset {
  title: string;
  url: string;
}

export interface ContentfulClient {
  logo: ContentfulAsset;
  name: string;
  primaryColor: string;
  requiresInverseLogo: boolean;
  secondaryColor: string;
  slug: string;
  url: string;
}

export interface ContentfulEmployment {
  companyName: string;
  endDate: string;
  location: {
    lat: string;
    long: string;
  };
  responsibilities: string;
  startDate: string;
  title: string;
  url: string;
}

export enum ContentfulEndpoints {
  GRAPHQL = 'https://graphql.contentful.com/content/v1/spaces/e85zpqq4b2pc/environments/master',
}

export interface ContentfulProject {
  client: ContentfulClient;
  description: string;
  gallery: { items: ContentfulAsset[]; total: number };
  hero: ContentfulAsset;
  name: string;
  primaryTag: ContentfulTag;
  responsibilities: { items: ContentfulResponsibility[] };
  slug: string;
  tags: { items: ContentfulTag[]; total: number };
  thumbnail: ContentfulAsset;
  video: ContentfulAsset;
  year: number;
}

export interface ContentfulResponse<T> {
  [key: string]: {
    items: T[];
    total: number;
  };
}

interface ContentfulResponsibility {
  description: string;
  icon: string;
  name: string;
}

export interface ContentfulTag {
  name: string;
  slug: string;
}
