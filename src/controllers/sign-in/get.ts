import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';
import qs from 'query-string';

import { UserDocument } from 'db/schema';

import { LinkedInContactInfo, LinkedinEndpoints, LinkedinUser } from 'types/linkedin';
import type { User } from 'types/types';

import { linkedinHeaders } from 'utils/linkedin-headers';
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
          return res.clearCookie('token').json({ user: null });
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

        let email;

        try {
          email = (
            await axios.get<LinkedInContactInfo>(LinkedinEndpoints.CONTACT_INFO, linkedinHeaders(accessToken))
          ).data.elements?.find(({ type }) => type === 'EMAIL')?.['handle~']?.emailAddress;
        } finally {
          user = {
            _id: new Types.ObjectId(createDbUserId(linkedinUser.id)),
            initials: linkedinUser.localizedFirstName[0] + linkedinUser.localizedLastName[0],
            name: `${linkedinUser.localizedFirstName} ${linkedinUser.localizedLastName}`,
            profilePicture: linkedinUser.profilePicture['displayImage~'].elements[2].identifiers[0].identifier,
            ...(email && { email }),
          };
        }
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

      return saveToken(req, res, signToken(user._id.toString())).redirect(process.env.CLIENT);
    }
    // user needs to be directed to linkedin auth page
    default: {
      const redirectUrl = encodeURIComponent(endpoint);
      const url = LinkedinEndpoints.CODE.replace('{clientId}', clientId).replace('{redirectUrl}', redirectUrl);
      return res.redirect(url);
    }
  }
}
