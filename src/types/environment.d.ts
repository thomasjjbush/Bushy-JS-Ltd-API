export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CONTENTFUL_ACCESS_TOKEN: string;
      JWT_SECRET: string;
      LINKEDIN_CLIENT_ID: string;
      LINKEDIN_CLIENT_SECRET: string;
      MONGO_DB_PASSWORD: string;
    }
  }
}
