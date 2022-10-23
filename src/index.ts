import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express, { Express } from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import path from 'path';

import { contact } from 'controllers/contact/post';
import { getEmployment } from 'controllers/employment/get';
import { getEvents } from 'controllers/events/get';
import { deleteComment } from 'controllers/project/slug/comment/id/delete';
import { postComment } from 'controllers/project/slug/comment/post';
import { getProject } from 'controllers/project/slug/get';
import { deleteLike } from 'controllers/project/slug/like/delete';
import { postLike } from 'controllers/project/slug/like/post';
import { getMore } from 'controllers/project/slug/more/get';
import { getRelated } from 'controllers/project/slug/related/get';
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

  app.enable('trust proxy');
  app.use(cors({ credentials: true, origin: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(graphqlMiddleware);

  // if (process.env.NODE_ENV !== 'test') {
  app.use('/static', express.static(path.join(__dirname, 'emails/img')));
  // }

  app.get('/employment', getEmployment);
  app.get('/projects', getProjects);
  app.get('/project/:slug', getProject);
  app.get('/project/:slug/more/:content', getMore);
  app.get('/project/:slug/related', getRelated);
  app.get('/sign-in', signIn);
  app.get('/sign-out', signOut);
  app.get('/events/:slug', getEvents);

  app.post('/project/:slug/comment', auth, postComment);
  app.post('/project/:slug/like', auth, postLike);

  app.delete('/project/:slug/like', auth, deleteLike);
  app.delete('/project/:slug/comment/:id', auth, deleteComment);

  app.post('/contact', contact);

  app.use(catchError);

  const server = createServer(app);

  if (process.env.NODE_ENV !== 'test') {
    server.listen(process.env.PORT || 9000);
  }
})();

export { app };
