export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ADMIN_EMAIL_RECIPIENT: string;
      CLIENT: string;
      CONTENTFUL_ACCESS_TOKEN: string;
      EMAIL_SMTP_PASSWORD: string;
      EMAIL_SMTP_USER: string;
      JWT_SECRET: string;
      LINKEDIN_CLIENT_ID: string;
      LINKEDIN_CLIENT_SECRET: string;
      MONGO_DB_PASSWORD: string;
      SERVER: string;
    }
  }
}
