import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';
import { createRequest, createResponse } from 'node-mocks-http';
import qs from 'query-string';

import { UserDocument } from 'db/schema';

import { postComment } from 'controllers/project/slug/comment/post';
import { postLike } from 'controllers/project/slug/like/post';

import { LinkedinEndpoints, LinkedinUser } from 'types/linkedin';
import type { User } from 'types/types';

import { linkedinHeaders } from 'utils/linkedin-headers';
import { decodeState, encodeState } from 'utils/sign-in-state';
import { saveToken, signToken, verifyToken } from 'utils/token';
import { createDbUserId } from 'utils/user-id';

export async function signIn(req: Request, res: Response, next: NextFunction) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const endpoint = qs.parseUrl(`${req.protocol}://${req.headers.host}${req.originalUrl}/`).url as string;

  switch (true) {
    // user has existing token
    case Boolean(req.cookies.token || req.query.persist): {
      const id = await verifyToken(req.cookies.token);

      if (id) {
        try {
          const user = await UserDocument.findById(id);
          if (user) {
            return res.json({ user });
          }
          res.clearCookie('token', { httpOnly: true, path: '/', secure: process.env.NODE_ENV === 'production' });
          res.json({ user: null });
          return res;
        } catch {
          return next(createHttpError(503, 'Contentful service is unavailable'));
        }
      }
      return res.clearCookie('token').json({ user: null });
    }
    // user has been redirected from linkedin auth page
    case Boolean(req.query.code): {
      let accessToken: string;
      let user: User;

      try {
        const code = req.query.code as string;
        const grantType = 'authorization_code';

        ({
          data: { access_token: accessToken },
        } = await axios.post<{ access_token: string; expires_in: number }>(
          LinkedinEndpoints.ACCESS_TOKEN,
          qs.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: grantType,
            redirect_uri: endpoint,
          }),
          linkedinHeaders(),
        ));
      } catch {
        return next(createHttpError(503, 'Linkedin token service in unavailable'));
      }

      try {
        const { data: linkedinUser } = await axios.get<LinkedinUser>(
          LinkedinEndpoints.ME,
          linkedinHeaders(accessToken),
        );

        user = {
          _id: new Types.ObjectId(createDbUserId(linkedinUser.sub)),
          email: linkedinUser.email,
          initials: linkedinUser.given_name[0] + linkedinUser.family_name[0],
          name: linkedinUser.name,
          profilePicture: linkedinUser.picture,
        };
      } catch {
        return next(createHttpError(503, 'Linkedin profile service in unavailable'));
      }

      try {
        const existingUser = await UserDocument.findById(user._id);

        if (existingUser) {
          await UserDocument.findByIdAndUpdate(user._id, user);
        } else {
          await UserDocument.create(user);
        }
      } catch (e) {
        return next(createHttpError(503, 'Database service is unavailable'));
      }

      if (typeof req.query.state === 'string') {
        const state = decodeState(req.query.state);

        if (state?.action === 'comment') {
          if (state.comment) {
            await postComment(
              createRequest({
                body: { comment: state.comment },
                params: { slug: state.slug },
              }),
              createResponse({
                locals: { graphqlClient: res.locals.graphqlClient, id: user._id },
              }),
              (e) => console.warn('Failed to leave comment, continuing sign-in', e),
            );
          }

          return saveToken(req, res, signToken(user._id.toString())).redirect(
            process.env.CLIENT + '/project/' + state.slug + '?commenting=true',
          );
        }

        if (state?.action === 'like') {
          await postLike(
            createRequest({
              params: { slug: state.slug },
            }),
            createResponse({
              locals: { graphqlClient: res.locals.graphqlClient, id: user._id },
            }),
            (e) => console.warn('Failed to like, continuing sign-in', e),
          );

          if (state.fromProjectPage) {
            return saveToken(req, res, signToken(user._id.toString())).redirect(
              process.env.CLIENT + '/project/' + state.slug,
            );
          }
        }
      }

      return saveToken(req, res, signToken(user._id.toString())).redirect(process.env.CLIENT);
    }
    // user needs to be directed to linkedin auth page
    default: {
      const redirectUrl = encodeURIComponent(endpoint);
      const url = new URL(LinkedinEndpoints.CODE.replace('{clientId}', clientId).replace('{redirectUrl}', redirectUrl));

      const { action, comment = '', fromProjectPage, slug } = req.query;
      if (typeof slug === 'string') {
        if (action === 'comment' && typeof comment === 'string') {
          url.searchParams.append('state', encodeState({ action, comment, slug }));
        }
        if (action === 'like') {
          url.searchParams.append(
            'state',
            encodeState({ action, fromProjectPage: Boolean(Number(fromProjectPage)), slug }),
          );
        }
      }

      return res.redirect(url.toString());
    }
  }
}
