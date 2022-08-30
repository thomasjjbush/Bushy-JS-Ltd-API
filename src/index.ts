import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express, { Express } from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';

import { getEmployment } from 'controllers/employment/get';
import { deleteComment } from 'controllers/project/slug/comment/id/delete';
import { postComment } from 'controllers/project/slug/comment/post';
import { getProject } from 'controllers/project/slug/get';
import { deleteLike } from 'controllers/project/slug/like/id/delete';
import { postLike } from 'controllers/project/slug/like/post';
import { getProjects } from 'controllers/projects/get';
import { signIn } from 'controllers/sign-in/get';
import { signOut } from 'controllers/sign-out/get';

import { auth } from 'middleware/auth';
import { catchError } from 'middleware/error';
import { graphqlMiddleware } from 'middleware/graphql';

let app: Express;

(async () => {
  await mongoose.connect(
    `mongodb+srv://tjjb:${process.env.MONGO_DB_PASSWORD}@bushyjsltd.nosraw7.mongodb.net/?retryWrites=true&w=majority`,
  );

  app = express();

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(graphqlMiddleware);

  app.get('/employment', getEmployment);
  app.get('/projects', getProjects);
  app.get('/project/:slug', getProject);
  app.get('/sign-in', signIn);
  app.get('/sign-out', signOut);

  app.post('/project/:slug/comment', auth, postComment);
  app.post('/project/:slug/like', auth, postLike);

  app.delete('/project/:slug/comment/:id', auth, deleteComment);
  app.delete('/project/:slug/like/:id', auth, deleteLike);
  app.use(catchError);

  const server = createServer(app);

  if (process.env.NODE_ENV !== 'test') {
    server.listen(9000);
  }
})();

export { app };
