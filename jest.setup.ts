process.env.CONTENTFUL_ACCESS_TOKEN = 'CONTENTFUL_ACCESS_TOKEN';
process.env.JWT_SECRET = 'JWT_SECRET';
process.env.LINKEDIN_CLIENT_ID = 'LINKEDIN_CLIENT_ID';
process.env.LINKEDIN_CLIENT_SECRET = 'LINKEDIN_CLIENT_SECRET';
process.env.MONGO_DB_PASSWORD = 'MONGO_DB_PASSWORD';
process.env.EMAIL_SMTP_PASSWORD = 'EMAIL_SMTP_PASSWORD';
process.env.EMAIL_SMTP_USER = 'EMAIL_SMTP_USER';
process.env.ADMIN_EMAIL_RECIPIENT = 'ADMIN_EMAIL_RECIPIENT';
process.env.CLIENT = 'CLIENT';

jest.mock('mongoose', () => ({
  Types: {
    ...jest.requireActual('mongoose').Schema.Types,
  },
  connect: jest.fn().mockResolvedValue(true),
}));
jest.mock('path', () => ({ ...jest.requireActual('path'), resolve: jest.fn((_, path) => path) }));
jest.mock('utils/graphql', () => ({ useGraphql: jest.fn() }));
jest.mock('utils/events/events', () => ({
  emit: jest.fn(),
}));

jest.mock('db/schema', () => ({
  CommentDocument: {
    countDocuments: jest.fn().mockResolvedValue(20),
    create: jest.fn((args) => args),
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  },
  LikeDocument: {
    countDocuments: jest.fn().mockResolvedValue(20),
    create: jest.fn((args) => args),
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  },
  UserDocument: {
    create: jest.fn((args) => args),
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  },
}));
